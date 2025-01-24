const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsClient, getAppointmentsPeer, rescheduleAppointment } = require('../models/appointment');
const { db } = require('../firebaseAdmin');
const { sendAppointmentConfirmation, sendAppointmentRejection, sendRescheduleNotification, sendRescheduleResponseNotification } = require('../services/emailService');
const { createNotification } = require('../models/notifications');
const { encrypt, decrypt } = require('../utils/encryption.utils');
const { isTimeSlotAvailable, getAvailableTimeSlots } = require('../utils/timeslot');

// Get the appropriate app URL based on environment
const APP_URL = process.env.NODE_ENV === 'production' 
  ? process.env.PROD_APP_URL 
  : process.env.APP_URL;

const checkPeerCounselorAvailability = async (peerCounselorId, date, time) => {
  try {
    const appointmentsRef = db.collection('appointments');
    const existingAppointments = await appointmentsRef
      .where('peerCounselorId', '==', peerCounselorId)
      .where('date', '==', date)
      .where('time', '==', time)
      .get();

    return existingAppointments.empty;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

// Route to create an appointment
router.post('/create-appointment', async (req, res) => {
  const appointmentData = {
    ...req.body,
    status: 'pending'
  };
  
  try {
    const isAvailable = await checkPeerCounselorAvailability(
      appointmentData.peerCounselorId,
      appointmentData.date,
      appointmentData.time
    );

    if (!isAvailable) {
      return res.status(409).send({ 
        error: 'Peer counselor is not available at the selected date and time' 
      });
    }

    const { appointmentId, roomId } = await createAppointment(appointmentData);
    
    const clientDoc = await db.collection('users').doc(appointmentData.clientId).get();
    const counselorDoc = await db.collection('users').doc(appointmentData.peerCounselorId).get();
    
    const clientData = clientDoc.data();
    const counselorData = counselorDoc.data();
    
    const decryptedCounselorName = decrypt(counselorData.fullName);
    const decryptedClientName = decrypt(clientData.fullName);

    // Create notifications for both parties
    await createNotification(appointmentData.clientId, {
      type: 'APPOINTMENT_REQUEST',
      title: 'Appointment Request Sent',
      message: `Your appointment request with ${decryptedCounselorName} for ${appointmentData.date} at ${appointmentData.time} is pending confirmation.`,
      appointmentId
    });

    await createNotification(appointmentData.peerCounselorId, {
      type: 'NEW_APPOINTMENT_REQUEST',
      title: 'New Appointment Request',
      message: `${decryptedClientName} requested an appointment for ${appointmentData.date} at ${appointmentData.time}.`,
      appointmentId
    });
    
    await sendAppointmentConfirmation(
      decrypt(clientData.email),
      decrypt(counselorData.email),
      {
        date: appointmentData.date,
        time: appointmentData.time,
        clientName: decryptedClientName,
        peerCounselorName: decryptedCounselorName,
        roomLink: `${APP_URL}/counseling/${roomId}`
      }
    );

    res.status(201).send({ appointmentId, roomId });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send({ error: 'Error creating appointment' });
  }
});

router.get('/available-slots/:peerCounselorId', async (req, res) => {
  const { peerCounselorId } = req.params;
  const { date } = req.query;
  
  try {
    const availableSlots = await getAvailableTimeSlots(peerCounselorId, date);
    res.status(200).json({ availableSlots });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ error: 'Error fetching available time slots' });
  }
});

// Route to check availability
router.get('/check-availability/:peerCounselorId', async (req, res) => {
  const { peerCounselorId } = req.params;
  const { date, time } = req.query;

  try {
    const isAvailable = await isTimeSlotAvailable(peerCounselorId, date, time);
    res.status(200).json({ available: isAvailable });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Error checking availability' });
  }
});

// Route to get client appointments
router.get('/appointments/client/:clientId', async (req, res) => {
  const { clientId } = req.params;
  try {
    const appointments = await getAppointmentsClient(clientId);
    res.status(200).send(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send({ error: 'Error fetching appointments' });
  }
});

// Route to get peer counselor appointments
router.get('/appointments/peer-counselor/:peerCounselorId', async (req, res) => {
  const { peerCounselorId } = req.params;
  try {
    const appointments = await getAppointmentsPeer(peerCounselorId);
    res.status(200).send(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    // Send a more specific error message
    res.status(500).send({ 
      error: 'Error processing appointment data',
      details: error.message 
    });
  }
});

// Route to check if a user has an appointment on a specific date
router.get('/check-reminders', async (req, res) => {
  try {
    const upcomingAppointments = await getUpcomingAppointments();
    
    for (const appointment of upcomingAppointments) {
      await createReminderNotification(appointment);
      await sendAppointmentReminder(
        decrypt(appointment.clientEmail),
        decrypt(appointment.counselorEmail),
        {
          time: appointment.time,
          clientName: decrypt(appointment.clientName),
          peerCounselorName: decrypt(appointment.peerCounselorName),
          roomLink: `${APP_URL}/counseling/${appointment.roomId}`
        }
      );
    }
    
    res.status(200).json({ message: 'Reminders sent successfully' });
  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

// Route to update appointment status
router.put('/appointments/:appointmentId/status', async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;
  try {
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    await appointmentRef.update({ status });

    // Immediately send response to client
    res.status(200).send({ message: 'Appointment status updated successfully' });

    // Perform email sending in the background
    setImmediate(async () => {
      try {
        // Get appointment and user data
        const updatedAppointment = await appointmentRef.get();
        const appointmentData = updatedAppointment.data();
        
        const [clientDoc, counselorDoc] = await Promise.all([
          db.collection('users').doc(appointmentData.clientId).get(),
          db.collection('users').doc(appointmentData.peerCounselorId).get()
        ]);

        const clientData = clientDoc.data();
        const counselorData = counselorDoc.data();

        const decryptedCounselorName = decrypt(counselorData.fullName);
        const decryptedClientName = decrypt(clientData.fullName);

        if (status === 'accepted') {
          // Create notification for client if it is accepted
          await createNotification(appointmentData.clientId, {
            type: 'APPOINTMENT_ACCEPTED',
            title: 'Appointment Confirmed',
            message: `Your appointment with ${decryptedCounselorName} on ${appointmentData.date} at ${appointmentData.time} has been confirmed.`,
            appointmentId,
            roomId: appointmentData.roomId
          });

          // Send Confirmation email
          await sendAppointmentConfirmation(
            decrypt(clientData.email),
            decrypt(counselorData.email),
            {
              status: 'accepted',
              date: appointmentData.date,
              time: appointmentData.time,
              clientName: decryptedClientName,
              peerCounselorName: decryptedCounselorName,
              roomLink: `${APP_URL}/counseling/${appointmentData.roomId}`
            }
          );
        } else if (status === 'declined') {
          // Create notification for client if it is declined 
          await createNotification(appointmentData.clientId, {
            type: 'APPOINTMENT_DECLINED',
            title: 'Appointment Declined',
            message: `Your appointment request with ${decryptedCounselorName} for ${appointmentData.date} at ${appointmentData.time} was declined.`,
            appointmentId
          });

          // Send rejection email
          await sendAppointmentRejection(
            decrypt(clientData.email),
            decrypt(counselorData.email),
            {
              status: 'declined',
              date: appointmentData.date,
              time: appointmentData.time,
              clientName: decryptedClientName,
              peerCounselorName: decryptedCounselorName
            }
          );
        }
      } catch (backgroundError) {
        console.error('Background email process error:', backgroundError);
        // Optionally log to an error tracking service
      }
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).send({ message: 'Error updating appointment status', error: error.message });
  }
});

router.put('/appointments/:appointmentId/reschedule', async (req, res) => {
  const { appointmentId } = req.params;
  const { newDate, newTime, newDescription } = req.body;
  
  try {
    const result = await rescheduleAppointment(appointmentId, newDate, newTime, newDescription);
    
    // Get appointment and user details
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointment = await appointmentRef.get();
    const appointmentData = appointment.data();
    
    const [clientDoc, counselorDoc] = await Promise.all([
      db.collection('users').doc(appointmentData.clientId).get(),
      db.collection('users').doc(appointmentData.peerCounselorId).get()
    ]);

    const clientData = clientDoc.data();
    const counselorData = counselorDoc.data();

    await sendRescheduleNotification(
      decrypt(clientData.email),
      decrypt(counselorData.email),
      {
        newDate,
        newTime,
        newDescription,
        originalDate: appointmentData.originalDate,
        originalTime: appointmentData.originalTime
      }
    );

    // Create notification for client about reschedule request
    await createNotification(appointmentData.clientId, {
      type: 'APPOINTMENT_RESCHEDULE_REQUEST',
      title: 'Appointment Reschedule Request',
      message: `Your counselor has requested to reschedule your appointment to ${newDate} at ${newTime}`,
      appointmentId,
      requiresAction: true
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing reschedule:', error);
    res.status(500).json({ error: 'Failed to process reschedule request' });
  }
});

router.put('/appointments/:appointmentId/reschedule-response', async (req, res) => {
  const { appointmentId } = req.params;
  const { response } = req.body;
  
  try {
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointment = await appointmentRef.get();
    const appointmentData = appointment.data();

    // Get user details for notifications
    const [clientDoc, counselorDoc] = await Promise.all([
      db.collection('users').doc(appointmentData.clientId).get(),
      db.collection('users').doc(appointmentData.peerCounselorId).get()
    ]);

    const clientData = clientDoc.data();
    const counselorData = counselorDoc.data();

    if (response === 'accept') {
      await appointmentRef.update({
        status: 'accepted',
        updatedAt: new Date()
      });

      // Send confirmation emails
      await sendAppointmentConfirmation(
        decrypt(clientData.email),
        decrypt(counselorData.email),
        {
          status: 'accepted',
          date: appointmentData.date,
          time: appointmentData.time,
          clientName: decrypt(clientData.fullName),
          peerCounselorName: decrypt(counselorData.fullName),
          roomLink: `${APP_URL}/counseling/${appointmentData.roomId}`
        }
      );
    } else {
      await appointmentRef.update({
        status: 'pending',
        date: appointmentData.originalDate,
        description: appointmentData.originalDescription,
        updatedAt: new Date()
      });
    }

    // Create notification for peer counselor
    await createNotification(appointmentData.peerCounselorId, {
      type: 'RESCHEDULE_RESPONSE',
      title: `Reschedule ${response === 'accept' ? 'Accepted' : 'Declined'}`,
      message: `Client has ${response}ed the rescheduled appointment for ${appointmentData.date}`,
      appointmentId
    });

    res.status(200).json({ message: `Reschedule ${response}ed successfully` });
  } catch (error) {
    console.error('Error processing reschedule response:', error);
    res.status(500).json({ error: 'Failed to process reschedule response' });
  }
});

module.exports = router;
