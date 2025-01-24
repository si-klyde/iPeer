const admin = require('firebase-admin');
const serviceAccount = require('../firebaseCredential.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updatePeerCounselors() {
  const batch = db.batch();
  let updateCount = 0;

  try {
    // Get all peer counselors
    const snapshot = await db.collection('users')
      .where('role', '==', 'peer-counselor')
      .get();

    console.log(`Found ${snapshot.size} peer counselors to update`);

    snapshot.forEach(doc => {
      const userRef = db.collection('users').doc(doc.id);
      
      // Update with new fields
      batch.update(userRef, {
        accountStatus: 'active',
        currentStatus: {
          status: 'offline',
          isAvailable: false,
          lastStatusUpdate: admin.firestore.FieldValue.serverTimestamp()  
        },
        verificationStatus: 'verified',
        isVerified: true
      });
      
      updateCount++;
    });

    // Commit the batch update
    await batch.commit();
    console.log(`Successfully updated ${updateCount} peer counselor accounts`);
  } catch (error) {
    console.error('Error updating peer counselors:', error);
  } finally {
    process.exit();
  }
}

updatePeerCounselors();