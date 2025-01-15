const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebaseAdmin');
const { encrypt, decrypt } = require('../utils/encryption.utils');
const generateVerificationCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const { sendVerificationEmail } = require('../services/emailService');

router.post('/update-credentials/:uid', async (req, res) => {
  const { uid } = req.params;
  const { credentials } = req.body;

  try {
    // Encrypt credentials
    const encryptedCredentials = credentials.map(cred => ({
      imageUrl: encrypt(cred.imageUrl),
      fileName: encrypt(cred.fileName),
      uploadedAt: cred.uploadedAt
    }));

    // Update user document with encrypted credentials
    await db.collection('users').doc(uid).update({
      credentials: encryptedCredentials
    });

    res.status(200).send({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Error updating credentials:', error);
    res.status(500).send({ error: 'Failed to update credentials' });
  }
});

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
        fullName: decrypt(data.fullName),
        credentials: data.credentials ? data.credentials.map(cred => ({
          imageUrl: decrypt(cred.imageUrl),
          fileName: decrypt(cred.fileName),
          uploadedAt: cred.uploadedAt
        })) : []
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
  try {
    const peerCounselorDoc = await db.collection('users').doc(peerCounselorId).get();
    if (!peerCounselorDoc.exists) {
      return res.status(404).send({ error: 'Peer counselor not found' });
    }
    const data = peerCounselorDoc.data();
    const decryptedData = {
      ...data,
      email: decrypt(data.email),
      fullName: decrypt(data.fullName),
      credentials: data.credentials ? data.credentials.map(cred => ({
        imageUrl: decrypt(cred.imageUrl),
        fileName: decrypt(cred.fileName),
        uploadedAt: cred.uploadedAt
      })) : []
    };
    console.log('Decrypted data:', decryptedData);
    res.status(200).send(decryptedData);
  } catch (error) {
    console.error('Error fetching peer counselor:', error);
    res.status(500).send({ error: 'Error fetching peer counselor' });
  }
});

router.post('/admin/send-delete-verification', async (req, res) => {
  const { counselorId, counselorName, adminEmail } = req.body;
  const verificationCode = generateVerificationCode();
  
  console.log('Starting verification process:', {
    counselorId,
    counselorName,
    adminEmail,
    verificationCode
  });
  
  try {
    // Store verification code in Firestore
    await db.collection('deleteVerifications').doc(counselorId).set({
      code: verificationCode,
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)),
      adminEmail
    });
    //console.log('Verification code stored in Firestore');

    // Send email
    await sendVerificationEmail(adminEmail, verificationCode, counselorName);
    //console.log('Verification email sent successfully');
    
    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: error.message });
  }
});


router.delete('/peer-counselors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationCode } = req.body;

    // Verify the code
    const verificationDoc = await db.collection('deleteVerifications').doc(id).get();
    if (!verificationDoc.exists) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const verification = verificationDoc.data();
    if (verification.code !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (verification.expiresAt.toDate() < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // Proceed with deletion
    await admin.auth().deleteUser(id);
    
    await db.collection('users').doc(id).delete();
    
    await db.collection('deleteVerifications').doc(id).delete();

    res.status(200).json({ message: 'Peer counselor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete peer counselor' });
  }
});

router.put('/peer-counselor/status/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status, isAvailable } = req.body;
  
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      currentStatus: {
        status,
        isAvailable,
        lastStatusUpdate: new Date()
      }
    });
    console.log('Successfully updated status in database for user:', userId);
    
    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});


router.get('/peer-counselors/per-college/:college', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    await admin.auth().verifyIdToken(token);
    const { college } = req.params;
    console.log('Fetching peer counselors for college:', college);

    const peerCounselorsSnapshot = await db.collection('users')
      .where('role', '==', 'peer-counselor')
      .where('college', '==', college)
      .get();

    const peerCounselors = peerCounselorsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        email: decrypt(data.email),
        fullName: decrypt(data.fullName),
        credentials: data.credentials ? data.credentials.map(cred => ({
          imageUrl: decrypt(cred.imageUrl),
          fileName: decrypt(cred.fileName),
          uploadedAt: cred.uploadedAt
        })) : []
      };
    });

    console.log('Found counselors:', peerCounselors);
    res.status(200).send(peerCounselors);
  } catch (error) {
    console.error('Error fetching peer counselors:', error);
    res.status(500).send({ error: 'Error fetching peer counselors' });
  }
});

router.post('/peer-counselors/:id/verify', async (req, res) => {
  const { id } = req.params;
  const { isVerified } = req.body;
  
  try {
    const userRef = db.collection('users').doc(id);
    await userRef.update({
      isVerified: isVerified,
      verificationStatus: isVerified ? 'verified' : 'unverified'
    });
    
    res.status(200).json({ 
      message: `Peer counselor ${isVerified ? 'verified' : 'unverified'} successfully`,
      isVerified,
    });
  } catch (error) {
    console.error('Verification update error:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

module.exports = router;