# SPEC — backend/src/models/Service.model.js

## File Role
Defines the Mongoose schema and model for a bookable service offered by a business (e.g., "Haircut", "Root Canal"). Every service belongs to exactly one tenant via `businessId`.

---

## Dependencies

```js
import mongoose from 'mongoose'; // npm
```

---

## Exports

### Default export: `Service` (Mongoose Model)

No instance methods or static methods beyond standard Mongoose API.

---

## Data Contracts

### Schema Fields

| Field             | Type     | Required | Default | Validation / Notes                                                     |
|-------------------|----------|----------|---------|------------------------------------------------------------------------|
| `businessId`      | ObjectId | ✅       | —       | ref: `'Business'`; tenant key — every query must filter by this        |
| `name`            | String   | ✅       | —       | minLength: 2, maxLength: 100, trim: true                               |
| `description`     | String   | ❌       | null    | maxLength: 300                                                         |
| `durationMinutes` | Number   | ✅       | —       | min: 15, max: 480; must be multiple of 15 — validated in service layer |
| `priceINR`        | Number   | ✅       | —       | min: 0 (free consultations allowed); must be a non-negative number     |
| `isActive`        | Boolean  | ❌       | `true`  | false = soft-deleted; hidden from public listing                       |
| `createdAt`       | Date     | auto     | —       | via `timestamps: true`                                                 |
| `updatedAt`       | Date     | auto     | —       | via `timestamps: true`                                                 |

### Indexes

| Fields                      | Options   | Reason                                              |
|-----------------------------|-----------|-----------------------------------------------------|
| `{ businessId, isActive }`  | compound  | Primary query pattern: list active services per business |
| `{ businessId, name }`      | compound  | Duplicate name check within a business              |

---

## Rules & Constraints

1. `durationMinutes` must be a positive multiple of 15 (15, 30, 45, 60, 90, 120, 180, 240). **Validated in `service.service.js`**, not in the model — the model uses `min: 15` only.
2. `name` must be unique (case-insensitive) within a `businessId`. Enforced with a query in `service.service.js` before `create()`. No model-level unique index on `{businessId, name}` to avoid case sensitivity issues with MongoDB default collation.
3. Deletion is always a soft-delete: set `isActive: false`. Hard deletion is not permitted in V1.
4. A service with `isActive: false` must not appear in `GET /businesses/:businessId/services` results.
5. Soft-deleted services must still be readable via `populate()` on existing Booking documents — historical integrity must be preserved.

---

## Do NOT

- Do NOT validate `durationMinutes % 15 === 0` in the schema — use a custom validator in the service.
- Do NOT hard-delete Service documents.
- Do NOT query services without a `businessId` filter — every query must be tenant-scoped.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/models/Business.model.js` | `businessId` foreign key |
| `src/models/Staff.model.js` | Staff.serviceIds[] references Service._id |
| `src/models/Booking.model.js` | Booking.serviceId references Service._id |
| `src/services/service.service.js` | All CRUD operations |
| `src/services/slot.service.js` | Reads `durationMinutes` for slot window calculation |

---
---

# SPEC — backend/src/models/Staff.model.js

## File Role
Defines the Mongoose schema and model for a staff member who belongs to one business tenant and can be assigned to deliver one or more services. Staff are NOT system users — they have no login credentials.

---

## Dependencies

```js
import mongoose from 'mongoose'; // npm
```

---

## Exports

### Default export: `Staff` (Mongoose Model)

---

## Data Contracts

### Sub-schema: `StaffWorkingHoursEntry`
Identical structure to `Business.WorkingHoursEntry`:

| Field   | Type   | Required | Validation                          |
|---------|--------|----------|-------------------------------------|
| `day`   | String | ✅       | enum of 7 weekday strings           |
| `start` | String | ✅       | HH:MM 24h pattern                   |
| `end`   | String | ✅       | HH:MM 24h pattern; must be > start  |

### Main Schema Fields

| Field          | Type        | Required | Default | Validation / Notes                                                    |
|----------------|-------------|----------|---------|-----------------------------------------------------------------------|
| `businessId`   | ObjectId    | ✅       | —       | ref: `'Business'`; tenant key                                         |
| `name`         | String      | ✅       | —       | minLength: 2, maxLength: 100, trim: true                              |
| `title`        | String      | ❌       | null    | maxLength: 60; e.g., "Senior Stylist"                                |
| `serviceIds`   | [ObjectId]  | ✅       | —       | ref: `'Service'`; minLength: 1 — must be assigned to ≥ 1 service     |
| `workingHours` | [SubSchema] | ❌       | `[]`    | per-staff override; if empty, inherits Business.workingHours at runtime |
| `isActive`     | Boolean     | ❌       | `true`  | false = soft-deleted                                                  |
| `createdAt`    | Date        | auto     | —       | via `timestamps: true`                                                |
| `updatedAt`    | Date        | auto     | —       | via `timestamps: true`                                                |

### Indexes

| Fields                     | Options  | Reason                                     |
|----------------------------|----------|--------------------------------------------|
| `{ businessId, isActive }` | compound | Primary query pattern: active staff per business |

---

## Rules & Constraints

1. All ObjectIds in `serviceIds` must belong to the same `businessId`. **Validated in `staff.service.js`** before create/update — query `Service.find({ _id: { $in: serviceIds }, businessId })` and compare counts.
2. A staff member must have `serviceIds.length >= 1` to be creatable. A staff member with no services cannot appear in the booking flow.
3. When `workingHours` is empty, `slot.service.js` falls back to the parent `Business.workingHours`. The model stores an empty array; the fallback logic is in the service.
4. Deletion is always soft: set `isActive: false`. Historical bookings referencing this staff are preserved.
5. Staff members do not have passwords, emails, or `role` fields — they are operational records, not auth principals.

---

## Do NOT

- Do NOT give staff members login credentials or a `role` field.
- Do NOT validate that `serviceIds` belong to the business inside the model.
- Do NOT query staff without a `businessId` filter.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/models/Business.model.js` | `businessId` FK; working hours fallback source |
| `src/models/Service.model.js` | `serviceIds` references Service documents |
| `src/models/Booking.model.js` | Booking.staffId references Staff._id |
| `src/services/staff.service.js` | All CRUD with serviceId validation |
| `src/services/slot.service.js` | Reads workingHours + serviceIds for availability |

---
---

# SPEC — backend/src/models/TimeSlot.model.js

## File Role
Defines the Mongoose schema and model for stored time slot records — only two states are persisted: `blocked` (manually blocked by owner) and `booked` (atomically created on booking). Available slots are **never stored** — they are computed dynamically by `slot.service.js`. The unique compound index on this model is the race-condition guard for concurrent bookings.

---

## Dependencies

```js
import mongoose from 'mongoose'; // npm
import { SLOT_STATUS } from '../utils/constants.js'; // internal
```

---

## Exports

### Default export: `TimeSlot` (Mongoose Model)

---

## Data Contracts

### Schema Fields

| Field        | Type     | Required | Default | Validation / Notes                                                      |
|--------------|----------|----------|---------|-------------------------------------------------------------------------|
| `businessId` | ObjectId | ✅       | —       | ref: `'Business'`; tenant key                                           |
| `staffId`    | ObjectId | ❌       | null    | ref: `'Staff'`; null means the block/booking applies to all staff       |
| `date`       | String   | ✅       | —       | ISO date string `YYYY-MM-DD`; stored as String for consistent indexing  |
| `startTime`  | String   | ✅       | —       | `HH:MM` 24h format                                                      |
| `endTime`    | String   | ✅       | —       | `HH:MM` 24h format; must be after `startTime` — validated in service    |
| `status`     | String   | ✅       | —       | enum: `['blocked', 'booked']`                                           |
| `bookingId`  | ObjectId | ❌       | null    | ref: `'Booking'`; populated only when `status === 'booked'`             |
| `reason`     | String   | ❌       | null    | maxLength: 200; human-readable block reason for `status === 'blocked'`  |
| `createdAt`  | Date     | auto     | —       | via `timestamps: true`                                                  |

### Indexes — CRITICAL

| Fields                                           | Options          | Reason                                                                         |
|--------------------------------------------------|------------------|--------------------------------------------------------------------------------|
| `{ businessId, staffId, date, startTime }`       | **`unique: true`** | **Race-condition guard** — MongoDB rejects the 2nd concurrent insert with E11000 |
| `{ businessId, date, status }`                   | compound         | Availability query: find all blocked/booked slots for a business+date          |

---

## Rules & Constraints

1. The unique compound index `{ businessId, staffId, date, startTime }` is the **final atomic guarantee** that no two bookings can occupy the same slot. It must never be removed or weakened.
2. `date` is stored as a `String` (`YYYY-MM-DD`), not a `Date` object. This prevents timezone conversion issues — a slot booked for "2026-07-15" in IST must not shift to "2026-07-14" when stored as UTC.
3. When `status === 'booked'`, `bookingId` must be set. When `status === 'blocked'`, `bookingId` must be `null`.
4. A TimeSlot with `status === 'blocked'` may have `staffId: null` (blocks all staff for that window) or a specific `staffId`.
5. When a booking is cancelled (`booking.service.js`), the corresponding TimeSlot document with `status: 'booked'` must be **deleted** (not updated) — this frees the unique index slot for future bookings.
6. Available slots (computed windows with no conflict) are **never stored** in this collection. Only explicit blocks and confirmed bookings are persisted.
7. `date` must be today or in the future when creating a blocked slot. The service enforces this.

---

## Do NOT

- Do NOT store "available" slot records — the available state is implicit (anything not in this collection for that time window is available).
- Do NOT update a `booked` TimeSlot to `available` on cancellation — **delete** it entirely.
- Do NOT remove or modify the unique compound index — it is the primary race-condition safeguard.
- Do NOT store `date` as a native `Date` / ISODate — use a `String` in `YYYY-MM-DD` format.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/models/Booking.model.js` | `bookingId` FK; deleted together in a transaction on cancellation |
| `src/models/Business.model.js` | `businessId` FK |
| `src/models/Staff.model.js` | `staffId` FK |
| `src/services/slotConflict.service.js` | Queries this collection for overlap detection |
| `src/services/slot.service.js` | Creates blocked slots; reads blocked+booked for availability |
| `src/services/booking.service.js` | Creates booked slot in transaction; deletes it on cancellation |
| `src/middleware/errorHandler.middleware.js` | Catches E11000 on this model and returns 409 SLOT_UNAVAILABLE |

---
---

# SPEC — backend/src/models/Booking.model.js

## File Role
Defines the Mongoose schema and model for a confirmed appointment. Booking documents are the source of truth for all analytics, dashboard views, and customer history. They are never hard-deleted — status transitions (`confirmed → cancelled → completed`) are the lifecycle mechanism.

---

## Dependencies

```js
import mongoose from 'mongoose';                      // npm
import { BOOKING_STATUS } from '../utils/constants.js'; // internal
import { generateBookingRef } from '../utils/generateRef.js'; // internal
```

---

## Exports

### Default export: `Booking` (Mongoose Model)

**Pre-save hook:**
- If `bookingRef` is not set (new document), call `generateBookingRef()` and assign to `this.bookingRef`
- Must handle the async nature of `generateBookingRef()` correctly — use `async` pre-save hook

---

## Data Contracts

### Schema Fields

| Field                | Type     | Required | Default       | Validation / Notes                                                        |
|----------------------|----------|----------|---------------|---------------------------------------------------------------------------|
| `bookingRef`         | String   | ✅       | auto-generated | format: `BMS-XXXXX`; unique; generated by pre-save hook                  |
| `businessId`         | ObjectId | ✅       | —             | ref: `'Business'`; tenant key                                             |
| `serviceId`          | ObjectId | ✅       | —             | ref: `'Service'`                                                          |
| `staffId`            | ObjectId | ❌       | null          | ref: `'Staff'`; null if customer chose "any available"                    |
| `customerId`         | ObjectId | ❌       | null          | ref: `'User'`; null for guest bookings                                    |
| `customerName`       | String   | ✅       | —             | denormalised; minLength: 2, maxLength: 100                                |
| `customerEmail`      | String   | ✅       | —             | denormalised; used for confirmation email and guest booking lookup        |
| `customerPhone`      | String   | ✅       | —             | denormalised; pattern: `/^[6-9]\d{9}$/`                                   |
| `date`               | String   | ✅       | —             | `YYYY-MM-DD` String — same timezone reasoning as TimeSlot                |
| `startTime`          | String   | ✅       | —             | `HH:MM` 24h                                                               |
| `endTime`            | String   | ✅       | —             | `HH:MM` 24h; computed as `startTime + service.durationMinutes` in service |
| `status`             | String   | ✅       | `'confirmed'` | enum: `['confirmed', 'cancelled', 'completed']`                           |
| `cancelledBy`        | String   | ❌       | null          | enum: `['customer', 'business', null]`; set only when status = cancelled  |
| `cancellationReason` | String   | ❌       | null          | maxLength: 300                                                            |
| `emailSentAt`        | Date     | ❌       | null          | timestamp when confirmation email was dispatched; updated async           |
| `createdAt`          | Date     | auto     | —             | via `timestamps: true`                                                    |
| `updatedAt`          | Date     | auto     | —             | via `timestamps: true`                                                    |

### Indexes

| Fields                                   | Options  | Reason                                              |
|------------------------------------------|----------|-----------------------------------------------------|
| `{ businessId, date, staffId, status }`  | compound | Slot conflict overlap query — the most critical index |
| `{ businessId, status, createdAt }`      | compound | Owner dashboard + analytics queries                 |
| `{ customerEmail }`                      | standard | Guest booking lookup in `GET /bookings/my`          |
| `bookingRef`                             | unique   | Human-readable reference lookup                     |

---

## Rules & Constraints

1. `bookingRef` must be unique and in the format `BMS-XXXXX`. Generated by the pre-save hook via `generateBookingRef()`.
2. `customerName`, `customerEmail`, `customerPhone` are **denormalised** (copied from the request at booking time). They must not be updated after creation — even if the customer's User document changes. These fields exist for display performance and guest booking support.
3. `endTime` is computed in `booking.service.js` as `startTime + service.durationMinutes` and stored on the document. It must not be supplied by the client.
4. A booking with `status: 'cancelled'` must always have `cancelledBy` set. A booking with `status: 'confirmed'` or `'completed'` must have `cancelledBy: null`.
5. `status` transitions are strictly one-directional: `confirmed → cancelled` and `confirmed → completed`. A cancelled booking cannot be uncancelled. A completed booking cannot be cancelled.
6. Booking documents are **never hard-deleted**. All historical bookings must be preserved for analytics.
7. The `{ businessId, date, staffId, status }` compound index is critical for the conflict check query in `slotConflict.service.js`. It must exist.

---

## Do NOT

- Do NOT allow the client to supply `endTime` — compute it server-side.
- Do NOT hard-delete Booking documents.
- Do NOT update `customerName`, `customerEmail`, or `customerPhone` after creation.
- Do NOT perform the slot conflict check in this model — it belongs exclusively in `slotConflict.service.js`.
- Do NOT transition status backwards (cancelled → confirmed, completed → confirmed).
- Do NOT send emails from this model — use `mailer.util.js` from `booking.service.js`.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/models/TimeSlot.model.js` | Created atomically with Booking; deleted on cancellation |
| `src/models/Business.model.js` | `businessId` FK |
| `src/models/Service.model.js` | `serviceId` FK; duration used to compute `endTime` |
| `src/models/Staff.model.js` | `staffId` FK |
| `src/models/User.model.js` | `customerId` FK (nullable) |
| `src/services/booking.service.js` | All booking lifecycle operations |
| `src/services/slotConflict.service.js` | Queries Booking for overlap detection before creation |
| `src/services/analytics.service.js` | Aggregates on this collection for dashboard stats |
| `src/utils/generateRef.js` | Called by pre-save hook to generate `bookingRef` |
| `src/utils/mailer.util.js` | Receives booking data to send confirmation/cancellation emails |