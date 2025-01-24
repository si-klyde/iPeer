const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const emailStyles = `
  <style>
    .email-container {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      background-color: #4a90e2;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 0 0 5px 5px;
    }
    .appointment-details {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
`;

const sendAppointmentConfirmation = async (clientEmail, counselorEmail, appointmentDetails) => {
  
  if (appointmentDetails.status !== 'accepted') {
    console.log('Appointment not confirmed. Skipping reminder email.');
    return;
  }
  
  // Email to client
  const clientMailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Appointment Confirmation - iPeer Counseling Session',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Appointment Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear valued client,</p>
          <p>We are pleased to confirm your upcoming counseling session with iPeer.</p>
          
          <div class="appointment-details">
            <p><strong>Session Details:</strong></p>
            <p>📅 Date: ${appointmentDetails.date}</p>
            <p>🕒 Time: ${appointmentDetails.time}</p>
            <p>👤 Peer Counselor: ${appointmentDetails.peerCounselorName}</p>
            <p>🔗 Virtual Room: <a href="${appointmentDetails.roomLink}">Click here to join the session</a></p>
          </div>
          
          <p>We look forward to your participation in the session.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  // Email to peer counselor
  const counselorMailOptions = {
    from: process.env.EMAIL_USER,
    to: counselorEmail,
    subject: 'New Appointment Scheduled - iPeer Counseling Session',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>New Session Scheduled</h2>
        </div>
        <div class="content">
          <p>Dear Peer Counselor,</p>
          <p>A new counseling session has been scheduled.</p>
          
          <div class="appointment-details">
            <p><strong>Session Details:</strong></p>
            <p>📅 Date: ${appointmentDetails.date}</p>
            <p>🕒 Time: ${appointmentDetails.time}</p>
            <p>👤 Client Name: ${appointmentDetails.clientName}</p>
          </div>
          
          <p>Please ensure you are available at the scheduled time.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
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
    subject: 'Appointment Status Update - iPeer Counseling Session',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Appointment Status Update</h2>
        </div>
        <div class="content">
          <p>Dear valued client,</p>
          <p>We regret to inform you that your appointment request has been declined.</p>
          
          <div class="appointment-details">
            <p><strong>Requested Session Details:</strong></p>
            <p>📅 Date: ${appointmentDetails.date}</p>
            <p>🕒 Time: ${appointmentDetails.time}</p>
          </div>
          
          <p>We encourage you to schedule another appointment at your convenience.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  // Email to peer counselor
  const counselorMailOptions = {
    from: process.env.EMAIL_USER,
    to: counselorEmail,
    subject: 'Appointment Rejection Confirmation - iPeer Counseling',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Appointment Rejection Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear Peer Counselor,</p>
          <p>This email confirms that you have declined the following appointment request.</p>
          
          <div class="appointment-details">
            <p><strong>Declined Session Details:</strong></p>
            <p>📅 Date: ${appointmentDetails.date}</p>
            <p>🕒 Time: ${appointmentDetails.time}</p>
            <p>👤 Client: ${appointmentDetails.clientName}</p>
          </div>
          
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
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
    subject: 'Upcoming Appointment Reminder - iPeer Counseling Session',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Appointment Reminder</h2>
        </div>
        <div class="content">
          <p>Dear valued client,</p>
          <p>This is a reminder of your upcoming counseling session in 1 hour.</p>
          
          <div class="appointment-details">
            <p><strong>Session Details:</strong></p>
            <p>🕒 Time: ${appointmentDetails.time}</p>
            <p>👤 Peer Counselor: ${appointmentDetails.peerCounselorName}</p>
            <p>🔗 Virtual Room: <a href="${appointmentDetails.roomLink}">Click here to join the session</a></p>
          </div>
          
          <p>We look forward to your participation.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  // Email to peer counselor
  const counselorMailOptions = {
    from: process.env.EMAIL_USER,
    to: counselorEmail,
    subject: 'Upcoming Session Reminder - iPeer Counseling',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Session Reminder</h2>
        </div>
        <div class="content">
          <p>Dear Peer Counselor,</p>
          <p>This is a reminder of your upcoming counseling session in 1 hour.</p>
          
          <div class="appointment-details">
            <p><strong>Session Details:</strong></p>
            <p>🕒 Time: ${appointmentDetails.time}</p>
            <p>👤 Client: ${appointmentDetails.clientName}</p>
            <p>🔗 Virtual Room: <a href="${appointmentDetails.roomLink}">Click here to join the session</a></p>
          </div>
          
          <p>Please ensure you are ready for the session.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  await Promise.all([
    transporter.sendMail(clientMailOptions),
    transporter.sendMail(counselorMailOptions)
  ]);
};

const sendPeerCounselorInvitation = async (email, registrationLink, collegeDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Invitation to Join iPeer as Peer Counselor',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>iPeer Peer Counselor Invitation</h2>
        </div>
        <div class="content">
          <p>Dear Future Peer Counselor,</p>
          <p>You have been invited to join iPeer as a Peer Counselor for ${collegeDetails}.</p>
          
          <div class="appointment-details">
            <p><strong>Registration Details:</strong></p>
            <p>🎓 College: ${collegeDetails}</p>
            <p>🔗 Registration Link: <a href="${registrationLink}">Click here to register</a></p>
          </div>
          
          <p>This invitation link will expire in 24 hours.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${PROD_APP_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your iPeer Password',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Dear Peer Counselor,</p>
          <p>We received a request to reset your iPeer account password.</p>
          
          <div class="appointment-details">
            <p><strong>Reset Password Instructions:</strong></p>
            <p>Click the link below to reset your password:</p>
            <p>🔗 <a href="${resetLink}">Reset Password</a></p>
            <p>⚠️ This link will expire in 1 hour</p>
          </div>
          
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (adminEmail, verificationCode, counselorName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'Delete Verification Code - iPeer',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Delete Verification Code</h2>
        </div>
        <div class="content">
          <p>Dear Admin,</p>
          <p>You have requested to delete peer counselor: <strong>${counselorName}</strong></p>
          
          <div class="appointment-details">
            <p><strong>Your verification code is:</strong></p>
            <h2 style="font-size: 32px; letter-spacing: 5px; color: #dc2626;">${verificationCode}</h2>
            <p>This code will expire in 10 minutes.</p>
          </div>
          
          <p>If you did not request this deletion, please ignore this email.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendAdminPasswordResetEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Code - iPeer Admin',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Password Reset Verification</h2>
        </div>
        <div class="content">
          <p>Dear Admin,</p>
          <p>You have requested to reset your password.</p>
          
          <div class="appointment-details">
            <p><strong>Your verification code is:</strong></p>
            <h2 style="font-size: 32px; letter-spacing: 5px; text-align: center; color: #059669;">${verificationCode}</h2>
            <p>⚠️ This code will expire in 10 minutes.</p>
          </div>
          
          <p>If you did not request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendRescheduleNotification = async (clientEmail, counselorEmail, appointmentDetails) => {
  // Email to client
  const clientMailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Appointment Reschedule Request - iPeer Counseling',
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Appointment Reschedule Request</h2>
        </div>
        <div class="content">
          <p>Dear valued client,</p>
          <p>Your peer counselor has requested to reschedule your appointment.</p>
          
          <div class="appointment-details">
            <p><strong>New Proposed Schedule:</strong></p>
            <p>📅 Date: ${appointmentDetails.newDate}</p>
            <p>🕒 Time: ${appointmentDetails.newTime}</p>
            <p>✏️ Reason: ${appointmentDetails.newDescription}</p>
            <p><strong>Original Schedule:</strong></p>
            <p>📅 Date: ${appointmentDetails.originalDate}</p>
            <p>🕒 Time: ${appointmentDetails.originalTime}</p>
          </div>
          
          <p>Please log in to your iPeer account to accept or decline this request.</p>
          <p>Best regards,<br>The iPeer Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(clientMailOptions);
};

const sendRescheduleResponseNotification = async (counselorEmail, appointmentDetails, wasAccepted) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: counselorEmail,
    subject: `Reschedule Request ${wasAccepted ? 'Accepted' : 'Declined'} - iPeer Counseling`,
    html: `
      ${emailStyles}
      <div class="email-container">
        <div class="header">
          <h2>Reschedule Request ${wasAccepted ? 'Accepted' : 'Declined'}</h2>
        </div>
        <div class="content">
          <p>The client has ${wasAccepted ? 'accepted' : 'declined'} your reschedule request.</p>
          
          <div class="appointment-details">
            <p><strong>${wasAccepted ? 'Confirmed Schedule:' : 'Requested Schedule (Declined):'}</strong></p>
            <p>📅 Date: ${appointmentDetails.newDate}</p>
            <p>🕒 Time: ${appointmentDetails.newTime}</p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentRejection,
  sendPeerCounselorInvitation,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendAdminPasswordResetEmail,
  sendRescheduleNotification,
  sendRescheduleResponseNotification
};
