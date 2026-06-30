# BookMySlot — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** June 2026  
**Status:** Draft — Ready for Development  
**Stack:** MERN (MongoDB, Express.js, React.js, Node.js)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Multi-Tenancy Architecture](#3-multi-tenancy-architecture)
4. [Core Features & Priorities](#4-core-features--priorities)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Models Overview](#7-data-models-overview)
8. [Slot Conflict Prevention Logic](#8-slot-conflict-prevention-logic)
9. [API Surface Overview](#9-api-surface-overview)
10. [Out of Scope](#10-out-of-scope)
11. [Success Criteria](#11-success-criteria)

---

## 1. Project Overview

### 1.1 Problem Statement

Local service businesses in India — salons, clinics, coaching centers, and similar establishments — manage their appointment scheduling through informal channels: WhatsApp messages, phone calls, and handwritten registers. This approach creates several recurring problems:

- **Double bookings:** Two customers are manually confirmed for the same slot by different staff members or across different channels.
- **No-shows:** Customers forget appointments with no automated reminder system in place.
- **Zero analytics:** Business owners have no visibility into peak hours, revenue per service, staff utilization, or cancellation rates.
- **Operational chaos:** Staff spend significant time coordinating bookings instead of delivering services.
- **No customer ownership:** Customers cannot view, reschedule, or cancel their own bookings without calling in.

### 1.2 Solution

**BookMySlot** is a backend-focused multi-tenant web application built on the MERN stack that gives local Indian service businesses a self-hosted, branded booking system. Each business gets its own isolated environment where they can define their services, staff, working hours, and availability. Customers can browse available slots and book appointments online, receiving automated email confirmations.

The system is designed to be simple enough for a salon owner to manage from a mobile browser, yet robust enough to prevent concurrent booking conflicts and scale across hundreds of businesses on a shared infrastructure.

### 1.3 Goals

| # | Goal | Type |
|---|------|------|
| G1 | Eliminate double bookings through atomic slot reservation | Core |
| G2 | Reduce no-shows via automated email confirmation and reminders | Core |
| G3 | Give business owners a real-time dashboard of their bookings | Core |
| G4 | Allow customers to self-serve: book, view, and cancel appointments | Core |
| G5 | Support multiple businesses on a single backend deployment | Architecture |
| G6 | Provide Super Admin visibility across all tenants | Operations |
| G7 | Deliver a clean, mobile-friendly UI using shadcn/ui + Tailwind | Experience |

---

## 2. User Roles & Permissions

### 2.1 Role Definitions

**Business Owner** — A person who registers a business on BookMySlot. They manage their business profile, services, staff, and slots. Each owner is scoped to their own business tenant.

**Customer** — An end user who visits a business's booking page and reserves an appointment. Customers are optionally registered or can book as guests.

**Super Admin** — A platform-level administrator (Anthropic / internal team) with cross-tenant visibility and control. There is one Super Admin account per deployment.

### 2.2 Permissions Table

| Permission | Business Owner | Customer | Super Admin |
|---|:---:|:---:|:---:|
| Register a new business | ✅ | ❌ | ✅ |
| Edit own business profile | ✅ | ❌ | ✅ |
| View other businesses' data | ❌ | ❌ | ✅ |
| Create / edit services | ✅ | ❌ | ✅ |
| Delete services | ✅ | ❌ | ✅ |
| Add / manage staff members | ✅ | ❌ | ✅ |
| Create time slots | ✅ | ❌ | ✅ |
| Block / unblock time slots | ✅ | ❌ | ✅ |
| View own business bookings | ✅ | ❌ | ✅ |
| View all platform bookings | ❌ | ❌ | ✅ |
| Create a booking | ❌ | ✅ | ✅ |
| View own bookings | ❌ | ✅ | ✅ |
| Cancel own booking | ❌ | ✅ | ✅ |
| Cancel any booking | ✅ (own business) | ❌ | ✅ |
| View booking analytics | ✅ (own business) | ❌ | ✅ (all) |
| Suspend a business account | ❌ | ❌ | ✅ |
| Delete a business account | ❌ | ❌ | ✅ |
| Receive confirmation emails | ✅ | ✅ | ❌ |
| Access Super Admin dashboard | ❌ | ❌ | ✅ |

### 2.3 Role Comparison Summary

| Dimension | Business Owner | Customer | Super Admin |
|---|---|---|---|
| Scope | Single tenant (own business) | Single tenant (own bookings) | All tenants |
| Primary concern | Operations & revenue | Booking experience | Platform health |
| Auth mechanism | JWT (email + password) | JWT (email + password) or guest token | JWT (hardcoded seeded account) |
| Dashboard | Business dashboard | My Bookings page | Admin console |
| Data isolation | Strict — cannot see other businesses | Strict — cannot see other customers | None — full visibility |

---

## 3. Multi-Tenancy Architecture

### 3.1 What Is Multi-Tenancy Here?

BookMySlot runs a **single backend instance** (one Express.js server, one MongoDB Atlas cluster) that serves multiple businesses simultaneously. Each business is a **tenant** — a logically isolated unit with its own data, configuration, and users.

### 3.2 Tenancy Strategy: Shared Database, Tenant-Scoped Documents

BookMySlot uses a **shared database with tenant field isolation** pattern:

- All documents (services, slots, bookings, staff) contain a `businessId` field that references the `Business` document.
- Every API route that reads or mutates tenant data **automatically appends a `businessId` filter** derived from the authenticated user's JWT payload.
- A Business Owner cannot issue a query that returns another business's data — the middleware enforces this transparently.

### 3.3 How a Request Flows Through the System

```
Customer visits → bookmyslot.in/b/sunshine-salon
                         │
                         ▼
              Frontend resolves business slug
                         │
                         ▼
         GET /api/businesses/:slug  →  returns businessId + public info
                         │
                         ▼
         Customer browses services, selects slot
                         │
                         ▼
         POST /api/bookings  { businessId, slotId, serviceId, customerInfo }
                         │
                         ▼
         Backend validates: slot belongs to businessId? slot still available?
                         │
                         ▼
               Slot reserved atomically → Booking created
                         │
                         ▼
               Email confirmation sent via nodemailer
```

### 3.4 Tenant Isolation Enforcement

| Layer | Isolation Mechanism |
|---|---|
| Authentication | JWT payload includes `{ userId, role, businessId }` |
| Middleware | `requireBusinessScope` middleware injects `req.businessId` from JWT |
| Database queries | All Mongoose queries for tenant data include `.find({ businessId: req.businessId })` |
| Route guards | Business Owner routes check `req.user.businessId === resource.businessId` |
| Super Admin bypass | Super Admin routes use a separate router with no `businessId` injection |

### 3.5 Business Slug (Public URL)

Each business is assigned a unique URL slug at registration (e.g., `sunshine-salon`). The public booking page for that business lives at `/b/:slug`. The slug is stored on the `Business` document and indexed for fast lookups.

---

## 4. Core Features & Priorities

| Priority | Feature | Description |
|---|---|---|
| **P0** | Business Registration & Onboarding | Owner signs up, creates business profile, gets a booking URL |
| **P0** | Service Management | Define services with name, duration, price |
| **P0** | Staff Management | Add staff members, assign them to services |
| **P0** | Time Slot Generation | Generate available booking slots based on working hours |
| **P0** | Customer Booking Flow | Customer selects service → staff → slot → confirms |
| **P0** | Slot Conflict Prevention | Atomic check-and-reserve to prevent double bookings |
| **P0** | Email Confirmation (nodemailer) | Send booking confirmation to customer and business owner |
| **P0** | JWT Authentication | Secure login for Business Owner and Customer |
| **P0** | Business Owner Dashboard | View upcoming bookings, manage slots, view today's schedule |
| **P0** | Customer Booking History | Customer can view and cancel their own bookings |
| **P1** | Booking Reminders | Email reminder 24h before appointment |
| **P1** | Slot Blocking | Owner can block slots for holidays, breaks, or personal leave |
| **P1** | Analytics Dashboard | Revenue, booking count, peak hours, cancellation rate per business |
| **P1** | Multi-Staff Availability | Filter available slots by staff member |
| **P1** | Super Admin Console | View all businesses, booking counts, suspend accounts |
| **P1** | Guest Booking | Customer books without creating an account |
| **P2** | Rescheduling | Customer reschedules an existing booking to a new slot |
| **P2** | Waitlist | Customer joins a waitlist if a slot is full |
| **P2** | Business Customization | Custom colors/logo on public booking page |
| **P2** | SMS Notifications | OTP or reminder via SMS (requires third-party integration) |
| **P2** | Multi-location Support | One business owner manages multiple physical locations |

---

## 5. Functional Requirements

### 5.1 Business Registration & Onboarding

**What it does:** Allows a new business owner to register their business and get a functional booking page.

**Inputs:**
- Owner: full name, email, password
- Business: name, category (salon / clinic / coaching), city, phone number, description (optional)
- System generates: unique slug, businessId, JWT

**Outputs:**
- Business document created in MongoDB
- Owner User document created, linked to business
- Welcome email sent via nodemailer
- JWT returned for immediate session

**Rules / Constraints:**
- Email must be unique across all owners
- Business slug must be globally unique; if `sunshine-salon` is taken, suggest `sunshine-salon-pune`
- Password minimum 8 characters, stored as bcrypt hash (salt rounds ≥ 10)
- Business category must be one of the allowed enum values
- A single owner can own only one business in V1

---

### 5.2 Service Management

**What it does:** Business owners define the services they offer, which customers can then book.

**Inputs:**
- Service name (e.g., "Haircut", "Root Canal Consultation")
- Duration in minutes (e.g., 30, 45, 60)
- Price in INR
- Staff assignment (which staff members can deliver this service)
- Active/inactive status

**Outputs:**
- Service document created, linked to `businessId`
- Services appear on the public booking page

**Rules / Constraints:**
- Duration must be a multiple of 15 minutes (15, 30, 45, 60, 90, 120)
- Price must be a positive number; 0 is allowed (free consultation)
- At least one service must be active for the booking page to be visible
- Deleting a service soft-deletes it (marks inactive); existing bookings for that service are retained

---

### 5.3 Staff Management

**What it does:** Owners add their staff members so customers can choose who they want to be served by.

**Inputs:**
- Staff name, optional photo URL, role/title (e.g., "Senior Stylist")
- Assigned services (many-to-many)
- Working days and hours (per staff member)

**Outputs:**
- Staff document linked to `businessId`
- Staff appear as selectable options during booking

**Rules / Constraints:**
- Staff members are not system users — they do not have login credentials in V1
- A staff member must be assigned to at least one service to appear in booking flow
- Working hours are stored as day-of-week + start_time + end_time arrays

---

### 5.4 Time Slot Generation

**What it does:** The system generates available booking slots based on business hours, service duration, and existing bookings.

**Inputs:**
- Date selected by customer
- Service selected (determines duration)
- Staff selected (optional; if not, shows aggregate availability)

**Outputs:**
- List of available `TimeSlot` windows for that date (e.g., 10:00–10:30, 10:30–11:00)
- Each slot shows status: `available`, `booked`, `blocked`

**Rules / Constraints:**
- Slots are generated dynamically at query time — not pre-generated and stored (avoids stale data)
- Slot boundaries are calculated from: `staff.workingHours[day].start` stepping by `service.durationMinutes`
- A slot is considered unavailable if an existing booking overlaps with its time window for that staff + date
- Buffer time between appointments (optional, set per business, default 0 minutes) is respected
- Past slots (time already elapsed today) are never returned as available

---

### 5.5 Customer Booking Flow

**What it does:** The end-to-end flow a customer takes to reserve an appointment.

**Steps:**
1. Customer visits `/b/:slug`
2. Selects a service from the list
3. Selects preferred staff member (or "Any available")
4. Selects a date from a date picker
5. Sees available time slots for that date
6. Selects a slot
7. Enters name, email, phone (and password if they want an account)
8. Confirms booking

**Inputs:**
- `businessId`, `serviceId`, `staffId` (nullable), `slotId` (or `startTime` + `date`), customer details

**Outputs:**
- Booking document created in MongoDB with status `confirmed`
- `TimeSlot` status updated to `booked`
- Email confirmation sent to customer and business owner
- Customer receives a booking reference ID

**Rules / Constraints:**
- Slot availability is re-validated on submission (optimistic UI + server-side final check)
- If slot was taken between selection and submission, return HTTP 409 with a clear message
- Customer email is required for confirmation
- Phone number is required for business owner to contact if needed
- Booking cannot be made for a date more than 30 days in the future (configurable)

---

### 5.6 Booking Cancellation

**What it does:** Allows customers or business owners to cancel a booking.

**Inputs:**
- `bookingId`, cancellation reason (optional)

**Outputs:**
- Booking status updated to `cancelled`
- Associated `TimeSlot` status reverted to `available`
- Cancellation email sent to customer

**Rules / Constraints:**
- Customer can only cancel their own booking (validated via JWT or guest token)
- Business Owner can cancel any booking within their tenant
- Cancellation must happen at least 1 hour before the appointment time (configurable per business)
- Late cancellation by owner sends an apology email to the customer (triggered automatically)
- Cancelled slots are immediately available for rebooking

---

### 5.7 Business Owner Dashboard

**What it does:** Gives the owner a real-time view of their schedule and business activity.

**Inputs:**
- Date filter (default: today), status filter (all / confirmed / cancelled)

**Outputs:**
- List of today's bookings (customer name, service, time, staff)
- Upcoming bookings (next 7 days)
- Quick stats: bookings today, revenue today, cancellations this week

**Rules / Constraints:**
- Data is scoped strictly to the owner's `businessId`
- Dashboard must load within 2 seconds (use indexed queries)
- All times displayed in IST (UTC+5:30)

---

### 5.8 Email Notifications (nodemailer)

**What it does:** Sends transactional emails for key booking lifecycle events.

| Trigger | Recipient(s) | Email Content |
|---|---|---|
| Booking confirmed | Customer + Owner | Booking ID, service, staff, date/time, location |
| Booking cancelled | Customer | Cancellation confirmation, reason if provided |
| 24h reminder | Customer | Reminder of upcoming appointment |
| New business registered | Owner | Welcome email, link to dashboard |
| Late cancellation by Owner | Customer | Apology + encouragement to rebook |

**Rules / Constraints:**
- Emails sent asynchronously (do not block API response)
- SMTP credentials stored in environment variables, never in code
- Email template uses minimal HTML, mobile-readable
- Failed email sends are logged but do not fail the booking operation

---

### 5.9 Super Admin Console

**What it does:** Gives the platform operator visibility and control over all tenants.

**Inputs:**
- Search by business name, date range filters

**Outputs:**
- List of all registered businesses with status, booking count, registration date
- Ability to view any business's bookings
- Ability to suspend or delete a business account

**Rules / Constraints:**
- Super Admin account is seeded via a database seed script — not registerable via UI
- Super Admin actions are logged to an audit collection
- Suspending a business hides its public booking page immediately

---

## 6. Non-Functional Requirements

### 6.1 Security

| Requirement | Implementation |
|---|---|
| Authentication | JWT (access token: 7d expiry, HTTP-only cookie or Authorization header) |
| Password storage | bcrypt with salt rounds ≥ 10 |
| Tenant isolation | Middleware-enforced `businessId` scoping on all owner routes |
| Input validation | `express-validator` or `zod` on all incoming request bodies |
| Rate limiting | `express-rate-limit` on auth endpoints (max 10 requests/min per IP) |
| CORS | Whitelist only the Vercel frontend domain in production |
| Environment secrets | All credentials in `.env`, never committed to git |
| HTTP headers | `helmet.js` for secure HTTP headers |

### 6.2 Scalability

- MongoDB Atlas M0 (free tier) is sufficient for MVP; upgrade path to M10+ for production
- All Mongoose queries on high-traffic fields (businessId, date, status) must have compound indexes
- Stateless Express.js server enables horizontal scaling on Render without session concerns
- Slot generation is computed on demand — no scheduled jobs required for slot management in V1

### 6.3 Slot Conflict Handling

- See Section 8 for the full algorithm
- Database write operations for booking creation use MongoDB's atomic `findOneAndUpdate` with conditions
- Concurrent booking attempts for the same slot are resolved by the database layer, not the application layer

### 6.4 Error Response Standards

All API errors must follow this JSON envelope:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "This slot was just booked by someone else. Please choose another time.",
    "statusCode": 409
  }
}
```

| Situation | HTTP Status | Error Code |
|---|---|---|
| Invalid input | 400 | `VALIDATION_ERROR` |
| Unauthenticated | 401 | `UNAUTHORIZED` |
| Wrong role / tenant mismatch | 403 | `FORBIDDEN` |
| Resource not found | 404 | `NOT_FOUND` |
| Slot already taken | 409 | `SLOT_UNAVAILABLE` |
| Server error | 500 | `INTERNAL_ERROR` |

### 6.5 Availability

- Backend on Render Free Tier will spin down after inactivity — acceptable for MVP
- Target uptime in production: 99% (handled by Render paid tier or auto-deploy on push)

### 6.6 Performance Targets

| Operation | Target Response Time |
|---|---|
| Public business page load | < 500ms |
| Available slots query | < 800ms |
| Booking creation (with email trigger) | < 1200ms |
| Owner dashboard load | < 1500ms |

---

## 7. Data Models Overview

### 7.1 Entity Relationship Summary

```
Business ──┬── Service (many)
           ├── Staff (many)
           ├── Booking (many)
           └── TimeSlot (many, optional pre-blocked)

User ───────── Business (one-to-one for Owner role)
             └── Booking (many, for Customer role)

Booking ────── Service (one)
            ├── Staff (one, nullable)
            └── TimeSlot (one)
```

---

### 7.2 User

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required |
| `email` | String | Unique, required |
| `passwordHash` | String | bcrypt hash |
| `role` | Enum | `customer`, `business_owner`, `super_admin` |
| `businessId` | ObjectId | Ref: Business; null for customer and super_admin |
| `phone` | String | Optional for owners, required for customers at booking |
| `createdAt` | Date | Auto timestamp |
| `updatedAt` | Date | Auto timestamp |

---

### 7.3 Business

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `ownerId` | ObjectId | Ref: User |
| `name` | String | Required |
| `slug` | String | Unique, URL-safe |
| `category` | Enum | `salon`, `clinic`, `coaching`, `other` |
| `city` | String | Required |
| `phone` | String | Required |
| `description` | String | Optional |
| `workingHours` | Array | `[{ day: 'monday', start: '09:00', end: '18:00' }]` |
| `bufferMinutes` | Number | Default 0 |
| `isActive` | Boolean | Default true; false = suspended |
| `createdAt` | Date | Auto timestamp |

---

### 7.4 Service

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `businessId` | ObjectId | Ref: Business; tenant key |
| `name` | String | Required |
| `description` | String | Optional |
| `durationMinutes` | Number | Multiple of 15; required |
| `priceINR` | Number | Required; 0 allowed |
| `isActive` | Boolean | Default true |
| `createdAt` | Date | Auto timestamp |

---

### 7.5 Staff

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `businessId` | ObjectId | Ref: Business; tenant key |
| `name` | String | Required |
| `title` | String | Optional (e.g., "Senior Stylist") |
| `serviceIds` | [ObjectId] | Ref: Service (many-to-many) |
| `workingHours` | Array | Per-staff override; falls back to business hours if empty |
| `isActive` | Boolean | Default true |

---

### 7.6 TimeSlot

TimeSlots represent explicitly blocked windows (holidays, manual blocks). Available slots are computed dynamically and not stored.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `businessId` | ObjectId | Ref: Business; tenant key |
| `staffId` | ObjectId | Ref: Staff; nullable (null = blocks all staff) |
| `date` | String | ISO date `YYYY-MM-DD` |
| `startTime` | String | `HH:MM` 24h format |
| `endTime` | String | `HH:MM` 24h format |
| `status` | Enum | `blocked`, `booked` |
| `bookingId` | ObjectId | Ref: Booking; null if just blocked |
| `reason` | String | Optional block reason (e.g., "Staff on leave") |

---

### 7.7 Booking

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `bookingRef` | String | Short human-readable ID (e.g., `BMS-00142`) |
| `businessId` | ObjectId | Ref: Business; tenant key |
| `serviceId` | ObjectId | Ref: Service |
| `staffId` | ObjectId | Ref: Staff; nullable |
| `customerId` | ObjectId | Ref: User; nullable for guest bookings |
| `customerName` | String | Denormalized for quick display |
| `customerEmail` | String | For confirmation email |
| `customerPhone` | String | For business contact |
| `date` | String | `YYYY-MM-DD` |
| `startTime` | String | `HH:MM` |
| `endTime` | String | `HH:MM` (computed: startTime + durationMinutes) |
| `status` | Enum | `confirmed`, `cancelled`, `completed` |
| `cancelledBy` | Enum | `customer`, `business`, null |
| `cancellationReason` | String | Optional |
| `emailSentAt` | Date | Timestamp of confirmation email |
| `createdAt` | Date | Auto timestamp |

**Indexes:**
- Compound: `{ businessId, date, staffId, status }` — for slot availability queries
- Compound: `{ businessId, status, createdAt }` — for dashboard queries
- Index: `{ customerEmail }` — for customer booking history (guest support)

---

## 8. Slot Conflict Prevention Logic

### 8.1 The Problem

When two customers simultaneously view the same available slot and both click "Book Now", a naive implementation would create two bookings for the same time window. This is the core technical challenge the system must solve.

### 8.2 The Algorithm (Plain English)

**Phase 1: Optimistic UI Display**

When a customer requests available slots, the backend:
1. Looks up all bookings for that business + staff + date with status `confirmed`
2. Looks up all TimeSlot documents marked `blocked` for that staff + date
3. Generates the full set of possible slot windows (business hours ÷ service duration)
4. Removes any window that overlaps with an existing confirmed booking or blocked slot
5. Returns the clean list to the frontend

This gives the customer an accurate-at-that-moment view. However, between the time they see the list and the time they click "Book", another customer may grab a slot.

**Phase 2: Atomic Reservation on Submission**

When a customer submits a booking:

1. **Re-check availability** — Before writing anything, query MongoDB again for any confirmed booking where:
   - `businessId` matches
   - `staffId` matches (or staff is null/"any")
   - `date` matches
   - The time window `[requestedStart, requestedEnd)` overlaps with `[existingStart, existingEnd)`
   
   Overlap condition: `existingStart < requestedEnd AND existingEnd > requestedStart`

2. **Atomic write** — If no conflict is found, create the Booking document AND the TimeSlot document (status: `booked`) in a **single MongoDB transaction** (using `session.withTransaction()`). Both writes succeed or both fail together.

3. **Race condition guard** — Because two simultaneous requests might both pass the re-check at the same moment (before either writes), the TimeSlot document has a unique compound index on `{ businessId, staffId, date, startTime }`. If two requests attempt to insert the same TimeSlot simultaneously, MongoDB will reject the second with a duplicate key error (E11000). The application catches this and returns a `409 SLOT_UNAVAILABLE` response to the second customer.

**Phase 3: User Experience on Conflict**

When a 409 is returned:
- The frontend displays: *"This slot was just taken. Here are the next available times:"* and auto-refreshes the slot list.
- The customer can pick again without re-entering their details.

### 8.3 Summary of Safeguards

| Layer | Safeguard |
|---|---|
| Frontend | Slot list refreshed on each new date/service selection |
| API (pre-write) | Overlap query before attempting booking write |
| Database (write) | MongoDB transaction wraps Booking + TimeSlot creation |
| Database (index) | Unique index on TimeSlot prevents duplicate slot insertion |
| API (response) | 409 with helpful message and retry prompt |

---

## 9. API Surface Overview

All routes are prefixed with `/api`. Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

### 9.1 Auth Routes

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new business owner |
| POST | `/auth/login` | Public | Login (owner or customer) |
| POST | `/auth/logout` | Auth | Invalidate session |
| GET | `/auth/me` | Auth | Get current user info |

### 9.2 Business Routes

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/businesses/:slug` | Public | Get business public profile by slug |
| POST | `/businesses` | Owner | Create a new business (used during onboarding) |
| PUT | `/businesses/:id` | Owner | Update own business profile |
| GET | `/businesses` | Super Admin | List all businesses |
| PATCH | `/businesses/:id/suspend` | Super Admin | Suspend or reactivate a business |

### 9.3 Service Routes

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/services` | Public (with businessId query) | List active services for a business |
| POST | `/services` | Owner | Create a new service |
| PUT | `/services/:id` | Owner | Update a service |
| DELETE | `/services/:id` | Owner | Soft-delete a service |

### 9.4 Staff Routes

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/staff` | Public (with businessId query) | List active staff for a business |
| POST | `/staff` | Owner | Add a new staff member |
| PUT | `/staff/:id` | Owner | Update staff details |
| DELETE | `/staff/:id` | Owner | Soft-delete a staff member |

### 9.5 Slot / Availability Routes

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/slots/available` | Public | Query available slots for date + service + optional staff |
| POST | `/slots/block` | Owner | Block a time slot (holiday, break) |
| DELETE | `/slots/:id/unblock` | Owner | Unblock a previously blocked slot |
| GET | `/slots` | Owner | List blocked slots for own business |

### 9.6 Booking Routes

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/bookings` | Public / Customer | Create a new booking |
| GET | `/bookings` | Owner | List bookings for own business (with filters) |
| GET | `/bookings/my` | Customer | List own bookings |
| GET | `/bookings/:id` | Owner / Customer | Get a single booking detail |
| PATCH | `/bookings/:id/cancel` | Owner / Customer | Cancel a booking |
| GET | `/bookings/all` | Super Admin | List all bookings across businesses |

### 9.7 Analytics Routes

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/analytics/summary` | Owner | Revenue, bookings, cancellation rate (date range) |
| GET | `/analytics/peak-hours` | Owner | Booking frequency by hour of day |
| GET | `/analytics/all` | Super Admin | Platform-wide stats |

---

## 10. Out of Scope

The following are explicitly **not** being built in V1 of BookMySlot:

| # | Feature | Reason |
|---|---|---|
| 1 | Payment processing (Razorpay, Stripe) | Adds significant compliance overhead; businesses will collect payment in-person |
| 2 | SMS / WhatsApp notifications | Requires third-party API keys and cost; email is sufficient for MVP |
| 3 | Native mobile app (iOS/Android) | Web app is mobile-responsive; native app is a future investment |
| 4 | Customer review / rating system | Out of scope for appointment management MVP |
| 5 | Video consultation (telemedicine) | Adds WebRTC complexity; clinics can use existing tools |
| 6 | Calendar sync (Google Calendar, iCal) | Nice-to-have; deferred to V2 |
| 7 | Multi-location support per business | Architecture supports it but UI and data model changes are deferred |
| 8 | Two-factor authentication (2FA) | Good to have; deferred to V2 |
| 9 | Public marketplace / discovery | BookMySlot is not a consumer directory; each business has its own URL |
| 10 | Inventory / product management | Out of scope for appointment-only MVP |
| 11 | Staff payroll / commission tracking | HR tooling is outside the product boundary |
| 12 | Recurring / subscription bookings | Single-session booking only in V1 |

---

## 11. Success Criteria

### 11.1 Functional Completeness (MVP Done)

The project is considered functionally complete when all P0 features pass end-to-end testing:

- [ ] A new business owner can register, set up services and staff, and receive a shareable booking URL
- [ ] A customer can visit that URL, browse services, pick a date/slot, and complete a booking without errors
- [ ] A booking confirmation email is received by both customer and owner within 30 seconds
- [ ] A second customer attempting to book the same slot at the same time receives a 409 and sees alternate slots
- [ ] The business owner can view today's bookings, block a slot, and cancel a booking from the dashboard
- [ ] A customer can view and cancel their own booking
- [ ] JWT authentication prevents any cross-tenant data access

### 11.2 Technical Quality

- [ ] All API routes return consistent JSON envelopes (success / error format)
- [ ] No hardcoded credentials or environment values in codebase
- [ ] MongoDB compound indexes in place for all high-traffic queries
- [ ] Backend deployed to Render, frontend to Vercel, database on MongoDB Atlas — all connected and working
- [ ] README includes setup instructions, environment variable list, and seed script usage

### 11.3 Impressiveness for Portfolio / Hiring

The project will stand out when it demonstrates:

- [ ] Multi-tenancy: one backend, multiple businesses, full data isolation provably in place
- [ ] Race condition handling: the slot conflict prevention algorithm is documented in the README and demonstrable via Postman with concurrent requests
- [ ] Clean architecture: routes → controllers → services → models separation, no business logic in route files
- [ ] Production deployment: live URLs for both frontend and backend with a demo business pre-seeded
- [ ] Email flow: live nodemailer confirmation email received end-to-end in the demo
- [ ] Code quality: consistent error handling, environment-aware config, no console.log in production

### 11.4 Definition of Done (Per Feature)

A feature is "done" when:
1. The API endpoint(s) are implemented and tested via Postman / Thunder Client
2. The frontend UI for that feature is wired to the real API (no mock data in production)
3. Edge cases (empty states, errors, loading states) are handled in the UI
4. The feature works end-to-end on the deployed production URLs

---

*End of PRD — BookMySlot v1.0*

*This document should be treated as a living reference. Update the version number and date when requirements change. AI coding tools (GitHub Copilot, Cursor, Claude) should be given this document as context at the start of each feature development session.*