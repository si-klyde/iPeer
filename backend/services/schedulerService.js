const cron = require('node-cron');
const { db } = require('../firebaseAdmin');
const { sendAppointmentReminder } = require('./emailService');

// Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    
    // Get current hour + 1 to check upcoming appointments
    const nextHour = (now.getHours() + 1).toString().padStart(2, '0') + ':00';
    
    // Get all appointments for today with time matching next hour
    const appointmentsSnapshot = await db.collection('appointments')
      .where('date', '==', currentDate)
      .where('time', '==', nextHour)
      .get();

    for (const doc of appointmentsSnapshot.docs) {
      const appointment = doc.data();
      
      // Fetch client and counselor details
      const clientDoc = await db.collection('users').doc(appointment.userId).get();
      const counselorDoc = await db.collection('users').doc(appointment.peerCounselorId).get();
      
      await sendAppointmentReminder(
        clientDoc.data().email,
        counselorDoc.data().email,
        {
          time: appointment.time,
          clientName: clientDoc.data().name,
          peerCounselorName: counselorDoc.data().name,
          roomLink: `https://yourapp.com/room/${appointment.roomId}`
        }
      );
    }
  } catch (error) {
    console.error('Error sending appointment reminders:', error);
  }
});
