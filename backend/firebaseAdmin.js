const admin = require('firebase-admin');

const serviceAccount = require('./firebaseCredential.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();
module.exports = { auth, db };