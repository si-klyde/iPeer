const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendAppointmentConfirmation = async (clientEmail, counselorEmail, appointmentDetails) => {
  
  if (appointmentDetails.status !== 'accepted') {
    console.log('Appointment not confirmed. Skipping reminder email.');
    return;
  }
  
  // Email to client
  const clientMailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Ipeer Appointment Confirmation!',
    html: `
      <h2>Your appointment has been confirmed</h2>
      <p>Date: ${appointmentDetails.date}</p>
      <p>Time: ${appointmentDetails.time}</p>
      <p>Peer Counselor: ${appointmentDetails.peerCounselorName}</p>
      <p>Room Link: ${appointmentDetails.roomLink}</p>
      <p>See you!</p>
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
      <p>Client Name: ${appointmentDetails.clientName}</p>
      <p>Room Link: ${appointmentDetails.roomLink}</p>
    `
  };

  await Promise.all([
    transporter.sendMail(clientMailOptions),
    transporter.sendMail(counselorMailOptions)
  ]);
};

const sendAppointmentRejection = async (clientEmail, counselorEmail, appointmentDetails) => {
  // Email to client
  const clientMailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'iPeer Appointment Status Update',
    html: `
      <h2>Your appointment request has been declined</h2>
      <p>Date: ${appointmentDetails.date}</p>
      <p>Time: ${appointmentDetails.time}</p>
      <p>Please try booking another schedule.</p>
    `
  };

  // Email to peer counselor (confirmation of rejection)
  const counselorMailOptions = {
    from: process.env.EMAIL_USER,
    to: counselorEmail,
    subject: 'Appointment Rejection Confirmation',
    html: `
      <h2>You have declined an appointment</h2>
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
  
  if (appointmentDetails.status !== 'accepted') {
    console.log('Appointment not confirmed. Skipping reminder email.');
    return;
  }

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
  sendAppointmentReminder,
  sendAppointmentRejection
};
