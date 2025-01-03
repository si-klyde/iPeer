const { db } = require('../firebaseAdmin');
const { v4: uuidv4 } = require('uuid');

const createAppointment = async (appointmentData) => {
  const appointmentRef = db.collection('appointments').doc();
  const roomId = uuidv4();

  //Create the appointment document
  await appointmentRef.set(
    Object.assign({}, appointmentData, { 
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
module.exports = {
  createAppointment,
  getAppointmentsClient,
  getAppointmentsPeer,
};