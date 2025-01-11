const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

router.get('/schools', async (req, res) => {
  try {
    const schoolsSnapshot = await db.collection('school').get();
    const schools = schoolsSnapshot.docs.map(doc => ({
      domain: doc.id,
      ...doc.data()
    }));
    res.status(200).json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Error fetching schools' });
  }
});

module.exports = router;