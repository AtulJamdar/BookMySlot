# EXPLANATION — backend/src/models/

## Purpose

Models are the **contract between your application and your database**. They define
the shape of every document stored in MongoDB: what fields exist, what types they
must be, what values are valid, and how the data relates to other collections.

In BookMySlot, there are seven models: `User`, `Business`, `Service`, `Staff`,
`TimeSlot`, `Booking`, and `AuditLog`. Together they represent the entire data
domain of the application.

---

## How it works

### Mongoose Schemas vs MongoDB Documents

MongoDB is a document database — it stores data as JSON-like objects called
"documents" in "collections". By default, MongoDB is schemaless: you can store
any shape of document in any collection. That's powerful but dangerous for a
real application.

Mongoose adds a schema layer on top. When you define a Mongoose schema, you're
telling the application: "Every document in the `services` collection MUST have
these fields, with these types, and these constraints." Mongoose enforces this
before any write reaches the database.

```js
// Without Mongoose — MongoDB would happily accept this
{ businessId: 'not-an-id', priceINR: 'free', durationMinutes: 'a lot' }

// With Mongoose — this would throw a ValidationError before the DB write
```

---

### The Multi-Tenant Pattern: `businessId` on Every Resource

The single most important architectural detail in the models is that every
tenant-scoped document carries a `businessId` field:

```js
// Service.js
businessId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Business',
  required: true,
  index: true,
}
```

This field appears on `Service`, `Staff`, `TimeSlot`, and `Booking`. It is the
**tenant key** — the anchor that ties every resource to one business.

Every query for tenant data includes this field automatically:

```js
// Without businessId — returns services from ALL businesses (security hole)
Service.find({ isActive: true })

// With businessId — returns only this tenant's services (correct)
Service.find({ businessId: req.businessId, isActive: true })
```

The middleware layer injects `req.businessId` from the JWT, so this filter
is applied consistently without the developer having to remember it each time.

---

### `ref` and Populate — MongoDB's Version of a Join

MongoDB doesn't have SQL-style JOINs. Instead, Mongoose uses `ref` to define
relationships and `populate()` to resolve them:

```js
// In Booking.js
serviceId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Service',   // ← the string must match the model name exactly
  required: true,
}
```

```js
// In the booking service — populate resolves the reference
const booking = await Booking.findById(id)
  .populate('serviceId', 'name durationMinutes priceINR')
  .populate('staffId', 'name title');
```

`populate('serviceId', 'name durationMinutes priceINR')` does two things:
1. Reads the `serviceId` ObjectId from the booking
2. Makes a second DB query to `Service` and fetches only the fields listed

The second argument is a "projection" — only return `name`, `durationMinutes`,
and `priceINR`, not the entire service document. This reduces the size of
the response and avoids leaking fields like `isActive` to the client.

**When to populate vs. when to denormalise:**

Populate adds a second DB query. For high-frequency reads (like the booking
list in the owner dashboard), this can be slow. The `Booking` model stores
`customerName`, `customerEmail`, `customerPhone` as plain strings (denormalised)
so a booking list query never needs to join with the `User` collection.

For display-only fields that rarely change (service name, staff name), the
`BookingPopulated` API response shape uses virtual populate. For fields that
change frequently or need real-time accuracy, always query the source model.

---

### Each Model in Detail

#### `User.js`

```js
const userSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['customer', 'business_owner', 'super_admin'], required: true },
  businessId:   { type: ObjectId, ref: 'Business', default: null },
  phone:        { type: String },
}, { timestamps: true });
```

The `passwordHash` field stores the **bcrypt hash** of the user's password, never
the plaintext. The pre-save hook hashes the password automatically before any
User document is saved:

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.passwordHash = await bcrypt.hash(this.password, 10);
  next();
});
```

`this.isModified('password')` prevents rehashing on every save — if only `name`
changes, the password hash is left alone.

`email` is `lowercase: true` so `priya@Gmail.com` and `priya@gmail.com` are
treated as the same address. Combined with `unique: true`, this prevents
duplicate accounts.

`businessId` is `null` for customers and super_admin — they're not scoped to
a tenant. It's only set for `business_owner` users.

---

#### `Business.js`

```js
const businessSchema = new Schema({
  ownerId:       { type: ObjectId, ref: 'User', required: true },
  name:          { type: String, required: true },
  slug:          { type: String, required: true, unique: true, lowercase: true },
  category:      { type: String, enum: ['salon', 'clinic', 'coaching', 'other'], required: true },
  city:          { type: String, required: true },
  phone:         { type: String, required: true },
  description:   { type: String },
  workingHours:  [{ day: String, start: String, end: String }],
  bufferMinutes: { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

businessSchema.index({ slug: 1 }, { unique: true });
```

The `slug` field is the public URL identifier. "Sunshine Salon" becomes
`sunshine-salon`. The unique index on slug ensures no two businesses share the
same public URL.

The pre-save slug generator in `utils/slugify.js` converts the business name
to a URL-safe string. If the slug is already taken, it appends the city name:
`sunshine-salon-pune`.

`workingHours` is an embedded array of day/time objects. Embedding is preferred
over a separate collection because working hours are always queried alongside
the business — they're never fetched independently.

`isActive: false` is the suspension flag. When the Super Admin suspends a
business, this field is set to false. The `tenantResolver` middleware
only resolves businesses where `isActive: true`.

---

#### `Service.js`

```js
const serviceSchema = new Schema({
  businessId:      { type: ObjectId, ref: 'Business', required: true },
  name:            { type: String, required: true, trim: true },
  description:     { type: String },
  durationMinutes: {
    type: Number,
    required: true,
    validate: {
      validator: (v) => v > 0 && v % 15 === 0,
      message: 'durationMinutes must be a positive multiple of 15.',
    },
  },
  priceINR:        { type: Number, required: true, min: 0 },
  isActive:        { type: Boolean, default: true },
}, { timestamps: true });

serviceSchema.index({ businessId: 1, isActive: 1 });
```

The custom validator on `durationMinutes` enforces the 15-minute granularity
rule at the database level, not just in the service layer. Belt-and-suspenders.

The compound index `{ businessId: 1, isActive: 1 }` is specifically shaped for
the most common query: "give me all active services for this business." MongoDB
uses the index to find documents without scanning the entire collection.

**Soft delete pattern:** Services are never hard-deleted. Setting `isActive: false`
hides the service from new bookings while preserving the historical record for
existing bookings that reference this `serviceId`.

---

#### `Staff.js`

```js
const staffSchema = new Schema({
  businessId:   { type: ObjectId, ref: 'Business', required: true },
  name:         { type: String, required: true },
  title:        { type: String },
  serviceIds:   [{ type: ObjectId, ref: 'Service' }],
  workingHours: [{ day: String, start: String, end: String }],
  isActive:     { type: Boolean, default: true },
});

staffSchema.index({ businessId: 1, isActive: 1 });
```

`serviceIds` is an array of ObjectId references — the many-to-many relationship
between staff and services. When a customer selects a service, the system
filters staff to those whose `serviceIds` array contains the selected service:

```js
Staff.find({ businessId, serviceIds: serviceId, isActive: true })
```

If `workingHours` is an empty array, the slot generation algorithm falls back to
the parent `Business.workingHours`. This inheritance is handled in the service
layer, not the model — the model just stores what it's given.

---

#### `TimeSlot.js` — The Race-Condition Guard

```js
const timeSlotSchema = new Schema({
  businessId: { type: ObjectId, ref: 'Business', required: true },
  staffId:    { type: ObjectId, ref: 'Staff', default: null },
  date:       { type: String, required: true },   // 'YYYY-MM-DD'
  startTime:  { type: String, required: true },   // 'HH:MM'
  endTime:    { type: String, required: true },
  status:     { type: String, enum: ['blocked', 'booked'], required: true },
  bookingId:  { type: ObjectId, ref: 'Booking', default: null },
  reason:     { type: String },
});

// THE MOST IMPORTANT INDEX IN THE ENTIRE PROJECT
timeSlotSchema.index(
  { businessId: 1, staffId: 1, date: 1, startTime: 1 },
  { unique: true }
);
```

This unique compound index is the final safeguard against double bookings. Here
is exactly why it works:

Imagine two customers simultaneously select the 10:00 slot for the same staff
member on the same day. Both requests:
1. Query for conflicts — find none (both run before either writes)
2. Begin a MongoDB transaction
3. Try to insert a `TimeSlot` document with `{ businessId, staffId, date: '2026-07-15', startTime: '10:00' }`

MongoDB processes one write first. The second write tries to insert a document
with the same four-field combination and hits a **E11000 duplicate key error**
because of the unique index. The application catches this specific error and
returns a `409 SLOT_UNAVAILABLE` response to the second customer.

Without this index, both writes would succeed and two bookings would exist for
the same slot. The index is not optional — it is load-bearing architecture.

**Why are `date` and `startTime` stored as strings, not Date objects?**

Two reasons:
1. **Simplicity.** Comparing `startTime: '10:00'` is simpler than comparing
   Date objects with timezone offsets. Slot boundaries are always aligned to
   15-minute increments; millisecond precision is irrelevant.
2. **Index effectiveness.** The unique index requires an exact match on
   `startTime`. String comparison is exact. Date comparison can be ambiguous
   with timezone conversions.

---

#### `Booking.js`

```js
const bookingSchema = new Schema({
  bookingRef:          { type: String, required: true, unique: true },
  businessId:          { type: ObjectId, ref: 'Business', required: true },
  serviceId:           { type: ObjectId, ref: 'Service', required: true },
  staffId:             { type: ObjectId, ref: 'Staff', default: null },
  customerId:          { type: ObjectId, ref: 'User', default: null },
  customerName:        { type: String, required: true },
  customerEmail:       { type: String, required: true },
  customerPhone:       { type: String, required: true },
  date:                { type: String, required: true },
  startTime:           { type: String, required: true },
  endTime:             { type: String, required: true },
  status:              { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  cancelledBy:         { type: String, enum: ['customer', 'business', null], default: null },
  cancellationReason:  { type: String },
  emailSentAt:         { type: Date, default: null },
}, { timestamps: true });

// Index 1: slot availability queries
bookingSchema.index({ businessId: 1, date: 1, staffId: 1, status: 1 });
// Index 2: owner dashboard queries
bookingSchema.index({ businessId: 1, status: 1, createdAt: -1 });
// Index 3: customer booking history (supports guest bookings by email)
bookingSchema.index({ customerEmail: 1 });
```

**Denormalised fields:** `customerName`, `customerEmail`, `customerPhone` are
stored directly on the booking, not referenced from a User document. This means:
1. Guest bookings (no user account) are fully supported
2. The owner dashboard booking list loads with a single query — no join with User

**Three separate indexes explained:**

*Index 1* `{ businessId, date, staffId, status }` is used by the slot conflict
check query: "Find any confirmed booking for this business, this staff member,
on this date." This is the most performance-critical query in the system —
it runs on every booking creation attempt.

*Index 2* `{ businessId, status, createdAt }` is used by the owner dashboard:
"Give me this business's confirmed bookings, sorted by newest first." The `-1`
on `createdAt` tells MongoDB the index is sorted descending.

*Index 3* `{ customerEmail }` is used for customer booking history. A customer
can view all their bookings across all businesses, including ones they made as a
guest, just by matching their email.

---

#### `AuditLog.js`

```js
const auditLogSchema = new Schema({
  actorId:    { type: ObjectId, ref: 'User', required: true },
  action:     { type: String, required: true },  // e.g. 'SUSPEND_BUSINESS'
  targetType: { type: String, required: true },  // e.g. 'Business'
  targetId:   { type: ObjectId, required: true },
  metadata:   { type: Schema.Types.Mixed },      // before/after state, reason
}, { timestamps: true });
```

Every Super Admin action (suspend, reactivate, delete) writes a record here.
`Schema.Types.Mixed` allows storing arbitrary JSON in `metadata` — useful for
recording the previous/new `isActive` state, or the reason provided.

This collection is append-only. Records are never updated or deleted — that
would defeat the purpose of an audit trail.

---

## Key Decisions

**Why not use one giant `users` collection for everything?**

Separation of concerns. Business profiles, services, and staff are logically
distinct entities with different lifecycles and access patterns. Keeping them
in separate collections lets you index each one appropriately and query them
without retrieving irrelevant fields.

**Why `{ timestamps: true }` on most schemas?**

Mongoose's `timestamps` option automatically adds `createdAt` and `updatedAt`
fields to every document. These are invaluable for debugging ("when was this
booking created?"), analytics ("how many bookings were made this week?"), and
audit trails. The cost is negligible — two Date fields per document.

**Why compound indexes instead of single-field indexes?**

A compound index on `{ businessId, date, staffId, status }` can satisfy queries
that filter on `businessId` alone, `businessId + date`, or all four fields.
MongoDB reads indexes left-to-right, so the leftmost field(s) of a compound
index are automatically covered. Single-field indexes on each field separately
would be less efficient and use more storage.

---

## What you should learn from this

1. **Every schema is a specification.** Writing a schema forces you to think about
   your data before you write any logic. This prevents the "I'll figure out the
   data model later" trap that leads to painful refactors.

2. **The unique index is your last line of defence.** Application-level checks can
   fail under concurrency. A database-level unique index cannot. For correctness-critical
   constraints (like "one booking per slot"), always back them with a DB index.

3. **Denormalise deliberately.** Storing `customerName` on the booking document
   is not a mistake — it's a conscious decision to trade a tiny bit of data
   redundancy for significantly faster queries. Know when to normalise (source
   of truth) and when to denormalise (read performance).

4. **Soft delete is almost always the right choice** for business data. Customers
   ask "why was my booking cancelled?" six months later. Hard-deleted data cannot
   answer that question.

5. **Index design is part of schema design.** Adding an index after the fact
   (when the app is slow in production) is reactive. Designing indexes alongside
   the schema, based on known query patterns, is proactive — and much less stressful.