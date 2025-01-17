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

const createReminderNotification = async (appointment, counselorName, clientName) => {
  const { clientId, peerCounselorId, date, time, roomId } = appointment;
  
  // Create notification for client
  await createNotification(clientId, {
    type: 'APPOINTMENT_REMINDER',
    title: 'Your Session Starts Soon',
    message: `Your counseling session with ${counselorName} starts in 10 minutes at ${time}. Click to join the session.`,
    appointmentId: appointment.id,
    roomId,
    scheduledFor: `${date} ${time}`
  });

  // Create notification for peer counselor  
  await createNotification(peerCounselorId, {
    type: 'APPOINTMENT_REMINDER',
    title: 'Upcoming Counseling Session',
    message: `Your counseling session with ${clientName} starts in 10 minutes at ${time}. Click to join the session.`,
    appointmentId: appointment.id,
    roomId,
    scheduledFor: `${date} ${time}`
  });
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  createReminderNotification,
};