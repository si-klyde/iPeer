const { db } = require('../firebaseAdmin');
const { v4: uuidv4 } = require('uuid');

const createAppointment = async (appointmentData) => {
  const appointmentRef = db.collection('appointments').doc();
  const roomId = uuidv4();

  await appointmentRef.set(
    Object.assign({}, appointmentData, { 
      createdAt: new Date(), 
      roomId,
    })
  );
  
  return appointmentRef.id;
};

const getAppointments = async (userId) => {
  const appointmentsSnapshot = await db.collection('appointments').where('userId', '==', userId).get();
  return appointmentsSnapshot.docs.map(doc => 
    Object.assign({}, { id: doc.id }, doc.data())
  );
  
};

module.exports = {
  createAppointment,
  getAppointments,
};