const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments } = require('../models/appointment');

router.post('/create-appointment', async (req, res) => {
  const appointmentData = req.body;
  try {
    const appointmentId = await createAppointment(appointmentData);
    res.status(201).send({ message: 'Appointment created successfully', appointmentId });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send({ error: 'Error creating appointment' });
  }
});

router.get('/appointments/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const appointments = await getAppointments(userId);
    res.status(200).send(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send({ error: 'Error fetching appointments' });
  }
});

module.exports = router;