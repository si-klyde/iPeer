const cron = require('node-cron');
const { db } = require('../firebaseAdmin');
const { sendAppointmentReminder } = require('./emailService');
const { createReminderNotification } = require('../models/notifications');
const moment = require('moment-timezone');
const { decrypt } = require('../utils/encryption.utils');

const APP_TIMEZONE = 'Asia/Manila';
const REMINDER_MINUTES_BEFORE = 10;
const WINDOW_PADDING_MINUTES = 2;
const CRON_SCHEDULE = '*/1 * * * *';

// Get the appropriate app URL based on environment
const APP_URL = process.env.NODE_ENV === 'production' 
  ? process.env.PROD_APP_URL 
  : process.env.APP_URL;

console.log('Scheduler service initialized');

cron.schedule(CRON_SCHEDULE, async () => {
  try {
    console.log('Appointment Reminder Cron Job Started');
    
    const now = moment().tz(APP_TIMEZONE);
    
    // Calculate the appointment times we're looking for
    // For appointments happening 30 minutes from now (±7 minutes)
    const appointmentWindowStart = now.clone().add(REMINDER_MINUTES_BEFORE - WINDOW_PADDING_MINUTES, 'minutes');
    const appointmentWindowEnd = now.clone().add(REMINDER_MINUTES_BEFORE + WINDOW_PADDING_MINUTES, 'minutes');

    console.log(`Current time: ${now.format('YYYY-MM-DD HH:mm')}`);
    console.log(`Looking for appointments between:
      ${appointmentWindowStart.format('YYYY-MM-DD HH:mm')} and 
      ${appointmentWindowEnd.format('YYYY-MM-DD HH:mm')}`);

    // Get the dates we need to query
    const dates = [];
    let currentDate = appointmentWindowStart.clone();
    while (currentDate.isSameOrBefore(appointmentWindowEnd, 'day')) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }

    // Query appointments for all relevant dates
    const appointmentQueries = dates.map(date => 
      db.collection('appointments')
        .where('date', '==', date)
        .where('status', '==', 'accepted')
        .where('reminderSent', '==', false)
        .get()
    );

    const snapshots = await Promise.all(appointmentQueries);
    let appointments = [];

    snapshots.forEach(snapshot => {
      if (!snapshot.empty) {
        snapshot.docs.forEach(doc => {
          const appointment = { id: doc.id, ...doc.data() };
          
          // Convert appointment time to moment object
          const appointmentDateTime = moment.tz(
            `${appointment.date} ${appointment.time}`, 
            'YYYY-MM-DD HH:mm', 
            APP_TIMEZONE
          );
          
          // Check if this appointment falls within our target window
          if (appointmentDateTime.isBetween(appointmentWindowStart, appointmentWindowEnd, null, '[]')) {
            appointments.push({
              ...appointment,
              appointmentDateTime: appointmentDateTime.format('YYYY-MM-DD HH:mm')
            });
          }
        });
      }
    });

    if (appointments.length === 0) {
      console.log('No appointments found in the target window');
      return;
    }

    console.log(`Found ${appointments.length} appointments to send reminders for`);

    const reminderPromises = appointments.map(async (appointment) => {
      try {
        // Get both user documents
        const [clientDoc, counselorDoc] = await Promise.all([
          db.collection('users').doc(appointment.clientId).get(),
          db.collection('users').doc(appointment.peerCounselorId).get()
        ]);
        
        if (!clientDoc.exists || !counselorDoc.exists) {
          console.error(`User documents missing for appointment ${appointment.id}`);
          return;
        }

        const client = clientDoc.data();
        const counselor = counselorDoc.data();

        // Debug log before decryption
        console.log('Encrypted emails:', {
          clientEmail: client.email,
          counselorEmail: counselor.email
        });

        const clientEmail = await decrypt(client.email);
        const counselorEmail = await decrypt(counselor.email);

        const clientName = await decrypt(client.fullName);
        const counselorName = await decrypt(counselor.fullName);

        if (!clientEmail || !counselorEmail) {
          console.error(`Missing or invalid encrypted email for appointment ${appointment.id}`);
          return;
        }

        const reminderDetails = {
          date: appointment.date,
          time: appointment.time,
          clientName: clientName,
          peerCounselorName: counselorName,
          roomLink: `${PROD_APP_URL}/counseling/${appointment.roomId}`
        };

        await Promise.all([
          sendAppointmentReminder(clientEmail, counselorEmail, reminderDetails),
          // Mark reminder as sent
          db.collection('appointments').doc(appointment.id).update({
            reminderSent: true,
            lastReminderSentAt: now.toDate()
          })
        ]);

        // Store reminder in database
        await createReminderNotification(appointment, counselorName, clientName);

        console.log(`Reminder sent for appointment ${appointment.id} on ${appointment.date} at ${appointment.time}`);
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
      }
    });

    // Wait for all reminders to be processed
    const results = await Promise.allSettled(reminderPromises);
    
    // Log summary of results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    console.log(`Reminder processing complete. Success: ${successful}, Failed: ${failed}`);

  } catch (error) {
    console.error('Critical error in appointment reminder cron job:', error);
  }
});

module.exports = { schedulerService: cron };