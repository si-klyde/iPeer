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
    const { roomId, notes, clientId } = req.body;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Missing fields:', { roomId, notes, clientId });
        return res.status(401).json({ error: 'No token provided' });
    }

    if (!roomId || !notes || !clientId) {
        console.log('Missing fields:', { roomId, notes, clientId });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        
        console.log('User role:', userDoc.data()?.role);

        if (!userDoc.exists || userDoc.data().role !== 'peer-counselor') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const notesRef = db.collection('notes');
        
        const existingNotesQuery = await notesRef
            .where('clientId', '==', clientId)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (existingNotesQuery.empty) {
            console.log('Creating new note');
            const newNoteRef = await notesRef.add({
                roomId,
                clientId,
                counselorId: decodedToken.uid,
                content: notes,
                createdAt: new Date(),
                lastUpdated: new Date()
            });
            console.log('New note created with ID:', newNoteRef.id);
        } else {
            console.log('Updating existing note');
            const noteDoc = existingNotesQuery.docs[0];
            await noteDoc.ref.update({
                content: notes,
                lastUpdated: new Date()
            });
            console.log('Note updated');
        }

        res.status(200).json({ message: 'Notes saved successfully' });
    } catch (error) {
        console.error('Error saving notes:', error);
        res.status(500).json({ error: 'Error saving notes', details: error.message });
    }
});

// Route to get notes
router.get('/notes/client/:clientId', ensureNotesCollection, async (req, res) => {
    const authHeader = req.headers.authorization;
    const { clientId } = req.params;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'peer-counselor') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const notesRef = db.collection('notes');
        const notesQuery = await notesRef
            .where('clientId', '==', clientId)
            .orderBy('createdAt', 'desc')
            .get();

        if (notesQuery.empty) {
            return res.status(200).json({ content: '' });
        }

        const noteData = notesQuery.docs[0].data();
        res.status(200).json({ content: noteData.content });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Error fetching notes', details: error.message });
    }
});

module.exports = router;