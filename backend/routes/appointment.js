const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsClient, getAppointmentsPeer } = require('../models/appointment');
const { db } = require('../firebaseAdmin');
const { sendAppointmentConfirmation, sendAppointmentRejection } = require('../services/emailService');
const { createNotification } = require('../models/notifications');

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
    
    // Create notifications for both parties
    await createNotification(appointmentData.clientId, {
      type: 'APPOINTMENT_REQUEST',
      title: 'Appointment Request Sent',
      message: `Your appointment request with ${counselorDoc.data().fullName} for ${appointmentData.date} at ${appointmentData.time} is pending confirmation.`,
      appointmentId
    });

    await createNotification(appointmentData.peerCounselorId, {
      type: 'NEW_APPOINTMENT_REQUEST',
      title: 'New Appointment Request',
      message: `${clientDoc.data().fullName} requested an appointment for ${appointmentData.date} at ${appointmentData.time}.`,
      appointmentId
    });
    
    await sendAppointmentConfirmation(
      clientDoc.data().email,
      counselorDoc.data().email,
      {
        date: appointmentData.date,
        time: appointmentData.time,
        clientName: clientDoc.data().fullName,
        peerCounselorName: counselorDoc.data().fullName,
        roomLink: `http://localhost:5173/counseling/${roomId}`
      }
    );

    res.status(201).send({ appointmentId, roomId });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send({ error: 'Error creating appointment' });
  }
});

// Route to check availability
router.get('/check-availability/:peerCounselorId', async (req, res) => {
  const { peerCounselorId } = req.params;
  const { date, time } = req.query;

  try {
    const isAvailable = await checkPeerCounselorAvailability(peerCounselorId, date, time);
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
    res.status(500).send({ error: 'Error fetching appointments' });
  }
});

// Route to check if a user has an appointment on a specific date
router.get('/check-reminders', async (req, res) => {
  try {
    const upcomingAppointments = await getUpcomingAppointments();
    
    for (const appointment of upcomingAppointments) {
      await createReminderNotification(appointment);
      await sendAppointmentReminder(
        appointment.clientEmail,
        appointment.counselorEmail,
        {
          time: appointment.time,
          clientName: appointment.clientName,
          peerCounselorName: appointment.peerCounselorName,
          roomLink: `http://localhost:5173/counseling/${appointment.roomId}`
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

        if (status === 'accepted') {
          // Create notification for client if it is accepted
          await createNotification(appointmentData.clientId, {
            type: 'APPOINTMENT_ACCEPTED',
            title: 'Appointment Confirmed',
            message: `Your appointment with ${counselorData.fullName} on ${appointmentData.date} at ${appointmentData.time} has been confirmed.`,
            appointmentId,
            roomId: appointmentData.roomId
          });

          // Send Confirmation email
          await sendAppointmentConfirmation(
            clientData.email,
            counselorData.email,
            {
              status: 'accepted',
              date: appointmentData.date,
              time: appointmentData.time,
              clientName: clientData.fullName,
              peerCounselorName: counselorData.fullName,
              roomLink: `http://localhost:5173/counseling/${appointmentData.roomId}`
            }
          );
        } else if (status === 'declined') {
          // Create notification for client if it is declined 
          await createNotification(appointmentData.clientId, {
            type: 'APPOINTMENT_DECLINED',
            title: 'Appointment Declined',
            message: `Your appointment request with ${counselorData.fullName} for ${appointmentData.date} at ${appointmentData.time} was declined.`,
            appointmentId
          });

          // Send rejection email
          await sendAppointmentRejection(
            clientData.email,
            counselorData.email,
            {
              status: 'declined',
              date: appointmentData.date,
              time: appointmentData.time,
              clientName: clientData.fullName,
              peerCounselorName: counselorData.fullName
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

module.exports = router;
