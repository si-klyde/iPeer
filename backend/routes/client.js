const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');
const { decrypt } = require('../utils/encryption.utils');

router.get('/client/:id', async (req, res) => {
  const userId = req.params.id;
  console.log(`Fetching client with ID: ${userId}`);
  try {
    const clientDoc = await db.collection('users').doc(userId).get();
    if (!clientDoc.exists) {
      console.log(`Client with ID ${userId} not found.`);
      return res.status(404).send({ error: 'Client not found' });
    }
    
    const clientData = clientDoc.data();

    const decryptedData = {
      ...clientData,
      email: decrypt(clientData.email),
      fullName: decrypt(clientData.fullName)
    };
    // tanggalin na lang
    console.log('Sending client data:', {
      ...decryptedData,
      email: '***masked***',
      fullName: '***masked***'
    });
    res.status(200).send(decryptedData);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).send({ error: 'Error fetching client' });
  }
});

module.exports = router;