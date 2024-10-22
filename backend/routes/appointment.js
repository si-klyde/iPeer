const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsClient, getAppointmentsPeer } = require('../models/appointment');
const { db } = require('../firebaseAdmin');

// Function to check peer counselor availability
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
  const appointmentData = req.body;
  try {
    // Check availability before creating appointment
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
    res.status(201).send({ message: 'Appointment created successfully', appointmentId, roomId });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send({ error: 'Error creating appointment' });
  }
});

// Route to check availability for a peer counselor
router.get('/check-availability/:peerCounselorId', async (req, res) => {
  const { peerCounselorId } = req.params;
  const { date, time } = req.query;
  
  try {
    const isAvailable = await checkPeerCounselorAvailability(peerCounselorId, date, time);
    res.status(200).send({ available: isAvailable });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).send({ error: 'Error checking availability' });
  }
});

router.get('/appointments/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const appointments = await getAppointmentsClient(userId);
    res.status(200).send(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send({ error: 'Error fetching appointments' });
  }
});

// Route to get appointments for a specific peer counselor
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
module.exports = router;