const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

// Route to get all peer counselors
router.get('/peer-counselors', async (req, res) => {
  try {
    const peerCounselorsSnapshot = await db.collection('users').where('role', '==', 'peer-counselor').get();
    const peerCounselors = peerCounselorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(peerCounselors);
  } catch (error) {
    console.error('Error fetching peer counselors:', error);
    res.status(500).send({ error: 'Error fetching peer counselors' });
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
    console.log(`Peer counselor data:`, peerCounselorDoc.data());
    res.status(200).send(peerCounselorDoc.data());
  } catch (error) {
    console.error('Error fetching peer counselor:', error);
    res.status(500).send({ error: 'Error fetching peer counselor' });
  }
});

module.exports = router;