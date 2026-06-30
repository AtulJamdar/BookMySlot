module.exports = {
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT, 10) || 2525,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  },
  from: process.env.EMAIL_FROM || 'BookMySlot <no-reply@bookmyslot.com>'
};
