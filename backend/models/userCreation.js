const { db } = require('../firebaseAdmin');
const { encrypt } = require('../utils/encryption.utils');

const createClientDocument = async (uid, userRecord) => {
  // Encrypt email and full name
  const encryptedEmail = encrypt(userRecord.email);
  const encryptedName = encrypt(userRecord.displayName);

  await db.collection('users').doc(uid).set({
    uid: uid,
    email: encryptedEmail,
    fullName: encryptedName,
    role: 'client',
    createdAt: new Date(),
    isActive: true
  });

  await db.collection('users').doc(uid)
    .collection('profile')
    .doc('details')
    .set({
      photoURL: userRecord.photoURL || '',
      college: ""
    });
};

const createPeerCounselorDocument = async (uid, userData, authData) => {
  // Encrypt email and full name
  const encryptedEmail = encrypt(userData.email);
  const encryptedFullName = encrypt(userData.fullName);

  await db.collection('users').doc(uid).set({
    uid: uid,
    email: encryptedEmail, 
    fullName: encryptedFullName,
    role: 'peer-counselor',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
    currentStatus: {
      status: 'offline',
      lastStatusUpdate: new Date(),
      isAvailable: false
    }
  });

  await db.collection('users').doc(uid)
    .collection('auth')
    .doc('credentials')
    .set({
      salt: authData.salt,
      password: authData.password
    });

    await db.collection('users').doc(uid)
        .collection('profile')
        .doc('details')
        .set({
            college: "",
            photoURL: ""
        });
};

module.exports = {
  createClientDocument,
  createPeerCounselorDocument
};