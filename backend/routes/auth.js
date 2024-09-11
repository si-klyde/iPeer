const express = require('express');
const { auth } = require('../firebaseAdmin.js');
const router = express.Router();

require('dotenv').config();

router.post('/google-signin', async (req, res) => {
  const { token } = req.body;
  
  // Ensure token is present
  if (!token) {
    console.log("token is missing");
    return res.status(400).send('Token is missing');
  }

  console.log('Received token:', token);

  try {
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Token verified successfully. Decoded token:', decodedToken);
    
    if (!decodedToken.email_verified) {
      return res.status(400).send('Email not verified');
    }

    // Proceed to check or create the user in Firebase
    let userRecord;
    try {
      userRecord = await auth.getUser(decodedToken.uid);
      console.log('User found in Firebase:', userRecord);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('User not found, creating new user...');
        try {
          // User does not exist, create the user
          userRecord = await auth.createUser({
            uid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name,
            photoURL: decodedToken.picture,
          });
          console.log('New user created:', userRecord);
        } catch (createError) {
          console.error('Error creating new user:', createError);
          return res.status(500).send('Failed to create user');
        }
      } else {
        console.error('Error fetching user:', error);
        return res.status(500).send('Error fetching user');
      }
    }

    // Generate a custom Firebase token
    try {
      const customToken = await auth.createCustomToken(userRecord.uid);
      console.log('Custom Firebase token generated for user:', userRecord.uid);

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

module.exports = router;