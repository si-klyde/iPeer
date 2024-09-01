import admin from 'firebase-admin';

const serviceAccount = require('./firebaseCredential.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export const auth = admin.auth();