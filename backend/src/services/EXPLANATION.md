# EXPLANATION — backend/src/services/

## Purpose

Services are where **all business logic lives**. If a piece of code makes a
decision, performs a calculation, enforces a rule, or orchestrates multiple
database operations — it belongs in a service, not a controller and not a route.

Controllers are thin HTTP adapters: read from `req`, call a service, write to
`res`. Services are thick business logic engines: they take plain data in,
query the database, apply rules, and return plain data out. They never touch
`req` or `res`.

This separation is the difference between code you can test in isolation and
code that requires running an entire Express server to verify.

---

## How it works

### The Service Layer Contract

Every service function follows the same pattern:

```js
// Takes plain arguments, returns plain data, throws AppError on failure
export const createService = async (businessId, data) => {
  // 1. Validate business rules (requires DB)
  const duplicate = await Service.findOne({ businessId, name: new RegExp(`^${data.name}$`, 'i') });
  if (duplicate) throw new AppError('DUPLICATE_NAME', 'A service with this name already exists.', 409);

  // 2. Execute the operation
  const service = await Service.create({ ...data, businessId });

  // 3. Return the result
  return service;
};
```

The controller calls this and handles HTTP concerns:

```js
export const createServiceController = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.businessId, req.body);
    return successResponse(res, service, 201);
  } catch (err) {
    next(err);
  }
};
```

The service has zero knowledge of Express. You could call it from a CLI script,
a cron job, or a test — it works exactly the same way.

---

### `auth.service.js` — Registration, Login, Session

#### `registerOwner(data)`

This function is the most complex in the auth service because it needs to create
two documents atomically: a `User` and a `Business`. If the user is created but
the business creation fails, the user document must be rolled back — otherwise
you end up with orphaned users who have no business.

```js
export const registerOwner = async (data) => {
  const { name, email, password, phone, businessName, category, city, description } = data;

  // Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('EMAIL_TAKEN', 'An account with this email already exists.', 409);

  // Generate a unique slug
  const slug = await generateUniqueSlug(businessName, city);

  // Mongoose session for atomic writes
  const session = await mongoose.startSession();
  let token;

  await session.withTransaction(async () => {
    // Create business first to get its _id
    const [business] = await Business.create([{ name: businessName, slug, category, city, phone, description }], { session });

    // Create user linked to this business
    const [user] = await User.create([{
      name, email, password, phone,
      role: 'business_owner',
      businessId: business._id,
    }], { session });

    // Sign JWT — done inside transaction so we have the ids
    token = jwt.sign(
      { userId: user._id, role: user.role, businessId: business._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  });

  session.endSession();

  // Fire-and-forget welcome email (outside transaction — email failures should not rollback DB)
  sendWelcomeEmail(data.email, data.name, businessName, slug).catch(console.error);

  return { token, user: { ...strippedUser } };
};
```

**Why `Business.create([...], { session })` with an array?**

When using Mongoose transactions, you must pass an array to `.create()` and the
`{ session }` option. This is Mongoose's API for transactional writes —
single-object `.create()` does not accept a session option.

**Why send the email outside the transaction?**

If the email fails, the business and user are still valid. The welcome email is
a "nice to have" — it should never cause a registration rollback. By sending it
after the transaction commits, we guarantee the DB state is consistent regardless
of email delivery.

---

### `slot.service.js` — The Availability Algorithm

This is the most algorithmically interesting service in the project. Understanding
it completely is worth the effort.

#### `getAvailableSlots(businessId, serviceId, date, staffId?)`

```js
export const getAvailableSlots = async (businessId, serviceId, date, staffId) => {
  // Step 1: Load the service to get duration
  const service = await Service.findOne({ _id: serviceId, businessId, isActive: true });
  if (!service) throw new AppError('NOT_FOUND', 'Service not found.', 404);

  // Step 2: Load the business to get working hours and bufferMinutes
  const business = await Business.findById(businessId);

  // Step 3: Determine which staff members to compute for
  const staffMembers = staffId
    ? await Staff.find({ _id: staffId, businessId, isActive: true })
    : await Staff.find({ businessId, serviceIds: serviceId, isActive: true });

  // Step 4: Compute available slots for each staff member
  const results = [];
  for (const staff of staffMembers) {
    const slots = await computeSlotsForStaff(staff, service, business, date);
    results.push(...slots);
  }

  return results;
};
```

#### `computeSlotsForStaff(staff, service, business, date)` — the core algorithm

```js
const computeSlotsForStaff = async (staff, service, business, date) => {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Step A: Determine working hours for this staff member on this day
  const workingHoursSource = staff.workingHours.length > 0 ? staff.workingHours : business.workingHours;
  const dayHours = workingHoursSource.find(wh => wh.day === dayOfWeek);

  // If the business/staff is closed on this day, return empty
  if (!dayHours) return [];

  // Step B: Generate all possible slot windows
  const { durationMinutes } = service;
  const bufferMinutes = business.bufferMinutes || 0;
  const stepMinutes = durationMinutes + bufferMinutes;

  const possibleSlots = [];
  let cursor = timeToMinutes(dayHours.start);
  const endBoundary = timeToMinutes(dayHours.end);

  while (cursor + durationMinutes <= endBoundary) {
    possibleSlots.push({
      startTime: minutesToTime(cursor),
      endTime: minutesToTime(cursor + durationMinutes),
      staffId: staff._id,
      staffName: staff.name,
    });
    cursor += stepMinutes;
  }

  // Step C: Fetch all conflicts — confirmed bookings AND blocked timeslots
  const [existingBookings, blockedSlots] = await Promise.all([
    Booking.find({
      businessId: business._id,
      staffId: staff._id,
      date,
      status: 'confirmed',
    }).select('startTime endTime'),
    TimeSlot.find({
      businessId: business._id,
      staffId: { $in: [staff._id, null] }, // null = blocked for all staff
      date,
      status: 'blocked',
    }).select('startTime endTime'),
  ]);

  const conflicts = [...existingBookings, ...blockedSlots];

  // Step D: Filter out conflicting windows using overlap detection
  const available = possibleSlots.filter(slot =>
    !conflicts.some(conflict => overlaps(slot, conflict))
  );

  // Step E: Remove past slots if the date is today (IST)
  return filterPastSlots(available, date);
};
```

#### The Overlap Detection Function

This is the heart of the conflict detection logic. Two time windows overlap if
and only if neither ends before the other starts:

```js
const overlaps = (slotA, slotB) => {
  const aStart = timeToMinutes(slotA.startTime);
  const aEnd   = timeToMinutes(slotA.endTime);
  const bStart = timeToMinutes(slotB.startTime);
  const bEnd   = timeToMinutes(slotB.endTime);

  // The overlap condition (from PRD §8):
  // existingStart < requestedEnd AND existingEnd > requestedStart
  return bStart < aEnd && bEnd > aStart;
};
```

**Why this specific condition?**

Consider all the ways two windows can be arranged. The only non-overlapping cases are:

```
Case 1: A ends before B starts   [ A ]  [ B ]
        aEnd <= bStart

Case 2: B ends before A starts   [ B ]  [ A ]
        bEnd <= aStart
```

The complement of these two cases is the overlap condition. Using De Morgan's law:
"overlaps" = NOT (aEnd <= bStart OR bEnd <= aStart) = (bStart < aEnd AND bEnd > aStart).

This works for all edge cases: slots that partially overlap, slots that are
fully contained within another slot, and slots that share only a boundary point
(boundary sharing is treated as non-overlapping by using strict `<` and `>`).

#### Helper Functions

```js
// Convert "HH:MM" string to total minutes since midnight
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert total minutes back to "HH:MM" string
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

// Remove time slots that have already passed (for today's date only)
const filterPastSlots = (slots, date) => {
  const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  if (date !== today) return slots; // future dates — all slots are valid

  const nowIST = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const nowMinutes = timeToMinutes(nowIST);

  return slots.filter(slot => timeToMinutes(slot.startTime) > nowMinutes);
};
```

---

### `booking.service.js` — The 3-Phase Atomic Booking

This service implements the slot conflict prevention algorithm described in PRD §8.
It is the most safety-critical function in the entire application.

```js
export const createBooking = async (data) => {
  const { businessId, serviceId, staffId, date, startTime, customerName, customerEmail, customerPhone } = data;

  // ── PHASE 1: Validate inputs ──────────────────────────────────────
  const [business, service, staff] = await Promise.all([
    Business.findOne({ _id: businessId, isActive: true }),
    Service.findOne({ _id: serviceId, businessId, isActive: true }),
    staffId ? Staff.findOne({ _id: staffId, businessId, isActive: true }) : null,
  ]);

  if (!business) throw new AppError('NOT_FOUND', 'Business not found.', 404);
  if (!service)  throw new AppError('NOT_FOUND', 'Service not found.', 404);
  if (staffId && !staff) throw new AppError('NOT_FOUND', 'Staff member not found.', 404);

  const endTime = minutesToTime(timeToMinutes(startTime) + service.durationMinutes);

  // ── PHASE 2: Re-check for conflicts (race condition window) ───────
  const conflictingBooking = await Booking.findOne({
    businessId,
    staffId: staffId || { $exists: true },
    date,
    status: 'confirmed',
    $expr: {
      $and: [
        { $lt: [{ $dateFromString: { dateString: { $concat: [date, 'T', '$startTime'] } } },
                { $dateFromString: { dateString: { $concat: [date, 'T', endTime] } } }] },
        { $gt: [{ $dateFromString: { dateString: { $concat: [date, 'T', '$endTime'] } } },
                { $dateFromString: { dateString: { $concat: [date, 'T', startTime] } } }] },
      ]
    }
  });

  // Simpler string-based overlap check (equivalent, more readable):
  const conflict = await Booking.findOne({
    businessId,
    staffId: staffId || { $exists: true },
    date,
    status: 'confirmed',
    startTime: { $lt: endTime },
    endTime:   { $gt: startTime },
  });

  if (conflict) throw new AppError('SLOT_UNAVAILABLE', 'This slot was just taken. Please choose another time.', 409);

  // ── PHASE 3: Atomic write (Booking + TimeSlot in one transaction) ─
  const bookingRef = await generateBookingRef();
  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      [booking] = await Booking.create([{
        bookingRef, businessId, serviceId,
        staffId: staffId || null,
        customerId: data.customerId || null,
        customerName, customerEmail, customerPhone,
        date, startTime, endTime,
        status: 'confirmed',
      }], { session });

      // This insert will fail with E11000 if a concurrent request got here first
      // The unique index on { businessId, staffId, date, startTime } is the final guard
      await TimeSlot.create([{
        businessId,
        staffId: staffId || null,
        date,
        startTime,
        endTime,
        status: 'booked',
        bookingId: booking._id,
      }], { session });
    });
  } catch (err) {
    if (err.code === 11000) {
      // E11000 = MongoDB duplicate key error = another request won the race
      throw new AppError('SLOT_UNAVAILABLE', 'This slot was just taken. Please choose another time.', 409);
    }
    throw err;
  } finally {
    session.endSession();
  }

  // Fire-and-forget emails — outside the transaction, failures don't rollback booking
  sendBookingConfirmationEmails(booking, business, service, staff).catch(console.error);

  return booking;
};
```

**Why is Phase 2 necessary if Phase 3 has the unique index guard?**

The unique index (Phase 3) catches the exact-same-startTime race condition. But
consider a different scenario: Customer A is booking 10:00–10:45. Customer B is
booking 10:30–11:15. These have different `startTime` values, so the unique index
would NOT prevent both from being written. The overlap query in Phase 2 catches
this case by checking the actual time windows, not just the start time.

Together, Phase 2 (overlap check) and Phase 3 (unique index) cover all possible
conflict scenarios.

---

### `analytics.service.js` — MongoDB Aggregation Pipelines

The analytics service uses MongoDB's aggregation framework — a pipeline of stages
that transforms and summarises data, similar to SQL's GROUP BY and aggregate functions.

```js
export const getSummary = async (businessId, from, to) => {
  const pipeline = [
    // Stage 1: Filter to this business and date range
    { $match: {
      businessId: new ObjectId(businessId),
      date: { $gte: from, $lte: to },
    }},

    // Stage 2: Group all matching documents into one summary
    { $group: {
      _id: null,
      totalBookings:     { $sum: 1 },
      confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
      cancelledBookings: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      totalRevenueINR:   { $sum: {
        $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, '$priceINR', 0]
      }},
    }},

    // Stage 3: Shape the output
    { $project: {
      _id: 0,
      totalBookings: 1,
      confirmedBookings: 1,
      cancelledBookings: 1,
      cancellationRate: {
        $cond: [
          { $gt: ['$totalBookings', 0] },
          { $multiply: [{ $divide: ['$cancelledBookings', '$totalBookings'] }, 100] },
          0
        ]
      },
      totalRevenueINR: 1,
    }},
  ];

  const [result] = await Booking.aggregate(pipeline);
  return result || { totalBookings: 0, confirmedBookings: 0, /* ... */ };
};
```

**Why aggregation instead of loading all documents and computing in JavaScript?**

If a business has 50,000 bookings, loading them all into memory to count them
in JavaScript would be extremely slow and use enormous RAM. MongoDB's aggregation
pipeline runs entirely inside the database — only the final result leaves the server.
For data summarisation tasks, always push computation to the database.

---

## Key Decisions

**Why no custom hooks layer between services and components?**

As noted in STRUCTURE.md, the frontend calls service functions directly from
components. This keeps the dependency graph flat and easy to trace. The service
layer in `frontend/src/services/` is itself already a thin abstraction over axios.
Adding a hooks layer between components and services would add indirection
without adding value for a project of this scale.

**Why `Promise.all()` for parallel DB queries?**

```js
const [business, service, staff] = await Promise.all([
  Business.findById(businessId),
  Service.findById(serviceId),
  Staff.findById(staffId),
]);
```

This runs three queries simultaneously. Without `Promise.all`, each `await`
would run sequentially: query 1 finishes, then query 2 starts, then query 3.
With `Promise.all`, all three run in parallel. Total time = longest single query
instead of sum of all three.

**Why is email sending fire-and-forget?**

Email delivery is not guaranteed. SMTP servers fail, addresses bounce, spam
filters block. If booking creation waited for email confirmation before returning
a response, users would sometimes see 10+ second waits or outright failures for
a booking that actually succeeded. The booking is the important operation — email
is a side effect. Log failures, don't propagate them.

---

## Functions / Exports

| Service | Key Functions |
|---|---|
| `auth.service.js` | `registerOwner()`, `registerCustomer()`, `login()`, `getMe()` |
| `business.service.js` | `getBySlug()`, `updateBusiness()`, `listAll()`, `suspendBusiness()` |
| `service.service.js` | `listActiveServices()`, `createService()`, `updateService()`, `softDeleteService()` |
| `staff.service.js` | `listActiveStaff()`, `createStaff()`, `updateStaff()`, `softDeleteStaff()` |
| `slot.service.js` | `getAvailableSlots()`, `blockSlot()`, `unblockSlot()`, `listBlockedSlots()` |
| `booking.service.js` | `createBooking()`, `listBusinessBookings()`, `listMyBookings()`, `cancelBooking()` |
| `analytics.service.js` | `getSummary()`, `getPeakHours()`, `getPlatformStats()` |

---

## What you should learn from this

1. **A service layer makes your code testable.** A function that takes `(businessId, data)`
   and returns a booking is trivially unit-testable. A controller that reads from
   `req.body` and calls `res.json()` requires Express to test.

2. **Understand the overlap condition by heart.** `bStart < aEnd && bEnd > aStart` is
   the canonical time-range overlap test. You'll use this pattern everywhere —
   calendar apps, scheduling systems, reservation systems.

3. **MongoDB transactions exist and you should use them** when you need multiple
   writes to succeed or fail together. They're not just a SQL concept.

4. **E11000 is your friend.** A duplicate key error from MongoDB means your unique
   index caught a race condition that application-level checks missed. Catch it,
   handle it gracefully, and thank the index for doing its job.

5. **Aggregation pipelines > loading data into JavaScript** for any computation
   involving many documents. Learn the `$match`, `$group`, `$project`, `$sort`,
   and `$lookup` stages — they're the foundation of MongoDB analytics work.