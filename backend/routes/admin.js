const express = require('express');
const router = express.Router();
const { auth, db, admin } = require('../firebaseAdmin');
const { encrypt, decrypt } = require('../utils/encryption.utils');
const { hashPassword, verifyPassword } = require('../utils/password.utils');
const crypto = require('crypto');
const SECURITY_CONFIG = require('../config/security.config.js');
const { sendPeerCounselorInvitation } = require('../services/emailService');

router.post('/login-admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
        return res.status(400).send({ error: 'Username and password are required' });
        }

        // Find admin by username
        const adminsRef = db.collection('admins');
        const snapshot = await adminsRef.get();

        // Find matching username after decryption
        const adminDoc = snapshot.docs.find(doc => {
        const data = doc.data();
        const decryptedUsername = decrypt(data.username);
        return decryptedUsername === username;
        });

        if (!adminDoc) {
        return res.status(404).send({ error: 'Admin not found' });
        }

        const adminData = adminDoc.data();

        // Get auth credentials
        const authDoc = await db.collection('admins')
                                .doc(adminDoc.id)
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

        // Check if this is first login (no email set means first login)
        const isFirstLogin = !adminData.email;

        // Create custom token
        const customToken = await auth.createCustomToken(adminDoc.id);
        
        res.status(200).send({
        token: customToken,
        user: {
            uid: adminDoc.id,
            username: decrypt(adminData.username),
            college: decrypt(adminData.college),
            role: adminData.role,
            isFirstLogin
        }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ error: 'Login failed' });
    }
});

router.post('/setup-account', async (req, res) => {
  try {
    const { uid, fullName, email, newPassword, profilePicture, username } = req.body;

    // Validate required fields
    if (!uid || !fullName || !email || !newPassword || !username) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    // Check profile picture size
    if (profilePicture && profilePicture.length > 50 * 1024 * 1024) {
      return res.status(413).send({ error: 'Profile picture too large' });
    }

    // Create auth update object
    const authUpdateData = {
      email: email,
      password: newPassword,
      displayName: fullName,
    };

    // Update Firebase Auth
    await auth.updateUser(uid, authUpdateData);

    // Create admin document update data
    const updateData = {
      username: encrypt(username),
      fullName: encrypt(fullName),
      email: encrypt(email),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add encrypted photoURL if exists
    if (profilePicture) {
      updateData.photoURL = encrypt(profilePicture);
    }

    const adminRef = db.collection('admins').doc(uid);

    // Update password with salt
    if (newPassword) {
      const salt = crypto.randomBytes(SECURITY_CONFIG.SALT_BYTES).toString('hex');
      const hashedPassword = hashPassword(newPassword, salt);
      
      await adminRef.collection('auth')
        .doc('credentials')
        .update({
          salt,
          password: hashedPassword
        });
    }

    // Update admin document
    await adminRef.update(updateData);

    res.status(200).send({ message: 'Account setup completed successfully' });
  } catch (error) {
    console.error('Account setup error:', error);
    if (error.code === 'auth/email-already-in-use') {
      return res.status(400).send({ error: 'Email already in use' });
    }
    res.status(500).send({ error: 'Failed to setup account' });
  }
});

router.get('/admin-data/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const adminDoc = await db.collection('admins').doc(uid).get();
      
      if (!adminDoc.exists) {
        return res.status(404).send({ error: 'Admin not found' });
      }
  
      const adminData = adminDoc.data();
      res.status(200).send({
        uid: adminDoc.id,
        username: decrypt(adminData.username),
        college: decrypt(adminData.college),
        school: decrypt(adminData.school),
        role: adminData.role,
        fullName: decrypt(adminData.fullName),
        photoURL: adminData.photoURL ? decrypt(adminData.photoURL) : null
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      res.status(500).send({ error: 'Failed to fetch admin data' });
    }
  });

  router.get('/admin-initial-data/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const adminDoc = await db.collection('admins').doc(uid).get();
        
        if (!adminDoc.exists) {
            return res.status(404).send({ error: 'Admin not found' });
        }

        const adminData = adminDoc.data();
        // Only send necessary initial data
        res.status(200).send({
            uid: adminDoc.id,
            username: decrypt(adminData.username),
            college: decrypt(adminData.college),
            school: decrypt(adminData.school),
            createdAtAt: adminData.createdAt
        });
    } catch (error) {
        console.error('Error fetching initial admin data:', error);
        res.status(500).send({ error: 'Failed to fetch initial admin data' });
    }
});

  router.post('/send-invitation', async (req, res) => {
    const { email, college, school } = req.body;
  
    try {
      // Check if email already exists as peer counselor
      const usersRef = db.collection('users');
      const snapshot = await usersRef
        .where('role', '==', 'peer-counselor')
        .get();
  
      // Find matching email after decryption
      const existingCounselor = snapshot.docs.find(doc => {
        const data = doc.data();
        const decryptedEmail = decrypt(data.email);
        return decryptedEmail === email;
      });
  
      if (existingCounselor) {
        return res.status(400).json({ 
          error: 'This email is already registered as a peer counselor' 
        });
      }
  
      // Continue with existing invitation logic
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const encryptedEmail = encrypt(email);
  
      await db.collection('invitations').doc(inviteToken).set({
        email: encrypt(email),
        college: encrypt(college),
        school: encrypt(school),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        used: false,
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        )
      });
  
      const registrationLink = `http://localhost:5173/register-peer-counselor?token=${inviteToken}`;
      await sendPeerCounselorInvitation(email, registrationLink, college);

      res.status(200).json({ message: 'Invitation sent successfully' });
  
    } catch (error) {
      console.error('Error sending invitation:', error);
      res.status(500).json({ error: 'Failed to send invitation' });
    }
  });

  router.get('/validate-invitation/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const inviteDoc = await db.collection('invitations').doc(token).get();

      if (!inviteDoc.exists) {
        return res.status(404).send({ error: 'Invalid invitation token' });
      }

      const invitation = inviteDoc.data();
      
      if (invitation.used) {
        return res.status(400).send({ error: 'Invitation already used' });
      }

      if (invitation.expiresAt.toDate() < new Date()) {
        return res.status(400).send({ error: 'Invitation has expired' });
      }

      res.status(200).send({
        email: decrypt(invitation.email),
        college: decrypt(invitation.college),
        school: decrypt(invitation.school)

      });
    } catch (error) {
      console.error('Error validating invitation:', error);
      res.status(500).send({ error: 'Failed to validate invitation' });
    }
  });

  router.get('admin/peer-counselor/:id', async (req, res) => {
    try {
      const counselorDoc = await db.collection('peer_counselors').doc(req.params.id).get();
      
      if (!counselorDoc.exists) {
        return res.status(404).json({ message: 'Peer counselor not found' });
      }
  
      const counselorData = {
        id: counselorDoc.id,
        ...counselorDoc.data()
      };
  
      res.json(counselorData);
    } catch (error) {
      console.error('Error fetching peer counselor:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
module.exports = router;