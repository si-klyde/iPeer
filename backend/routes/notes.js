const express = require('express');
const { auth, db } = require('../firebaseAdmin.js');
const { encrypt, decrypt } = require('../utils/encryption.utils');
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
    console.log('=== START SAVE NOTES ===');
    const authHeader = req.headers.authorization;
    const { roomId, notes, clientId } = req.body;
    
    console.log('Request body:', {
        hasRoomId: !!roomId,
        notesLength: notes?.length,
        hasClientId: !!clientId
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Auth header invalid');
        return res.status(401).json({ error: 'No token provided' });
    }

    if (!roomId || !notes || !clientId) {
        console.log('❌ Missing fields:', { roomId, hasNotes: !!notes, clientId });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Verify token
        const decodedToken = await auth.verifyIdToken(token);
        console.log('✅ Token verified:', decodedToken.uid);
        
        // Check user role
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        console.log('User role:', userDoc.data()?.role);

        if (!userDoc.exists || userDoc.data().role !== 'peer-counselor') {
            console.log('❌ Unauthorized user');
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Find existing notes
        const notesRef = db.collection('notes');
        console.log('Checking existing notes for client:', clientId);
        
        const existingNotesQuery = await notesRef
            .where('clientId', '==', clientId)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        
        // Encrypt notes
        console.log('Encrypting notes...');
        const encryptedNotes = encrypt(notes);
        console.log('✅ Notes encrypted');

        if (existingNotesQuery.empty) {
            console.log('Creating new note...');
            const newNoteRef = await notesRef.add({
                roomId,
                clientId,
                counselorId: decodedToken.uid,
                content: encryptedNotes,
                createdAt: new Date(),
                lastUpdated: new Date()
            });
            console.log('✅ New note created:', newNoteRef.id);
        } else {
            console.log('Updating existing note...');
            const noteDoc = existingNotesQuery.docs[0];
            await noteDoc.ref.update({
                content: encryptedNotes,
                lastUpdated: new Date()
            });
            console.log('✅ Note updated');
        }

        console.log('=== END SAVE NOTES ===');
        res.status(200).json({ message: 'Notes saved successfully' });
    } catch (error) {
        console.error('❌ Error saving notes:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Error saving notes', 
            details: error.message 
        });
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
        const decryptedContent = decrypt(noteData.content); // Decrypt before sending
        res.status(200).json({ content: decryptedContent });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Error fetching notes', details: error.message });
    }
});

module.exports = router;