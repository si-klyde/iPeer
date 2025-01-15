const { db } = require('../firebaseAdmin');
const { encrypt } = require('../utils/encryption.utils');

const createClientDocument = async (uid, userRecord) => {
  // Encrypt email and full name
  const encryptedEmail = encrypt(userRecord.email);
  const encryptedName = encrypt(userRecord.displayName);

  // Get domain from email
  const domain = userRecord.email.split('@')[1];

  // Find matching school
  const schoolSnapshot = await db.collection('school')
    .where('domain', '==', domain)
    .get();

  let schoolName = null;
    if (!schoolSnapshot.empty) {
      schoolName = schoolSnapshot.docs[0].data().name;
  }

  await db.collection('users').doc(uid).set({
    uid: uid,
    email: encryptedEmail,
    fullName: encryptedName,
    role: 'client',
    createdAt: new Date(),
    isActive: true,
    school: schoolName
  });

  await db.collection('users').doc(uid)
    .collection('profile')
    .doc('details')
    .set({
      photoURL: userRecord.photoURL || ''
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
    school: userData.school,
    college: userData.college,
    role: 'peer-counselor',
    createdAt: new Date(),
    lastLogin: new Date(),
    isVerified: false,
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
            photoURL: ""
        });
};

module.exports = {
  createClientDocument,
  createPeerCounselorDocument
};