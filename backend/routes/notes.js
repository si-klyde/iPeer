const express = require('express');
const { auth, db } = require('../firebaseAdmin.js');
const router = express.Router();

// Middleware to ensure notes collection exists
const ensureNotesCollection = async (req, res, next) => {
    try {
        const collections = await db.listCollections();
        const notesCollection = collections.find(col => col.id === 'notes');
        
        if (!notesCollection) {
            console.log('Notes collection does not exist, creating...');
            await db.collection('notes');
            console.log('Notes collection created successfully');
        }
        next();
    } catch (error) {
        console.error('Error in ensureNotesCollection:', error);
        res.status(500).json({ error: 'Failed to initialize notes collection' });
    }
};


// Route to save notes
router.post('/save-note', ensureNotesCollection, async (req, res) => {
    const authHeader = req.headers.authorization;
    const { roomId, notes } = req.body;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    if (!roomId || notes === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'peer-counselor') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const notesRef = db.collection('notes');
        const existingNotesQuery = await notesRef.where('roomId', '==', roomId).get();

        if (existingNotesQuery.empty) {
            // Create new note document
            const newNoteRef = await notesRef.add({
                roomId,
                counselorId: decodedToken.uid,
                content: notes,
                createdAt: new Date(),
                lastUpdated: new Date()
            });
            console.log('New note created with ID:', newNoteRef.id);
        } else {
            // Update existing note
            const noteDoc = existingNotesQuery.docs[0];
            await noteDoc.ref.update({
                content: notes,
                lastUpdated: new Date()
            });
            console.log('Note updated for room:', roomId);
        }

        res.status(200).json({ message: 'Notes saved successfully' });
    } catch (error) {
        console.error('Error saving notes:', error);
        res.status(500).json({ error: 'Error saving notes', details: error.message });
    }
});

// Route to get notes
router.get('/notes/:roomId', ensureNotesCollection, async (req, res) => {
    const authHeader = req.headers.authorization;
    const { roomId } = req.params;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    if (!roomId) {
        return res.status(400).json({ error: 'Room ID is required' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'peer-counselor') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Check if notes collection exists (double-check)
        const collections = await db.listCollections();
        const notesCollection = collections.find(col => col.id === 'notes');
        
        if (!notesCollection) {
            console.log('Notes collection does not exist during fetch, creating...');
            await db.collection('notes').doc('_placeholder').set({
                isPlaceholder: true,
                createdAt: new Date(),
                lastUpdated: new Date()
            });
        }

        const notesRef = db.collection('notes');
        const notesQuery = await notesRef.where('roomId', '==', roomId).get();

        if (notesQuery.empty) {
            return res.status(200).json({ content: '' });
        }

        const noteData = notesQuery.docs[0].data();
        console.log('Note fetched for room:', roomId);
        res.status(200).json({ content: noteData.content });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Error fetching notes', details: error.message });
    }
});

module.exports = router;