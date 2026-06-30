# SPEC — backend/src/controllers/booking.controller.js

## File Role
Handles all HTTP request/response concerns for booking lifecycle endpoints: creating bookings (with conflict guard), listing bookings (owner and customer views), fetching a single booking, cancelling, updating status, and the Super Admin cross-tenant view. Delegates all logic to `booking.service.js`.

---

## Dependencies

```js
import * as bookingService from '../services/booking.service.js'; // internal
import { successResponse, errorResponse } from '../utils/response.js'; // internal
import { validationResult } from 'express-validator'; // npm
```

---

## Exports

### `createBooking` — Controller Handler

**Route:** `POST /api/bookings`
**Auth:** Public (no JWT required; guest bookings supported)

**Algorithm:**
1. Collect validation errors — return 400 if any
2. Call `bookingService.createBooking(req.body)`
3. Return `successResponse(res, booking, 201)`

**Request body shape:**
```ts
{
  businessId: string;        // ObjectId
  serviceId: string;         // ObjectId
  staffId?: string | null;   // ObjectId or null ("any available")
  date: string;              // YYYY-MM-DD
  startTime: string;         // HH:MM
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}
```

**Response — 201:** Full `Booking` document (see Booking model SPEC)
**Response — 400:** Validation errors
**Response — 404:** Business, service, or staff not found
**Response — 409:** `SLOT_UNAVAILABLE` — slot taken by concurrent booking

---

### `getMyBookings` — Controller Handler

**Route:** `GET /api/bookings/my`
**Auth:** `authenticate`, `requireRole('customer')`

**Algorithm:**
1. Call `bookingService.getMyBookings(req.user.userId, req.user.email)`
2. Return `successResponse(res, bookings, 200)`

**Response — 200:** Array of `BookingCustomerView` (includes `businessName`, `serviceName`, `staffName`)
**Response — 401/403:** Auth failures (handled by middleware)

---

### `getAllBookings` — Controller Handler

**Route:** `GET /api/bookings/all`
**Auth:** `authenticate`, `requireRole('super_admin')`

**Algorithm:**
1. Extract filters from query: `businessId`, `date`, `status`, `page`, `limit`
2. Call `bookingService.getAllBookings({ businessId, date, status, page, limit })`
3. Return `successResponse(res, { bookings, pagination }, 200)`

**Query params:**
```ts
{
  businessId?: string;
  date?: string;           // YYYY-MM-DD
  status?: 'confirmed' | 'cancelled' | 'completed';
  page?: number;           // default 1
  limit?: number;          // default 20, max 100
}
```

**Response — 200:** `{ bookings: BookingAdminView[], pagination: Pagination }`

---

### `getBookingById` — Controller Handler

**Route:** `GET /api/bookings/:id`
**Auth:** `authenticate` + role-aware ownership check

**Algorithm:**
1. Call `bookingService.getBookingById(req.params.id, req.user)`
2. Service handles authorization: owner sees own-business bookings, customer sees own bookings, admin sees all
3. Return `successResponse(res, booking, 200)`

**Response — 200:** `BookingPopulated` (with `serviceName`, `staffName`)
**Response — 403:** Caller does not own this booking
**Response — 404:** Booking not found

---

### `cancelBooking` — Controller Handler

**Route:** `PATCH /api/bookings/:id/cancel`
**Auth:** `authenticate`, `requireRole('business_owner', 'customer', 'super_admin')`

**Algorithm:**
1. Collect validation errors — return 400 if any
2. Call `bookingService.cancelBooking(req.params.id, req.body, req.user)`
3. Return `successResponse(res, updatedBooking, 200)`

**Request body shape:**
```ts
{
  cancelledBy: 'customer' | 'business';
  cancellationReason: string;  // required, maxLength 300
}
```

**Response — 200:** Updated `Booking` document with `status: 'cancelled'`
**Response — 400:** Cancellation window has passed or booking already cancelled
**Response — 403:** Customer attempting to cancel someone else's booking
**Response — 404:** Booking not found

---

### `updateBookingStatus` — Controller Handler

**Route:** `PUT /api/bookings/:id/status`
**Auth:** `authenticate`, `requireRole('business_owner', 'super_admin')`

**Algorithm:**
1. Collect validation errors — return 400 if any
2. Call `bookingService.updateBookingStatus(req.params.id, req.body, req.user)`
3. Return `successResponse(res, updatedBooking, 200)`

**Request body shape:**
```ts
{
  status: 'cancelled' | 'completed';
  cancelledBy?: 'business';
  cancellationReason?: string;
}
```

**Response — 200:** Updated `Booking` document
**Response — 400:** Invalid status transition or missing cancellation reason
**Response — 403/404:** Auth or not found

---

### `listBusinessBookings` — Controller Handler

**Route:** `GET /api/businesses/:businessId/bookings`
**Auth:** `authenticate`, `requireRole('business_owner', 'super_admin')`, `tenantGuard`

**Algorithm:**
1. Extract filters from query: `date`, `status`, `staffId`, `page`, `limit`
2. Call `bookingService.listBusinessBookings(req.businessId, { date, status, staffId, page, limit })`
3. Return `successResponse(res, { bookings, pagination }, 200)`

**Query params:**
```ts
{
  date?: string;
  status?: 'confirmed' | 'cancelled' | 'completed';
  staffId?: string;
  page?: number;    // default 1
  limit?: number;   // default 20, max 100
}
```

**Response — 200:** `{ bookings: BookingPopulated[], pagination: Pagination }`

---

## Data Contracts

### Pagination object (on all paginated responses)
```ts
{
  total: number;   // total matching documents
  page: number;    // current page (1-indexed)
  limit: number;   // per-page count
  pages: number;   // Math.ceil(total / limit)
}
```

### Error Response Patterns

| Situation | Status | Code |
|-----------|--------|------|
| Slot taken on submit | 409 | `SLOT_UNAVAILABLE` |
| Business/service/staff not found | 404 | `NOT_FOUND` |
| Too late to cancel | 400 | `VALIDATION_ERROR` |
| Wrong owner of booking | 403 | `FORBIDDEN` |
| Invalid status transition | 400 | `VALIDATION_ERROR` |

---

## Rules & Constraints

1. `createBooking` is the only endpoint that can trigger the conflict check — it calls `booking.service.js` which calls `slotConflict.service.js`.
2. `cancelBooking` and `updateBookingStatus` are two distinct endpoints because they serve different UX contexts (customer self-service vs. owner dashboard) and have different authorization models.
3. `getBookingById` must enforce ownership in the service, not the controller — the controller passes `req.user` and the service decides.
4. `listBusinessBookings` uses `req.businessId` (from `requireBusinessScope`) as the filter — it must never use `req.params.businessId` directly to prevent tenant bypass attacks.
5. `getAllBookings` is Super Admin only — it must apply `requireRole('super_admin')` in the route.
6. All paginated responses must include the `pagination` object even when results are empty (`total: 0, pages: 0`).

---

## Do NOT

- Do NOT write query logic (Mongoose `.find()` calls) in this controller.
- Do NOT send emails from this controller — `booking.service.js` handles email triggers.
- Do NOT perform the slot conflict check here — it belongs in `slotConflict.service.js`.
- Do NOT use `req.params.businessId` as the tenant filter on owner routes — use `req.businessId` from middleware.
- Do NOT catch errors with try/catch — use `next(err)`.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/services/booking.service.js` | All booking logic — called by every handler |
| `src/services/slotConflict.service.js` | Called by booking.service.js for conflict check |
| `src/routes/booking.routes.js` | Mounts these handlers with correct middleware chain |
| `src/middleware/auth.middleware.js` | `authenticate`, `requireRole`, `requireBusinessScope` |
| `src/middleware/tenant/tenantGuard.middleware.js` | Validates businessId path param on owner routes |
| `src/utils/response.js` | Standard envelope helpers |
| `src/utils/mailer.util.js` | Called indirectly via booking.service.js |