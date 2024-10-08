const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsClient, getAppointmentsPeer } = require('../models/appointment');

router.post('/create-appointment', async (req, res) => {
  const appointmentData = req.body;
  try {
    const { appointmentId, roomId } = await createAppointment(appointmentData);
    res.status(201).send({ message: 'Appointment created successfully', appointmentId, roomId });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send({ error: 'Error creating appointment' });
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