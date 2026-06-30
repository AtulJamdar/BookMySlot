# SPEC — backend/src/services/slotConflict.service.js

## File Role
Implements the two-phase slot conflict detection algorithm that prevents double bookings. It is the single authoritative source of overlap logic in the system — used both for pre-booking validation and as the last-mile guard before atomic writes.

---

## Dependencies

```js
import { Booking } from '../models/Booking.model.js';     // internal — conflict query
import { TimeSlot } from '../models/TimeSlot.model.js';   // internal — blocked slot query
import { AppError } from '../utils/AppError.js';           // internal — typed error class
```

---

## Exports

### `checkSlotAvailability(params)` — Async Function

**Purpose:** Performs the Phase 1 overlap query before the atomic write. Checks both confirmed Bookings and blocked TimeSlots for any overlap with the requested window. Returns `true` if the slot is free; throws `AppError` if taken.

**Parameters:**
```ts
params: {
  businessId: string;   // ObjectId string — tenant scope
  staffId: string | null; // ObjectId string or null (any-staff booking)
  date: string;         // YYYY-MM-DD
  startTime: string;    // HH:MM — requested window start
  endTime: string;      // HH:MM — computed as startTime + service.durationMinutes
}
```

**Return:** `Promise<true>` — resolves to `true` when the slot is available

**Side effects:** Makes up to 2 MongoDB read queries (Booking + TimeSlot collections)

**Throws:**
- `AppError('SLOT_UNAVAILABLE', 'This slot was just booked by someone else.', 409)` — if an overlap exists

---

### `hasOverlap(existingStart, existingEnd, requestedStart, requestedEnd)` — Pure Function

**Purpose:** Evaluates the time-range overlap condition for two `HH:MM` string windows. Exported separately for unit testing without DB involvement.

**Parameters:**
```ts
existingStart: string;    // HH:MM
existingEnd: string;      // HH:MM
requestedStart: string;   // HH:MM
requestedEnd: string;     // HH:MM
```

**Return:** `boolean` — `true` if the windows overlap

**Algorithm:**
```
overlap = existingStart < requestedEnd AND existingEnd > requestedStart
```

This is the standard interval overlap condition. It correctly handles:
- Complete overlap (requested window entirely inside existing)
- Partial overlap at start
- Partial overlap at end
- Exact boundary match (e.g., existing ends at 10:30, requested starts at 10:30 — NOT an overlap)

Note: String comparison of `HH:MM` works correctly for 24h time because lexicographic order matches chronological order when zero-padded (e.g., `"09:00" < "10:00"` is `true`).

**Side effects:** None — pure function
**Throws:** Never

---

## Data Contracts

### Booking overlap query (Phase 1 — Part A)

```js
// Find any confirmed booking that overlaps the requested window
Booking.findOne({
  businessId,
  staffId: staffId || { $in: [null, ...allStaffIds] }, // handle "any staff" case
  date,
  status: 'confirmed',
  $or: [
    // Existing booking starts before our requested end AND ends after our start
    {
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }
  ]
})
```

### TimeSlot overlap query (Phase 1 — Part B)

```js
// Find any blocked or booked TimeSlot that overlaps the window
TimeSlot.findOne({
  businessId,
  $or: [{ staffId }, { staffId: null }], // null staffId = blocks all staff
  date,
  startTime: { $lt: endTime },
  endTime: { $gt: startTime },
})
```

### "Any staff" booking logic

When `staffId` is `null` (customer selected "any available"), the conflict check must verify against:
- Any booking for **any** staff member at that business on that date with an overlapping window
- Any blocked slot for that business+date with an overlapping window

This means when `staffId === null`, the Booking query must NOT include a `staffId` filter.

---

## Rules & Constraints

1. **Overlap condition must use `$lt` / `$gt` (strict), not `$lte` / `$gte`.** The boundary case where an existing booking ends exactly when the new one starts (`existingEnd === requestedStart`) must NOT be treated as a conflict — back-to-back appointments are allowed (buffer is handled separately by `slot.service.js`).

2. **Both Booking and TimeSlot collections must be queried** — blocking an entire day via TimeSlot documents is a separate mechanism from confirmed bookings, and both must be checked.

3. **This function must never be called from the model layer.** It is only called from `booking.service.js` and `slot.service.js`.

4. **The conflict check alone is not sufficient.** Even if `checkSlotAvailability` passes, the atomic write step (unique index + transaction) is still required to guard against the race condition where two requests pass the check simultaneously. This service implements Phase 1 only; Phase 2 (atomic write) is in `booking.service.js`.

5. **Queries must use the compound index** `{ businessId, date, staffId, status }` on the Booking collection. Do not query without `businessId` and `date` — these fields activate the index.

6. **`endTime` must be provided by the caller** — this service does not compute it. The caller (`booking.service.js`) must compute `endTime = startTime + service.durationMinutes` before calling `checkSlotAvailability`.

7. When `staffId === null` (any-staff booking), the conflict check must be broadened to include all staff — do not add a `staffId` filter to the Booking query.

8. String comparison of `HH:MM` times is valid for overlap detection because 24h zero-padded time strings are lexicographically ordered the same as chronologically ordered.

---

## Do NOT

- Do NOT use in-memory filtering (`Array.filter()` on all bookings for the day) — always use the MongoDB `$lt`/`$gt` query on indexed fields.
- Do NOT use `$lte`/`$gte` for the overlap condition — back-to-back appointments are valid.
- Do NOT call `checkSlotAvailability` from any model pre-save hook.
- Do NOT assume a passing `checkSlotAvailability` means the slot is permanently reserved — the atomic write + unique index in `booking.service.js` is still required.
- Do NOT query without `businessId` — every query must be tenant-scoped.
- Do NOT compute `endTime` in this service — receive it as a parameter.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/models/Booking.model.js` | Primary query target for Phase 1 conflict check |
| `src/models/TimeSlot.model.js` | Secondary query target for blocked slot check |
| `src/services/booking.service.js` | Calls `checkSlotAvailability` before atomic write |
| `src/services/slot.service.js` | Calls `checkSlotAvailability` when computing available windows |
| `src/middleware/errorHandler.middleware.js` | Catches E11000 (Phase 2 guard) and converts to 409 |
| `src/utils/AppError.js` | Typed error class used to throw `SLOT_UNAVAILABLE` |