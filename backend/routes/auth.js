const express = require('express');
const { auth, db } = require('../firebaseAdmin.js');
const router = express.Router();
const crypto = require('crypto');

require('dotenv').config();

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

    // Proceed to check the user in Firebase
    let userRecord;
    try {
      userRecord = await auth.getUser(decodedToken.uid);
      //console.log('User found in Firebase:', userRecord);

      // Ensure the role is set correctly
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (!userDoc.exists) {
        await db.collection('users').doc(userRecord.uid).set({
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          role: 'client',
          createdAt: new Date(),
        });
      } else {
        const userData = userDoc.data();
        if (!userData.role) {
          await db.collection('users').doc(userRecord.uid).update({
            role: 'client',
          });
        }
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

// Function to hash a password with salt and iterations
const hashPassword = (password, salt, iterations) => {
  let hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  for (let i = 0; i < iterations; i++) {
    hash = crypto.createHmac('sha256', salt).update(hash).digest('hex');
  }
  return hash;
};

// Function to verify a password
const verifyPassword = (password, salt, iterations, hash) => {
  const hashedPassword = hashPassword(password, salt, iterations);
  return hashedPassword === hash;
};

router.post('/register-peer-counselor', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    // Generate a salt
    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 10000; // Number of iterations

    // Hash the password with salt and iterations
    const hash = hashPassword(password, salt, iterations);

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password: hash, // Use the hashed password
      displayName,
    });

    // Add user to Firestore with role 'peer-counselor'
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: 'peer-counselor',
      createdAt: new Date(),
      salt: salt, // Store the salt
      iterations: iterations, // Store the number of iterations
      password: hash, // Store the hashed password
    });

    res.status(201).send({ message: 'Peer counselor registered successfully' });
  } catch (error) {
    console.error('Error registering peer counselor:', error);
    res.status(500).send({ error: 'Error registering peer counselor' });
  }
});

router.post('/login-peer-counselor', async (req, res) => {
  const { email, password } = req.body;

  console.log('Request body:', req.body); // Log the request body

  try {
    // Fetch user from Firestore
    const userDoc = await db.collection('users').where('email', '==', email).get();
    if (userDoc.empty) {
      return res.status(400).send({ error: 'User not found' });
    }

    const userData = userDoc.docs[0].data();
    const { salt, iterations, password: storedHash } = userData;

    // Verify the password
    if (!verifyPassword(password, salt, iterations, storedHash)) {
      return res.status(400).send({ error: 'Invalid password' });
    }

    // Generate a custom Firebase token
    const customToken = await auth.createCustomToken(userDoc.docs[0].id);
    
    res.status(200).send({ token: customToken });
  } catch (error) {
    console.error('Error logging in peer counselor:', error);
    res.status(500).send({ error: 'Error logging in peer counselor' });
  }
});

router.post('/check-role', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Missing or invalid authorization header');
    return res.status(401).send('No token provided');
  }

  const token = authHeader.split('Bearer ')[1];
  console.log('Received token(backend):', token);

  try {
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Decoded token UID:', decodedToken.uid);
    
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      console.log('User document not found for UID:', decodedToken.uid);
      return res.status(404).send('User not found');
    }

    const userData = userDoc.data();
    console.log('User role from database:', userData.role);
    
    res.status(200).json({ role: userData.role });
  } catch (error) {
    console.error('Error checking role:', error);
    res.status(401).send('Unauthorized');
  }
});


module.exports = router;