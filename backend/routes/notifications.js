const express = require('express');
const router = express.Router();
const { db, auth } = require('../firebaseAdmin');
const { getNotifications, markNotificationAsRead, getAllNotifications } = require('../models/notifications');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
  
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Auth error:', error); // Add logging
      res.status(403).json({ error: 'Invalid token.' });
    }
};
  
// Apply authentication to all routes
router.use(authenticateToken);

router.get('/notifications', async (req, res) => {
    const userId = req.user.uid;
    try {
        const notificationData = await getNotifications(userId);
        res.json(notificationData);
    } catch (error) {
        console.error('Notification fetch error:', error); // Add logging
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.put('/notifications/:notificationId', async (req, res) => {
    try {
        await markNotificationAsRead(req.params.notificationId);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

router.get('/notifications/all', async (req, res) => {
    const userId = req.user.uid;
    try {
        const notificationData = await getAllNotifications(userId);
        res.json(notificationData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

module.exports = router;