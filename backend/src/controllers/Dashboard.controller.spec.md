# SPEC — backend/src/controllers/dashboard.controller.js

## File Role
Handles HTTP request/response for all analytics and dashboard endpoints: the combined owner dashboard summary, standalone analytics routes (summary, peak hours), and the Super Admin platform-wide stats view. Delegates all aggregation to `analytics.service.js`.

---

## Dependencies

```js
import * as analyticsService from '../services/analytics.service.js'; // internal
import { successResponse } from '../utils/response.js';               // internal
import { validationResult } from 'express-validator';                  // npm
```

---

## Exports

### `getDashboard` — Controller Handler

**Route:** `GET /api/businesses/:businessId/dashboard`
**Auth:** `authenticate`, `requireRole('business_owner', 'super_admin')`, `tenantGuard`

**Purpose:** Returns the combined dashboard payload in a single request — stats summary + peak hours + today's schedule. Minimises frontend round-trips on dashboard load.

**Algorithm:**
1. Extract `from` and `to` from `req.query`; default to first of current month and today if absent
2. Parse dates; if invalid format return 400
3. Call `analyticsService.getDashboardSummary(req.businessId, { from, to })` — returns all three data groups via parallel Promise execution (`Promise.all`)
4. Return `successResponse(res, { period, stats, peakHours, todaySchedule }, 200)`

**Query params:**
```ts
{
  from?: string;  // YYYY-MM-DD; defaults to first of current calendar month
  to?: string;    // YYYY-MM-DD; defaults to today (IST)
}
```

**Response — 200:**
```ts
{
  success: true;
  data: {
    period: { from: string; to: string };
    stats: {
      totalBookings: number;
      confirmedBookings: number;
      cancelledBookings: number;
      cancellationRate: number;   // percentage, 2 decimal places
      totalRevenueINR: number;
      bookingsToday: number;
      revenueToday: number;
    };
    peakHours: Array<{ hour: number; bookingCount: number }>; // sorted by hour asc
    todaySchedule: Array<{
      bookingRef: string;
      customerName: string;
      serviceName: string;
      staffName: string | null;
      startTime: string;
      endTime: string;
      status: 'confirmed';
    }>;
  }
}
```

**Response — 400:** Invalid date format
**Response — 401/403:** Auth failures
**Response — 404:** Business not found (handled upstream by tenantGuard)

---

### `getAnalyticsSummary` — Controller Handler

**Route:** `GET /api/analytics/summary`
**Auth:** `authenticate`, `requireRole('business_owner')`, `requireBusinessScope`

**Purpose:** Standalone summary endpoint for use when only stats are needed (not the full dashboard payload).

**Algorithm:**
1. Extract and validate `from`, `to` from `req.query` — same defaults as `getDashboard`
2. Call `analyticsService.getSummary(req.businessId, { from, to })`
3. Return `successResponse(res, summaryData, 200)`

**Response — 200:**
```ts
{
  success: true;
  data: {
    period: { from: string; to: string };
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    cancellationRate: number;
    totalRevenueINR: number;
    bookingsToday: number;
    revenueToday: number;
  }
}
```

---

### `getPeakHours` — Controller Handler

**Route:** `GET /api/analytics/peak-hours`
**Auth:** `authenticate`, `requireRole('business_owner')`, `requireBusinessScope`

**Purpose:** Returns hourly booking frequency for the recharts bar chart.

**Algorithm:**
1. Extract and validate `from`, `to` with same defaults
2. Call `analyticsService.getPeakHours(req.businessId, { from, to })`
3. Return `successResponse(res, { period, peakHours }, 200)`

**Response — 200:**
```ts
{
  success: true;
  data: {
    period: { from: string; to: string };
    peakHours: Array<{ hour: number; bookingCount: number }>; // 0–23, sorted by hour
  }
}
```

---

### `getPlatformAnalytics` — Controller Handler

**Route:** `GET /api/analytics/all`
**Auth:** `authenticate`, `requireRole('super_admin')`

**Purpose:** Cross-tenant platform stats for the Super Admin console header.

**Algorithm:**
1. Call `analyticsService.getPlatformStats()`
2. Return `successResponse(res, platformData, 200)`

**Response — 200:**
```ts
{
  success: true;
  data: {
    totalBusinesses: number;
    activeBusinesses: number;
    totalBookings: number;
    bookingsToday: number;
    globalCancellationRate: number;  // percentage
    topBusinesses: Array<{
      businessId: string;
      name: string;
      bookingCount: number;
    }>;  // top 5, sorted by bookingCount desc
  }
}
```

---

## Data Contracts

### Date Parameter Defaults

| Scenario | `from` default | `to` default |
|----------|---------------|-------------|
| No params | First day of current month | Today (IST midnight) |
| Only `from` provided | Provided value | Today (IST midnight) |
| Only `to` provided | First day of current month | Provided value |

All dates are interpreted in **IST (UTC+5:30)** for `bookingsToday` and `revenueToday` calculations.

### `cancellationRate` calculation
```
cancellationRate = (cancelledBookings / totalBookings) * 100
```
Return `0` if `totalBookings === 0` to avoid division by zero. Round to 2 decimal places.

---

## Rules & Constraints

1. `getDashboard` must use `Promise.all` internally (via `analyticsService.getDashboardSummary`) to run the three aggregation pipelines in parallel — never run them sequentially.
2. All date comparisons in analytics must use the `date` string field (YYYY-MM-DD) on Booking documents, not a `Date` object range — to avoid IST/UTC shift issues.
3. `bookingsToday` and `revenueToday` must use today's date in IST, not UTC. The service must compute the IST date string.
4. `peakHours` must return entries for ALL hours 0–23, even if `bookingCount: 0` — the frontend chart needs a complete 24-point dataset. Hours with no bookings must not be omitted.
5. `todaySchedule` must only include `status: 'confirmed'` bookings sorted by `startTime` ascending.
6. `getPlatformAnalytics` must not accept `businessId` as a filter — it is always platform-wide.
7. Performance target: `getDashboard` response must be ≤ 1500ms p95. Achieved via parallel execution and compound indexes on Booking.

---

## Do NOT

- Do NOT run aggregation pipelines in the controller — all MongoDB queries live in `analytics.service.js`.
- Do NOT use JavaScript `Date` objects for `bookingsToday` comparisons — use the IST date string.
- Do NOT omit hours with zero bookings from `peakHours` — always return 24 entries.
- Do NOT expose `ownerId` on any analytics response.
- Do NOT catch errors with try/catch — use `next(err)`.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/services/analytics.service.js` | All aggregation logic — called by every handler |
| `src/routes/analytics.routes.js` | Mounts handlers with auth middleware |
| `src/routes/business.routes.js` | Mounts `getDashboard` under `/businesses/:businessId/dashboard` |
| `src/middleware/auth.middleware.js` | `authenticate`, `requireRole`, `requireBusinessScope` |
| `src/middleware/tenant/tenantGuard.middleware.js` | Applied on `getDashboard` route |
| `src/models/Booking.model.js` | Aggregated collection — indirectly via analytics.service.js |
| `src/utils/response.js` | `successResponse` used in every handler |