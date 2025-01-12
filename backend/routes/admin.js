const express = require('express');
const router = express.Router();
const { auth, db, admin } = require('../firebaseAdmin');
const { encrypt, decrypt } = require('../utils/encryption.utils');
const { hashPassword, verifyPassword } = require('../utils/password.utils');
const crypto = require('crypto');
const SECURITY_CONFIG = require('../config/security.config.js');

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
        const { uid, fullName, email, newPassword, profilePicture } = req.body;

        // Update admin document with new information
        const adminRef = db.collection('admins').doc(uid);
        const updateData = {
        fullName: encrypt(fullName),
        email: encrypt(email),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (profilePicture) {
        updateData.profilePicture = profilePicture;
        }

        // Update password if provided
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

        await adminRef.update(updateData);

        res.status(200).send({ message: 'Account setup completed successfully' });
    } catch (error) {
        console.error('Account setup error:', error);
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
        role: adminData.role
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      res.status(500).send({ error: 'Failed to fetch admin data' });
    }
  });
  
  
module.exports = router;