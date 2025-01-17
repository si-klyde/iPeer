const { db } = require('../firebaseAdmin');
const { encrypt, decrypt } = require('../utils/encryption.utils');

const createAppointment = async (appointmentData) => {
  const appointmentRef = db.collection('appointments').doc();
  const roomId = Math.random().toString(36).substring(2, 15);

  // Encrypt the description before storing
  const encryptedData = {
    ...appointmentData,
    description: appointmentData.description ? encrypt(appointmentData.description) : null
  };

  await appointmentRef.set(
    Object.assign({}, encryptedData, {
      reminderSent: false,
      createdAt: new Date(),
      roomId,
    })
  );

  const roomRef = db.collection('calls').doc(roomId);
  await roomRef.set({
    createdAt: new Date(),
    appointmentId: appointmentRef.id,
  });
  
  return { appointmentId: appointmentRef.id, roomId }
};

const getAppointmentsClient = async (userId) => {
  const appointmentsSnapshot = await db.collection('appointments').where('clientId', '==', userId).get();
  return appointmentsSnapshot.docs.map(doc => {
    const data = doc.data();
    return Object.assign({}, { 
      id: doc.id,
      ...data,
      description: data.description ? decrypt(data.description) : null
    });
  });
};

const getAppointmentsPeer = async (peerCounselorId) => {
  const appointmentsSnapshot = await db.collection('appointments').where('peerCounselorId', '==', peerCounselorId).get();
  return appointmentsSnapshot.docs.map(doc => {
    const data = doc.data();
    return Object.assign({}, { 
      id: doc.id,
      ...data,
      description: data.description ? decrypt(data.description) : null
    });
  });
};

const getUpcomingAppointments = async () => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  
  const appointmentsSnapshot = await db
    .collection('appointments')
    .where('status', '==', 'accepted')
    .where('date', '==', now.toISOString().split('T')[0])
    .get();
    
  return appointmentsSnapshot.docs
    .map(doc => ({id: doc.id, ...doc.data()}))
    .filter(apt => {
      const aptTime = new Date(`${apt.date} ${apt.time}`);
      return aptTime > now && aptTime <= oneHourFromNow;
    });
};

module.exports = {
  createAppointment,
  getAppointmentsClient,
  getAppointmentsPeer,
  getUpcomingAppointments,
};