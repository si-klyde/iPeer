const express = require('express');
const router = express.Router();
const { createEvent, getEvents, updateEvent, deleteEvent } = require('../models/event');

router.post('/add-events', async (req, res) => {
    try {
      console.log('Received event data:', req.body); // Log incoming data
      const result = await createEvent(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: error.message });
    }
  });

router.get('/events', async (req, res) => {
  const events = await getEvents();
  res.json(events);
});

router.put('/:id', async (req, res) => {
  await updateEvent(req.params.id, req.body);
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  await deleteEvent(req.params.id);
  res.json({ success: true });
});

module.exports = router;