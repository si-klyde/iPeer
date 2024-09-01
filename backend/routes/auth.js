// backend/routes/auth.js
import express from 'express';
import { auth } from '../firebaseAdmin.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-signin', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the token using Google API
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Check if user exists in Firebase, if not create the user
    const userRecord = await auth.getUserByEmail(payload.email)
      .catch(() => auth.createUser({
        uid: payload.sub,
        email: payload.email,
        displayName: payload.name,
        photoURL: payload.picture,
      }));

    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(200).send({ token: customToken });
  } catch (error) {
    res.status(400).send('Google Sign-In failed');
  }
});

export default router;
