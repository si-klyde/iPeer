const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

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

module.exports = router;