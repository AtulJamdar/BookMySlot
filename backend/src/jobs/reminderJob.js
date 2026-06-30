const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendEmail } = require('../utils/email');
const templates = require('../utils/emailTemplates');

/**
 * Initiates the node-cron scheduler to run daily at 8:00 AM IST.
 * Queries confirmed bookings set for tomorrow and sends email reminders.
 */
const startReminderJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Reminder Job] Running daily 24-hour appointment reminder scheduler...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      const tomorrowStr = `${year}-${month}-${day}`;

      const bookings = await Booking.find({
        date: tomorrowStr,
        status: 'confirmed'
      })
      .populate('businessId', 'name')
      .populate('serviceId', 'name');

      console.log(`[Reminder Job] Found ${bookings.length} confirmed bookings scheduled for tomorrow (${tomorrowStr}).`);

      let successCount = 0;
      for (const booking of bookings) {
        try {
          const reminderHtml = templates.bookingReminder({
            customerName: booking.customerName,
            serviceName: booking.serviceId?.name || 'Appointment',
            date: booking.date,
            startTime: booking.startTime,
            businessName: booking.businessId?.name || 'Provider'
          });

          const result = await sendEmail({
            to: booking.customerEmail,
            subject: `Reminder: Your appointment tomorrow at ${booking.businessId?.name || 'BookMySlot'}`,
            html: reminderHtml
          });

          if (result.success) {
            successCount++;
          }
        } catch (itemError) {
          console.error(`[Reminder Job] Error sending email reminder for booking ${booking.bookingRef}:`, itemError.message);
        }
      }

      console.log(`[Reminder Job] Finished reminder run. Successfully dispatched ${successCount} / ${bookings.length} notifications.`);
    } catch (error) {
      console.error('[Reminder Job] Job crashed with error:', error.message);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('[Reminder Job] Scheduler successfully mounted (Asia/Kolkata 8:00 AM IST).');
};

module.exports = {
  startReminderJob
};
