const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebaseAdmin');
const { createEvent, getEvents, updateEvent, deleteEvent, getAllEvents } = require('../models/event');

router.post('/add-events', async (req, res) => {
  try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
          return res.status(401).json({ message: 'No token provided' });
      }

      const decodedToken = await auth.verifyIdToken(token);
      const counselorId = decodedToken.uid;
      
      // Get counselor's data and validate
      const counselorDoc = await db.collection('users').doc(counselorId).get();
      if (!counselorDoc.exists) {
          return res.status(404).json({ message: 'Counselor profile not found' });
      }

      const counselorData = counselorDoc.data();
      if (!counselorData.school) {
          return res.status(400).json({ message: 'Counselor school not set' });
      }

      const eventData = {
          ...req.body,
          counselorId,
          school: counselorData.school,
          createdAt: new Date()
      };

      // Remove any undefined values
      Object.keys(eventData).forEach(key => {
          if (eventData[key] === undefined) {
              delete eventData[key];
          }
      });

      const result = await createEvent(eventData);
      res.json(result);
  } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: error.message });
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