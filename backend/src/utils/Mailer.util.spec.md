# SPEC — backend/src/utils/mailer.util.js

## File Role
Provides a fire-and-forget `sendEmail()` wrapper around nodemailer and exports all HTML email template generator functions. Email sending must never block or fail an API response — all sends are asynchronous and failures are logged silently.

---

## Dependencies

```js
import { transporter } from '../config/email.config.js'; // internal — nodemailer transporter
import { Booking } from '../models/Booking.model.js';    // internal — to update emailSentAt
import { config } from '../config/env.js';               // internal — FROM address
```

---

## Exports

### `sendEmail(options)` — Async Function

**Purpose:** Sends a single email via the nodemailer transporter. Catches all errors internally and logs them — never throws. Returns `true` on success, `false` on failure.

**Parameters:**
```ts
options: {
  to: string;             // recipient email address
  subject: string;        // email subject line
  html: string;           // HTML body (from a template function below)
  bookingId?: string;     // optional ObjectId — if provided, updates Booking.emailSentAt on success
}
```

**Return:** `Promise<boolean>` — `true` if sent successfully, `false` if transport failed

**Side effects:**
- Sends SMTP email via nodemailer transporter
- If `bookingId` is provided and send succeeds: updates `Booking.emailSentAt = new Date()` asynchronously (fire-and-forget — does not await this update)

**Throws:** Never — all errors caught internally with `console.error`

**Usage pattern (always fire-and-forget from service layer):**
```js
// In booking.service.js — do NOT await this
sendEmail({
  to: booking.customerEmail,
  subject: 'Your booking is confirmed — BookMySlot',
  html: bookingConfirmationTemplate({ ... }),
  bookingId: booking._id.toString(),
});
```

---

### `bookingConfirmationTemplate(data)` — Pure Function

**Purpose:** Generates the HTML string for a booking confirmation email.

**Parameters:**
```ts
data: {
  customerName: string;
  bookingRef: string;
  serviceName: string;
  staffName: string | null;
  date: string;         // YYYY-MM-DD — format to human-readable in template
  startTime: string;    // HH:MM — e.g. "10:00"
  endTime: string;      // HH:MM
  businessName: string;
  businessPhone: string;
  businessCity: string;
}
```

**Return:** `string` — complete single-column inline-styled HTML email

**Side effects:** None — pure function
**Throws:** Never

---

### `bookingCancellationTemplate(data)` — Pure Function

**Parameters:**
```ts
data: {
  customerName: string;
  bookingRef: string;
  serviceName: string;
  date: string;
  startTime: string;
  businessName: string;
  reason?: string;   // cancellation reason if provided
}
```

**Return:** `string` — HTML email body
**Side effects:** None

---

### `lateCancellationApologyTemplate(data)` — Pure Function

**Purpose:** Sent additionally when a business cancels within 1 hour of the appointment.

**Parameters:**
```ts
data: {
  customerName: string;
  bookingRef: string;
  serviceName: string;
  date: string;
  startTime: string;
  businessName: string;
  businessPhone: string;
}
```

**Return:** `string` — HTML email body
**Side effects:** None

---

### `welcomeBusinessTemplate(data)` — Pure Function

**Parameters:**
```ts
data: {
  ownerName: string;
  businessName: string;
  bookingUrl: string;    // e.g. https://bookmyslot.in/b/sunshine-salon
  dashboardUrl: string;  // e.g. https://bookmyslot.in/dashboard
}
```

**Return:** `string` — HTML email body
**Side effects:** None

---

### `bookingReminderTemplate(data)` — Pure Function

**Purpose:** Used by the 24h reminder cron job.

**Parameters:**
```ts
data: {
  customerName: string;
  bookingRef: string;
  serviceName: string;
  staffName: string | null;
  date: string;
  startTime: string;
  businessName: string;
  businessPhone: string;
}
```

**Return:** `string` — HTML email body
**Side effects:** None

---

## Data Contracts

### Email Template Design Rules

All templates must follow these constraints:
- Single-column layout (max-width: 600px, centered)
- All CSS must be **inline** (`style=""` attributes) — email clients strip `<style>` tags
- No external CSS files or framework classes
- Mobile-readable: base font size ≥ 16px, links ≥ 44px tap target
- Plain white background (`#ffffff`) with light grey container (`#f5f5f5`)
- Accent colour: `#4F46E5` (indigo) for buttons and headings
- Fallback plain-text equivalent should be inferable from the HTML structure
- Footer must include: "BookMySlot — Appointment Booking Platform" + unsubscribe note

### `FROM` address
```
"BookMySlot" <no-reply@bookmyslot.in>
```
Read from `config.EMAIL_USER`. Display name hardcoded as `"BookMySlot"`.

### Date formatting in templates
`YYYY-MM-DD` strings must be converted to human-readable format:
```
"2026-07-15" → "Wednesday, 15 July 2026"
```
Use JavaScript `Date` with `Intl.DateTimeFormat` or a manual mapping. Do NOT use any external date library (keeps the bundle lean).

---

## Rules & Constraints

1. `sendEmail()` must **never throw** and must **never cause an `await`** in the calling service to fail. All SMTP errors are caught inside `sendEmail()`.
2. Emails are always sent **asynchronously** — call `sendEmail()` without `await` from service functions. The booking creation response (HTTP 201) must not wait for the email to send.
3. `Booking.emailSentAt` update inside `sendEmail()` is also fire-and-forget — a Mongoose update failure here must be swallowed silently.
4. Template functions are pure — they take data and return strings. No database queries, no side effects.
5. All inline CSS in templates must be tested across: Gmail (web), Gmail (mobile), Apple Mail, Outlook.com. The minimum viable bar is single-column readability.
6. The `FROM` display name must always be `"BookMySlot"` regardless of which SMTP account is used.
7. No external email template library (Handlebars, MJML, etc.) — templates are plain JS template literals to keep dependencies minimal.
8. `sendEmail()` must log the full error (including stack trace) via `console.error` when the transport fails — never swallow errors silently without logging.

---

## Do NOT

- Do NOT `await sendEmail()` in any service function — always fire-and-forget.
- Do NOT throw from `sendEmail()` — catch all SMTP errors internally.
- Do NOT use external CSS in email templates — inline only.
- Do NOT use external date libraries in templates.
- Do NOT query the database inside template functions.
- Do NOT put email sending logic in controllers — only in services, and only via `sendEmail()`.
- Do NOT hardcode email addresses — always read from `config`.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/config/email.config.js` | Provides the nodemailer transporter instance |
| `src/config/env.js` | Provides `EMAIL_USER` for FROM address and `FRONTEND_URL` for dashboard link |
| `src/models/Booking.model.js` | `emailSentAt` field is updated after successful send |
| `src/services/booking.service.js` | Calls `sendEmail()` after booking creation and cancellation |
| `src/services/auth.service.js` | Calls `sendEmail()` with `welcomeBusinessTemplate` after owner registration |
| `src/jobs/reminderJob.js` | Calls `sendEmail()` with `bookingReminderTemplate` for each upcoming booking |