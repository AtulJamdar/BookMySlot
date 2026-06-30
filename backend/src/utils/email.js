const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');

let transporter;

try {
  transporter = nodemailer.createTransport(emailConfig);
} catch (error) {
  console.error('Failed to initialize nodemailer transporter:', error.message);
}

/**
 * Wraps nodemailer sendMail. Logs errors but never throws.
 * Resilient design ensures email failures do not interrupt database transactions.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn('Email dispatch skipped: nodemailer transporter is not initialized.');
    return { success: false, message: 'Nodemailer transporter is not initialized' };
  }

  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      html
    });
    console.log(`[Email Success] Dispatched email to "${to}" | Subject: "${subject}" | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Failure] Failed sending email to "${to}":`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};
