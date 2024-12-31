const { db } = require('../firebaseAdmin');

const createNotification = async (userId, notificationData) => {
  const notificationRef = db.collection('notifications').doc();
  await notificationRef.set({
    userId,
    read: false,
    createdAt: new Date(),
    ...notificationData
  });
  return notificationRef.id;
};

const getNotifications = async (userId) => {
  const notificationsSnapshot = await db
    .collection('notifications')
    .where('userId', '==', userId)
    .where('read', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
    
  return notificationsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const markNotificationAsRead = async (notificationId) => {
  const notificationRef = db.collection('notifications').doc(notificationId);
  await notificationRef.update({ read: true });
  return notificationId;
};

const getAllNotifications = async (userId) => {
  const notificationsSnapshot = await db
    .collection('notifications')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
    
  return notificationsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  getAllNotifications
};