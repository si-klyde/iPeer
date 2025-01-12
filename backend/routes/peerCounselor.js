const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebaseAdmin');
const { decrypt } = require('../utils/encryption.utils');

// Route to get all peer counselors
router.get('/peer-counselors', async (req, res) => {
  try {
    const peerCounselorsSnapshot = await db.collection('users')
      .where('role', '==', 'peer-counselor')
      .get();

    const peerCounselors = peerCounselorsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Check if data is encrypted (has iv, content, tag format)
        email: decrypt(data.email),
        fullName: decrypt(data.fullName)
      };
    });    res.status(200).send(peerCounselors);
  } catch (error) {
    console.error('Error fetching peer counselors:', error);
    res.status(500).send({ error: 'Error fetching peer counselors' });
  }
});

router.get('/peer-counselors/available', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    await admin.auth().verifyIdToken(token);
      
    const counselorsSnapshot = await db.collection('users')
      .where('role', '==', 'peer-counselor')
      .where('currentStatus.status', '==', 'online')  // Update this line
      .where('currentStatus.isAvailable', '==', true) // Update this line
      .get();

    const counselors = await Promise.all(counselorsSnapshot.docs.map(async doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: await decrypt(data.fullName),
        status: data.currentStatus?.status,
        isAvailable: data.currentStatus?.isAvailable
      };
    }));

    console.log('Sending available counselors:', counselors);
    res.json(counselors);
  } catch (error) {
    console.error('Error:', error);
    res.status(403).json({ message: 'Authentication failed or error fetching counselors' });
  }
});

// Route to get a single peer counselor by ID
router.get('/peer-counselors/:id', async (req, res) => {
  const peerCounselorId = req.params.id;
  console.log(`Fetching peer counselor with ID: ${peerCounselorId}`);
  try {
    const peerCounselorDoc = await db.collection('users').doc(peerCounselorId).get();
    if (!peerCounselorDoc.exists) {
      console.log(`Peer counselor with ID ${peerCounselorId} not found.`);
      return res.status(404).send({ error: 'Peer counselor not found' });
    }
    const data = peerCounselorDoc.data();
    const decryptedData = {
      ...data,
      email: decrypt(data.email),
      fullName: decrypt(data.fullName)
    };
    console.log(`Peer counselor data:`, decryptedData);
    res.status(200).send(decryptedData);
  } catch (error) {
    console.error('Error fetching peer counselor:', error);
    res.status(500).send({ error: 'Error fetching peer counselor' });
  }
});

router.put('/peer-counselor/status/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status, isAvailable } = req.body;
  
  console.log('Updating status for user:', userId);
  console.log('New status data:', { status, isAvailable });
  
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      currentStatus: {
        status,
        isAvailable,
        lastStatusUpdate: new Date()
      }
    });
    
    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;