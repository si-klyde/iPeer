const express = require('express');
const router = express.Router();
const { auth } = require('../firebaseAdmin');
const { createEvent, getEvents, updateEvent, deleteEvent, getAllEvents } = require('../models/event');

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

  router.get('/events/all', async (req, res) => {
    const events = await getAllEvents();
    res.json(events);
  });

  router.get('/events', async (req, res) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decodedToken = await auth.verifyIdToken(token);
        const counselorId = decodedToken.uid;
        
        const events = await getEvents(counselorId);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
  try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
          return res.status(401).json({ message: 'No token provided' });
      }

      const decodedToken = await auth.verifyIdToken(token);
      const counselorId = decodedToken.uid;
      
      // Check if event belongs to this counselor
      const eventDoc = await db.collection('events').doc(req.params.id).get();
      if (!eventDoc.exists || eventDoc.data().counselorId !== counselorId) {
          return res.status(403).json({ message: 'Not authorized to edit this event' });
      }

      await updateEvent(req.params.id, req.body);
      res.json({ success: true });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  await deleteEvent(req.params.id);
  res.json({ success: true });
});

module.exports = router;