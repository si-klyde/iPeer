const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendAppointmentConfirmation = async (clientEmail, counselorEmail, appointmentDetails) => {
  // Email to client
  const clientMailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Appointment Confirmation',
    html: `
      <h2>Your appointment has been confirmed</h2>
      <p>Date: ${appointmentDetails.date}</p>
      <p>Time: ${appointmentDetails.time}</p>
      <p>Peer Counselor: ${appointmentDetails.peerCounselorName}</p>
    `
  };

  // Email to peer counselor
  const counselorMailOptions = {
    from: process.env.EMAIL_USER,
    to: counselorEmail,
    subject: 'New Appointment Scheduled',
    html: `
      <h2>New appointment scheduled</h2>
      <p>Date: ${appointmentDetails.date}</p>
      <p>Time: ${appointmentDetails.time}</p>
      <p>Client: ${appointmentDetails.clientName}</p>
    `
  };

  await Promise.all([
    transporter.sendMail(clientMailOptions),
    transporter.sendMail(counselorMailOptions)
  ]);
};

const sendAppointmentReminder = async (clientEmail, counselorEmail, appointmentDetails) => {
  // Email to client
  const clientMailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Appointment Reminder',
    html: `
      <h2>Reminder: Your appointment is in 1 hour</h2>
      <p>Time: ${appointmentDetails.time}</p>
      <p>Peer Counselor: ${appointmentDetails.peerCounselorName}</p>
      <p>Room Link: ${appointmentDetails.roomLink}</p>
    `
  };

  // Email to peer counselor
  const counselorMailOptions = {
    from: process.env.EMAIL_USER,
    to: counselorEmail,
    subject: 'Appointment Reminder',
    html: `
      <h2>Reminder: You have an appointment in 1 hour</h2>
      <p>Time: ${appointmentDetails.time}</p>
      <p>Client: ${appointmentDetails.clientName}</p>
      <p>Room Link: ${appointmentDetails.roomLink}</p>
    `
  };

  await Promise.all([
    transporter.sendMail(clientMailOptions),
    transporter.sendMail(counselorMailOptions)
  ]);
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder
};
