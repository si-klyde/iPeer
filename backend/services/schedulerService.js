const cron = require('node-cron');
const { db } = require('../firebaseAdmin');
const { sendAppointmentReminder } = require('./emailService');
const moment = require('moment-timezone');

const APP_TIMEZONE = 'Asia/Manila';

// Run every 15 minutes
// palitan na lang if idedeploy na (wag 15mins)
cron.schedule('* * * * *', async () => {
  try {
    console.log('Appointment Reminder Cron Job Started');
    
    const now = moment().tz(APP_TIMEZONE);
    const currentDate = now.format('YYYY-MM-DD');
    const targetTime = now.clone().add(1, 'hour').format('HH:mm');

    console.log(`Checking appointments for date: ${currentDate} and time: ${targetTime}`);
    
    // Single equality check instead of range query
    const appointmentsSnapshot = await db.collection('appointments')
      .where('date', '==', currentDate)
      .where('time', '==', targetTime)
      .where('status', '==', 'accepted')
      .get();

    if (appointmentsSnapshot.empty) {
      console.log('No upcoming appointments found');
      return;
    }

    const reminderPromises = appointmentsSnapshot.docs.map(async (doc) => {
      const appointment = { id: doc.id, ...doc.data() };
      
      try {
        const clientDoc = await db.collection('users').doc(appointment.clientId).get();
        const counselorDoc = await db.collection('users').doc(appointment.peerCounselorId).get();
        
        if (!clientDoc.exists || !counselorDoc.exists) {
          console.error(`User documents missing for appointment ${appointment.id}`);
          return;
        }

        const reminderDetails = {
          time: appointment.time,
          clientName: clientDoc.data().displayName,
          peerCounselorName: counselorDoc.data().displayName,
          roomLink: `http://localhost:5173/counseling/${appointment.roomId}`
        };

        await sendAppointmentReminder(
          clientDoc.data().email,
          counselorDoc.data().email,
          reminderDetails
        );

        console.log(`Reminder sent for appointment ${appointment.id} at ${appointment.time}`);
      } catch (userFetchError) {
        console.error(`Error processing appointment ${appointment.id}:`, userFetchError);
      }
    });

    await Promise.allSettled(reminderPromises);

  } catch (error) {
    console.error('Critical error in appointment reminder cron job:', error);
  }
});

module.exports = { schedulerService: cron };