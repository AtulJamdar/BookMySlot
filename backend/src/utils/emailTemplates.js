/**
 * Beautiful, mobile-responsive HTML templates with inline styling for lifecycle emails.
 */

const baseTemplate = (contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BookMySlot Notifications</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #d4d4d8;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #121217; border: 1px solid #27272a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">
    <!-- Header -->
    <tr>
      <td style="padding: 24px; text-align: center; border-bottom: 1px solid #1f1f23; background-color: #18181b;">
        <span style="font-size: 20px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">BookMySlot</span>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 32px 24px;">
        ${contentHtml}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 24px; text-align: center; border-top: 1px solid #1f1f23; background-color: #0b0b0f; font-size: 11px; color: #52525b;">
        <p style="margin: 0;">This is an automated notification. Please do not reply directly to this email.</p>
        <p style="margin: 4px 0 0 0;">&copy; 2026 BookMySlot. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const bookingConfirmation = ({ customerName, serviceName, staffName, date, startTime, businessName, bookingRef }) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: bold;">Appointment Confirmed!</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
      Hi ${customerName}, your appointment at <strong>${businessName}</strong> is successfully scheduled. Below are your booking reservation details:
    </p>
    <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
      <tr style="background-color: #18181b;">
        <td style="padding: 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid #27272a; font-weight: bold; width: 140px;">Booking Ref</td>
        <td style="padding: 12px; font-size: 13px; color: #34d399; font-family: monospace; border-bottom: 1px solid #27272a; font-weight: bold;">${bookingRef}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid #27272a; font-weight: bold;">Service</td>
        <td style="padding: 12px; font-size: 13px; color: #ffffff; border-bottom: 1px solid #27272a; font-weight: bold;">${serviceName}</td>
      </tr>
      <tr style="background-color: #18181b;">
        <td style="padding: 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid #27272a; font-weight: bold;">Practitioner</td>
        <td style="padding: 12px; font-size: 13px; color: #e4e4e7; border-bottom: 1px solid #27272a;">${staffName}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid #27272a; font-weight: bold;">Date</td>
        <td style="padding: 12px; font-size: 13px; color: #e4e4e7; border-bottom: 1px solid #27272a;">${date}</td>
      </tr>
      <tr style="background-color: #18181b;">
        <td style="padding: 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid #27272a; font-weight: bold;">Time Window</td>
        <td style="padding: 12px; font-size: 13px; color: #e4e4e7; border-bottom: 1px solid #27272a;">${startTime}</td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
      Need to make changes? Customers can cancel appointments up to 1 hour prior to start time through their customer portal.
    </p>
  `;
  return baseTemplate(content);
};

const bookingCancellation = ({ customerName, serviceName, date, startTime, businessName }) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #ef4444; font-size: 20px; font-weight: bold;">Appointment Cancelled</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
      Hi ${customerName}, your appointment for <strong>${serviceName}</strong> at <strong>${businessName}</strong> on <strong>${date} at ${startTime}</strong> has been cancelled.
    </p>
    <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.5;">
      If you did not request this cancellation or would like to reschedule, please visit our booking page to reserve another slot.
    </p>
  `;
  return baseTemplate(content);
};

const lateCancellationApology = ({ customerName, serviceName, date, startTime, businessName, reason }) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #ef4444; font-size: 20px; font-weight: bold;">Apology: Appointment Cancelled</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
      Dear ${customerName}, we regret to inform you that your upcoming session for <strong>${serviceName}</strong> at <strong>${businessName}</strong> on <strong>${date} at ${startTime}</strong> had to be cancelled by the provider.
    </p>
    <div style="background-color: #1c1917; border-left: 4px solid #f97316; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; color: #f5f5f7; font-weight: 500;">Provider's Reason:</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #d6d3d1; font-style: italic;">"${reason || 'Unexpected scheduling conflict'}"</p>
    </div>
    <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.5;">
      We sincerely apologize for any inconvenience caused. Please visit our portal to book a new appointment.
    </p>
  `;
  return baseTemplate(content);
};

const welcomeBusiness = ({ ownerName, businessName, dashboardUrl }) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: bold;">Welcome to BookMySlot!</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
      Hi ${ownerName}, congratulations on registering <strong>${businessName}</strong>! Your service scheduling portal is fully active and ready to take bookings.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl}" style="background-color: #ffffff; color: #09090b; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a>
    </div>
    <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.5;">
      Get started by setting up your services catalog, adding staff profiles, and configuring slot hours!
    </p>
  `;
  return baseTemplate(content);
};

const bookingReminder = ({ customerName, serviceName, date, startTime, businessName }) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #3b82f6; font-size: 20px; font-weight: bold;">Upcoming Session Reminder</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
      Hi ${customerName}, this is a reminder for your upcoming appointment tomorrow:
    </p>
    <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid #27272a; font-weight: bold; width: 140px;">Service</td>
        <td style="padding: 12px; font-size: 13px; color: #ffffff; border-bottom: 1px solid #27272a; font-weight: bold;">${serviceName}</td>
      </tr>
      <tr style="background-color: #18181b;">
        <td style="padding: 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid #27272a; font-weight: bold;">Provider</td>
        <td style="padding: 12px; font-size: 13px; color: #e4e4e7; border-bottom: 1px solid #27272a;">${businessName}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid #27272a; font-weight: bold;">Schedule</td>
        <td style="padding: 12px; font-size: 13px; color: #e4e4e7; border-bottom: 1px solid #27272a;">${date} at ${startTime}</td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
      We look forward to seeing you. If you need to make updates, please contact us or login to your dashboard.
    </p>
  `;
  return baseTemplate(content);
};

module.exports = {
  bookingConfirmation,
  bookingCancellation,
  lateCancellationApology,
  welcomeBusiness,
  bookingReminder
};
