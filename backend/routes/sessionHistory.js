const express = require('express');
const router = express.Router();
const { createSession, getSessionHistory } = require('../models/sessionHistory');
const { auth } = require('../firebaseAdmin');
const { encrypt, decrypt } = require('../utils/encryption.utils');

// Middleware to encrypt session notes
const encryptSessionData = (req, res, next) => {
    try {
        const { sessionData } = req.body;
        if (sessionData?.notes) {
            req.body.sessionData.notes = encrypt(sessionData.notes);
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Encryption failed' });
    }
};

// Create session record with encrypted notes
router.post('/sessions', encryptSessionData, async (req, res) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        const { sessionData } = req.body;
        
        if (!token) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const sessionId = await createSession(sessionData, token);
        res.status(201).json({ sessionId });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get session history with decrypted notes
router.get('/sessions/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        const { userId } = req.params;
        const { role } = req.query;
        
        if (!token) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const sessions = await getSessionHistory(userId, role, token);
        // Decrypt notes for each session
        const decryptedSessions = sessions.map(session => ({
            ...session,
            notes: session.notes ? decrypt(session.notes) : null
        }));

        res.status(200).json(decryptedSessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: error.message }); 
    }
});

module.exports = router;