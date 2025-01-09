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

const createReminderNotification = async (appointment) => {
  const { clientId, peerCounselorId, date, time, roomId } = appointment;
  
  // Create notification for client
  await createNotification(clientId, {
    type: 'APPOINTMENT_REMINDER',
    title: 'Upcoming Appointment Reminder',
    message: `Your appointment is starting in 1 hour at ${time}`,
    appointmentId: appointment.id,
    roomId
  });

  // Create notification for peer counselor
  await createNotification(peerCounselorId, {
    type: 'APPOINTMENT_REMINDER',
    title: 'Upcoming Session Reminder',
    message: `You have a counseling session starting in 30mins at ${time}`,
    appointmentId: appointment.id,
    roomId
  });
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  createReminderNotification,
};