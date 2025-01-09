const { db } = require('../firebaseAdmin');
const { v4: uuidv4 } = require('uuid');

const createAppointment = async (appointmentData) => {
  const appointmentRef = db.collection('appointments').doc();
  const roomId = uuidv4();

  //Create the appointment document
  await appointmentRef.set(
    Object.assign({}, appointmentData, {
      reminderSent: false, 
      createdAt: new Date(), 
      roomId,
    })
  );

  // Create a call document in the 'calls' document
  const roomRef = db.collection('calls').doc(roomId);
  await roomRef.set({
    createdAt: new Date(),
    appointmentId: appointmentRef.id,
  });
  
  return { appointmentId: appointmentRef.id, roomId }
};

const getAppointmentsClient = async (userId) => {
  const appointmentsSnapshot = await db.collection('appointments').where('clientId', '==', userId).get();
  return appointmentsSnapshot.docs.map(doc => 
    Object.assign({}, { id: doc.id }, doc.data())
  );
  
};
const getAppointmentsPeer = async (peerCounselorId) => {
  const appointmentsSnapshot = await db.collection('appointments').where('peerCounselorId', '==', peerCounselorId).get();
  return appointmentsSnapshot.docs.map(doc => 
    Object.assign({}, { id: doc.id }, doc.data())
  );
  
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