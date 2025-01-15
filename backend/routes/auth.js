const express = require('express');
const { auth, db, admin } = require('../firebaseAdmin.js');
const router = express.Router();
const crypto = require('crypto');
const {createClientDocument, createPeerCounselorDocument} = require('../models/userCreation');
const SECURITY_CONFIG = require('../config/security.config.js');
const { decrypt } = require('../utils/encryption.utils');
const { hashPassword, verifyPassword } = require('../utils/password.utils');
const { sendPasswordResetEmail } = require('../services/emailService.js');;
require('dotenv').config();

router.post('/register-peer-counselor', async (req, res) => {
  const { email, password, fullName, school, college, inviteToken } = req.body;

  if (!email || !password || !fullName || !school || !college || !inviteToken) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  try {
    // Validate invitation token
    const inviteDoc = await db.collection('invitations').doc(inviteToken).get();
    if (!inviteDoc.exists) {
      return res.status(400).send({ error: 'Invalid invitation token' });
    }

    const invitation = inviteDoc.data();
    const decryptedEmail = decrypt(invitation.email);
    if (invitation.used || decryptedEmail !== email) {
      return res.status(400).send({ error: 'Invalid or expired invitation' });
    }

    // Generate salt and hash password
    const salt = crypto.randomBytes(SECURITY_CONFIG.SALT_BYTES).toString('hex');
    const hash = hashPassword(password, salt);

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password: hash,
    });

    // Create peer counselor document with encrypted data
    await createPeerCounselorDocument(
      userRecord.uid,
      { 
        email, 
        fullName, 
        school, 
        college
      },
      { salt, password: hash }
    );

    // Mark invitation as used
    await db.collection('invitations').doc(inviteToken).update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
      registeredUserId: userRecord.uid
    });

    res.status(201).send({ message: 'Peer counselor registered successfully', uid: userRecord.uid });
  } catch (error) {
    console.error('Error registering peer counselor:', error);
    res.status(500).send({ error: 'Error registering peer counselor' });
  }
});

router.post('/google-signin', async (req, res) => {
  const { token } = req.body;
  
  // Ensure token is present
  if (!token) {
    console.log("Token is missing");
    return res.status(400).send('Token is missing');
  }

  //console.log('Received token:', token);

  try {
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    //console.log('Token verified successfully. Decoded token:', decodedToken);

    if (!decodedToken.email_verified) {
      return res.status(400).send('Email not verified');
    }

    const domain = decodedToken.email.split('@')[1];
    const schoolSnapshot = await db.collection('school')
      .where('domain', '==', domain)
      .get();

    if (schoolSnapshot.empty) {
      return res.status(403).send('Email domain not associated with any registered school');
    }

    // Proceed to check the user in Firebase
    let userRecord;
    try {
      userRecord = await auth.getUser(decodedToken.uid);
      //console.log('User found in Firebase:', userRecord);

      // Ensure the role is set correctly
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (!userDoc.exists) {
        await createClientDocument(userRecord.uid, userRecord);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).send('Error fetching user');
    }

    // Generate a custom Firebase token
    try {
      const customToken = await auth.createCustomToken(userRecord.uid);
      //console.log('Custom Firebase token generated for user:', userRecord.uid);

      res.status(200).send({ token: customToken });
    } catch (customTokenError) {
      console.error('Error generating custom token:', customTokenError);
      return res.status(500).send('Failed to generate custom token');
    }

  } catch (error) {
    console.error('Firebase token verification error:', error);
    if (error.message) console.error('Error message:', error.message);
    return res.status(400).send('Token verification failed: ' + error.message);
  }
});

// // Function to hash a password with salt and iterations
// const hashPassword = (password, salt) => {
//   if (!password || !salt) {
//     throw new Error('Password and salt are required for hashing');
//   }
  
//   let hash = crypto.createHmac(SECURITY_CONFIG.HASH_ALGORITHM, Buffer.from(salt, 'hex'))
//     .update(password)
//     .digest('hex');
    
//   for (let i = 1; i < SECURITY_CONFIG.HASH_ITERATIONS; i++) {
//     hash = crypto.createHmac(SECURITY_CONFIG.HASH_ALGORITHM, Buffer.from(salt, 'hex'))
//       .update(hash)
//       .digest('hex');
//   }
//   return hash;
// };

// // Function to verify a password
// const verifyPassword = (password, salt, storedHash) => {
//   if (!password || !salt || !storedHash) {
//     throw new Error('Missing required parameters for password verification');
//   }
  
//   try {
//     const hashedPassword = hashPassword(password, salt);
//     return hashedPassword === storedHash;
//   } catch (error) {
//     console.error('Error in password verification:', error);
//     return false;
//   }
// };

router.post('/login-peer-counselor', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).send({ error: 'Email and password are required' });
    }

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('role', '==', 'peer-counselor')
                                 .get();

    // Find matching email after decryption
    const userDoc = snapshot.docs.find(doc => {
      const data = doc.data();
      const decryptedEmail =decrypt(data.email);
      return decryptedEmail === email;
    });

    if (!userDoc) {
      return res.status(404).send({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Get auth credentials
    const authDoc = await db.collection('users')
                           .doc(userDoc.id)
                           .collection('auth')
                           .doc('credentials')
                           .get();

    if (!authDoc.exists) {
      return res.status(401).send({ error: 'Authentication failed' });
    }

    const { salt, password: storedHash } = authDoc.data();
    const isValid = verifyPassword(password, salt, storedHash);

    if (!isValid) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    // Create custom token
    const customToken = await auth.createCustomToken(userDoc.id);

    // Update only essential status
    await userDoc.ref.update({
      currentStatus: {
        status: 'online',
        lastUpdated: new Date(),
        isAvailable: true
      }
    });
    
    res.status(200).send({
      token: customToken,
      user: {
        uid: userDoc.id,
        email: decrypt(userData.email),
        fullName: decrypt(userData.fullName),
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ error: 'Login failed' });
  }
});

router.post('/check-role', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).send({ error: 'User not found' });
    }

    const userData = userDoc.data();
    let userProfile = {};

    // Get role-specific profile data
    if (userData.role === 'peer-counselor') {
      const profileDoc = await userDoc.ref.collection('counselorProfile').doc('details').get();
      if (profileDoc.exists) {
        userProfile = profileDoc.data();
      }
    } else if (userData.role === 'client') {
      const profileDoc = await userDoc.ref.collection('profile').doc('details').get();
      if (profileDoc.exists) {
        userProfile = profileDoc.data();
      }
    }

    res.status(200).send({
      role: userData.role,
      uid: userDoc.id,
      email: decrypt(userData.email),
      fullName: decrypt(userData.fullName),
      profile: userProfile,
      currentStatus: userData.currentStatus || null
    });

  } catch (error) {
    res.status(401).send({ error: 'Invalid token' });
  }
});

router.post('/reset-password-request', async (req, res) => {
  const { email } = req.body;
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('role', '==', 'peer-counselor')
      .get();
      
    const userDoc = snapshot.docs.find(doc => {
      const data = doc.data();
      const decryptedEmail = decrypt(data.email);
      return decryptedEmail === email;
    });

    if (!userDoc) {
      return res.status(404).send({ error: 'Email not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour validity

    await userDoc.ref.update({
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetExpiry
    });

    // Send reset password email using your email service
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).send({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to process reset request' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('resetPasswordToken', '==', token)
      .get();

    if (snapshot.empty) {
      return res.status(400).send({ error: 'Invalid reset token' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Generate new password hash
    const salt = crypto.randomBytes(SECURITY_CONFIG.SALT_BYTES).toString('hex');
    const hash = hashPassword(newPassword, salt);

    // Update Firebase Auth password
    await auth.updateUser(userDoc.id, {
      password: newPassword // Firebase Auth needs plain password
    });

    // Update auth credentials in Firestore
    await userDoc.ref.collection('auth').doc('credentials').update({
      salt,
      password: hash
    });

    // Clear reset token fields
    await userDoc.ref.update({
      resetPasswordToken: admin.firestore.FieldValue.delete(),
      resetPasswordExpiry: admin.firestore.FieldValue.delete()
    });

    res.status(200).send({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).send({ error: 'Failed to reset password' });
  }
});

module.exports = router;