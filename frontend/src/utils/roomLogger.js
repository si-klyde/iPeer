import { db, auth } from '../firebase';
import { collection, doc, getDoc, addDoc } from 'firebase/firestore';

// Add a logging tracker at the top
const logTracker = new Set();

export const logRoomEntry = async (roomName) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    // Create unique session identifier
    const sessionKey = `${user.uid}-${roomName}-${Math.floor(Date.now()/1000/60)}`; // Unique per minute
    
    // Prevent duplicate logs
    if (logTracker.has(sessionKey)) return;
    logTracker.add(sessionKey);

    // Get user role from Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    // Only log for clients
    if (userDoc.exists() && userDoc.data().role === 'client') {
      await addDoc(collection(db, 'roomEntries'), {
        userId: user.uid,
        role: userDoc.data().role,
        roomName,
        timestamp: new Date()
      });
    }

    // Cleanup old keys (optional)
    setTimeout(() => logTracker.delete(sessionKey), 60000); // Clear after 1 minute
  } catch (error) {
    console.error('Error logging room entry:', error);
  }
}; 