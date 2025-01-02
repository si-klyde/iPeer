const { db } = require('../firebaseAdmin');

const createClientDocument = async (uid, userRecord) => {
  await db.collection('users').doc(uid).set({
    uid: uid,
    email: userRecord.email,
    fullName: userRecord.displayName,
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
  await db.collection('users').doc(uid).set({
    uid: uid,
    email: userData.email,
    fullName: userData.fullName,
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