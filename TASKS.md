# BookMySlot — Development Task Tracker

**Project:** BookMySlot  
**Stack:** MERN · JWT · nodemailer · shadcn/ui · Tailwind CSS  
**Deployment:** Render (backend) · Vercel (frontend) · MongoDB Atlas (DB)

> **How to use this file:** Work top-to-bottom within each phase. Check off tasks as you complete them. Never start a task until its `Depends On` tasks are checked. Paste the relevant phase + task into your AI coding tool as context at the start of each session.

---

## Task Status Legend

- `[ ]` Not started
- `[x]` Complete
- `[~]` In progress

---

## Phase 1 — Project Setup

> Goal: Both backend and frontend repos are initialized, connected, and running locally with a shared environment config.

---

- [✔️ ] **T-001 · Initialize Backend Repository**
  - **Description:** Scaffold a Node.js + Express.js project with folder structure `src/{routes,controllers,services,models,middleware,utils,config}`. Initialize git, add `.gitignore` excluding `node_modules` and `.env`.
  - **Files to create:** `backend/package.json`, `backend/src/app.js`, `backend/src/server.js`, `backend/.gitignore`, `backend/.env.example`
  - **Depends On:** —

- [✔️] **T-002 · Install Backend Dependencies**
  - **Description:** Install all backend npm packages: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `dotenv`, `cors`, `helmet`, `express-rate-limit`, `express-validator`, `nodemailer`, `nodemon` (dev).
  - **Files to modify:** `backend/package.json`
  - **Depends On:** T-001

- [✔️] **T-003 · Configure Express App**
  - **Description:** Set up `app.js` with `helmet`, `cors` (whitelist from env), `express.json()`, and a base `/api/health` route that returns `{ status: "ok" }`. Load env via `dotenv`.
  - **Files to create/modify:** `backend/src/app.js`, `backend/src/config/env.js`
  - **Depends On:** T-002

- [✔️] **T-004 · Connect to MongoDB Atlas**
  - **Description:** Create a `connectDB` utility using Mongoose that reads `MONGODB_URI` from env, logs success/failure, and exits the process on connection failure. Call it from `server.js` before `app.listen`.
  - **Files to create:** `backend/src/config/db.js`, modify `backend/src/server.js`
  - **Depends On:** T-003

- [✔️] **T-005 · Initialize Frontend Repository**
  - **Description:** Scaffold a React + Vite project inside `/frontend`. Install Tailwind CSS, configure `tailwind.config.js` and `postcss.config.js`. Verify hot reload works with a blank `App.jsx`.
  - **Files to create:** `frontend/` (full Vite scaffold), `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/src/App.jsx`
  - **Depends On:** —

- [✔️] **T-006 · Install and Configure shadcn/ui**
  - **Description:** Run `npx shadcn-ui@latest init` to set up component library with default theme. Install initial components: `button`, `input`, `card`, `badge`, `dialog`, `form`, `label`, `select`, `toast`.
  - **Files to create/modify:** `frontend/components.json`, `frontend/src/lib/utils.js`, `frontend/src/components/ui/` (generated)
  - **Depends On:** T-005

- [✔️] **T-007 · Configure Frontend API Client**
  - **Description:** Create a centralized `apiClient.js` using the Fetch API (or Axios) that reads `VITE_API_BASE_URL` from env, automatically attaches the JWT from `localStorage` in the `Authorization` header, and exports typed helper methods: `get`, `post`, `put`, `patch`, `del`.
  - **Files to create:** `frontend/src/lib/apiClient.js`, `frontend/.env.example`
  - **Depends On:** T-005

- [✔️] **T-008 · Define Shared Constants & Error Envelope**
  - **Description:** Create a `constants.js` file in backend with enums for `ROLES`, `BOOKING_STATUS`, `BUSINESS_CATEGORIES`, and `SLOT_STATUS`. Create an `errorResponse` and `successResponse` utility to enforce consistent JSON envelopes across all routes.
  - **Files to create:** `backend/src/utils/constants.js`, `backend/src/utils/response.js`
  - **Depends On:** T-003

- [✔️] **T-009 · Create Database Seed Script**
  - **Description:** Write a `seed.js` script that drops and recreates: one Super Admin user (from env credentials), one sample Business Owner, one sample business ("Demo Salon"), two services, two staff members. Must be runnable via `npm run seed`.
  - **Files to create:** `backend/src/scripts/seed.js`, modify `backend/package.json` scripts
  - **Depends On:** T-004, T-008

---

## Phase 2 — Authentication (JWT · Business Owner · Customer)

> Goal: All three user roles can register/login and receive a scoped JWT. Middleware enforces tenant isolation on every protected route.

---

- [ ] **T-010 · Create User Mongoose Model**
  - **Description:** Define the `User` schema with fields: `name`, `email` (unique), `passwordHash`, `role` (enum: `customer`, `business_owner`, `super_admin`), `businessId` (ref: Business, nullable), `phone`. Add pre-save hook to bcrypt-hash the password. Export model.
  - **Files to create:** `backend/src/models/User.js`
  - **Depends On:** T-004, T-008

- [ ] **T-011 · Implement Business Owner Registration**
  - **Description:** `POST /api/auth/register` — Accept `name`, `email`, `password`, `businessName`, `category`, `city`, `phone`. Validate inputs. Create a `Business` document and a linked `User` (role: `business_owner`) in a single Mongoose session/transaction. Return JWT.
  - **Files to create:** `backend/src/routes/auth.routes.js`, `backend/src/controllers/auth.controller.js`, `backend/src/services/auth.service.js`
  - **Depends On:** T-010, T-016 (Business model — create Business model first or inline it here)

- [ ] **T-012 · Implement Customer Registration**
  - **Description:** `POST /api/auth/register/customer` — Accept `name`, `email`, `password`, `phone`. Create a `User` (role: `customer`, `businessId: null`). Return JWT. Keep separate from owner registration to avoid ambiguity.
  - **Files to modify:** `backend/src/controllers/auth.controller.js`, `backend/src/services/auth.service.js`
  - **Depends On:** T-010

- [ ] **T-013 · Implement Login (All Roles)**
  - **Description:** `POST /api/auth/login` — Accept `email` + `password`. Find user, compare bcrypt hash, generate JWT payload `{ userId, role, businessId }` signed with `JWT_SECRET`, expires in `7d`. Return token + user object.
  - **Files to modify:** `backend/src/controllers/auth.controller.js`, `backend/src/services/auth.service.js`
  - **Depends On:** T-010

- [ ] **T-014 · Implement GET /auth/me**
  - **Description:** `GET /api/auth/me` — Protected route that decodes the JWT and returns the current user's `{ id, name, email, role, businessId }`. Used by frontend to restore session on page refresh.
  - **Files to modify:** `backend/src/controllers/auth.controller.js`, `backend/src/routes/auth.routes.js`
  - **Depends On:** T-013, T-015

- [ ] **T-015 · Build Auth Middleware Suite**
  - **Description:** Create three middleware functions: (1) `authenticate` — verifies JWT, attaches `req.user`; (2) `requireRole(...roles)` — checks `req.user.role` against allowed roles, returns 403 if not matched; (3) `requireBusinessScope` — injects `req.businessId` from `req.user.businessId`, returns 403 if null.
  - **Files to create:** `backend/src/middleware/auth.middleware.js`
  - **Depends On:** T-013

- [ ] **T-016 · Create Business Mongoose Model**
  - **Description:** Define the `Business` schema with all fields from PRD §7.3: `ownerId`, `name`, `slug` (unique, indexed), `category`, `city`, `phone`, `description`, `workingHours` (array), `bufferMinutes`, `isActive`. Add a pre-save hook to auto-generate slug from business name if not provided.
  - **Files to create:** `backend/src/models/Business.js`
  - **Depends On:** T-004, T-008

- [ ] **T-017 · Add Rate Limiting to Auth Routes**
  - **Description:** Apply `express-rate-limit` to `/api/auth/login` and `/api/auth/register` — max 10 requests per 15 minutes per IP. Return a clear 429 message. Use a separate limiter instance from the global one.
  - **Files to modify:** `backend/src/routes/auth.routes.js`, create `backend/src/middleware/rateLimiter.middleware.js`
  - **Depends On:** T-011, T-013

- [ ] **T-018 · Frontend — Auth Context & Protected Routes**
  - **Description:** Create a React `AuthContext` that stores `{ user, token }`, provides `login()`, `logout()`, and `register()` actions, and persists token to `localStorage`. Create a `<ProtectedRoute>` wrapper that redirects unauthenticated users to `/login`.
  - **Files to create:** `frontend/src/context/AuthContext.jsx`, `frontend/src/components/ProtectedRoute.jsx`
  - **Depends On:** T-007

- [ ] **T-019 · Frontend — Login & Register Pages**
  - **Description:** Build `/login` and `/register` pages using shadcn/ui `Form`, `Input`, `Button`, and `Card` components. Registration page collects business info alongside owner info. Show inline validation errors. On success, store token and redirect to `/dashboard`.
  - **Files to create:** `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`
  - **Depends On:** T-018, T-006

---

## Phase 3 — Business & Service APIs

> Goal: Business profiles are fully manageable by owners. Services can be created, updated, and soft-deleted. Public slug-based lookup works.

---

- [ ] **T-020 · GET /businesses/:slug (Public)**
  - **Description:** Return the public business profile by slug — name, category, city, phone, description, workingHours, isActive. Return 404 if not found or `isActive: false`. This is the entry point for the customer booking page.
  - **Files to create:** `backend/src/routes/business.routes.js`, `backend/src/controllers/business.controller.js`, `backend/src/services/business.service.js`
  - **Depends On:** T-016, T-015

- [ ] **T-021 · PUT /businesses/:id (Owner — Update Own Business)**
  - **Description:** Allow the authenticated Business Owner to update their own business profile fields: `name`, `description`, `phone`, `workingHours`, `bufferMinutes`. Validate `req.user.businessId === req.params.id` before updating. Regenerate slug if name changes (check uniqueness).
  - **Files to modify:** `backend/src/controllers/business.controller.js`, `backend/src/services/business.service.js`
  - **Depends On:** T-020, T-015

- [ ] **T-022 · GET /businesses (Super Admin — List All)**
  - **Description:** Return paginated list of all businesses with fields: `name`, `slug`, `category`, `city`, `isActive`, `createdAt`, booking count (aggregated). Supports query params: `?page`, `?limit`, `?isActive`.
  - **Files to modify:** `backend/src/controllers/business.controller.js`, `backend/src/routes/business.routes.js`
  - **Depends On:** T-020, T-015

- [ ] **T-023 · PATCH /businesses/:id/suspend (Super Admin)**
  - **Description:** Toggle `isActive` on a Business document to `true` or `false`. When set to false, the business's public booking page returns a 403. Log the action (who, when, which business) to an `AuditLog` collection.
  - **Files to modify:** `backend/src/controllers/business.controller.js`; create `backend/src/models/AuditLog.js`
  - **Depends On:** T-022

- [ ] **T-024 · Create Service Mongoose Model**
  - **Description:** Define the `Service` schema: `businessId`, `name`, `description`, `durationMinutes` (validated as multiple of 15), `priceINR` (min 0), `isActive` (default true). Add compound index on `{ businessId, isActive }`.
  - **Files to create:** `backend/src/models/Service.js`
  - **Depends On:** T-004, T-008

- [ ] **T-025 · GET /services (Public — List by Business)**
  - **Description:** `GET /api/services?businessId=xxx` — Return all active services for a business. Used on the customer-facing booking page to populate service selection. No auth required.
  - **Files to create:** `backend/src/routes/service.routes.js`, `backend/src/controllers/service.controller.js`, `backend/src/services/service.service.js`
  - **Depends On:** T-024

- [ ] **T-026 · POST /services (Owner — Create Service)**
  - **Description:** Create a new service scoped to `req.businessId`. Validate: `name` required, `durationMinutes` is a positive multiple of 15, `priceINR` ≥ 0. Reject if the same `name` already exists (case-insensitive) within the business.
  - **Files to modify:** `backend/src/controllers/service.controller.js`, `backend/src/services/service.service.js`
  - **Depends On:** T-025, T-015

- [ ] **T-027 · PUT /services/:id (Owner — Update Service)**
  - **Description:** Update any field of an owned service. Verify service's `businessId` matches `req.businessId` before update (tenant guard). Return 404 if not found, 403 if mismatched tenant.
  - **Files to modify:** `backend/src/controllers/service.controller.js`
  - **Depends On:** T-026

- [ ] **T-028 · DELETE /services/:id (Owner — Soft Delete)**
  - **Description:** Set `isActive: false` on the service — do not hard delete (preserves booking history). Verify tenant ownership. Return success message. Service immediately disappears from public listing.
  - **Files to modify:** `backend/src/controllers/service.controller.js`
  - **Depends On:** T-027

- [ ] **T-029 · Frontend — Business Dashboard Shell**
  - **Description:** Build the authenticated dashboard layout at `/dashboard` with a sidebar nav (links: Overview, Services, Staff, Slots, Bookings) and a top bar showing business name + logout. Use shadcn/ui `Card` for content areas. Route-guard with `<ProtectedRoute role="business_owner">`.
  - **Files to create:** `frontend/src/pages/DashboardPage.jsx`, `frontend/src/components/layout/DashboardLayout.jsx`, `frontend/src/components/layout/Sidebar.jsx`
  - **Depends On:** T-018, T-019

- [ ] **T-030 · Frontend — Services Management UI**
  - **Description:** Build `/dashboard/services` page: list all services in a table (name, duration, price, status), a "New Service" button that opens a shadcn/ui `Dialog` with a form, inline edit and soft-delete per row. Wire all actions to the service API endpoints.
  - **Files to create:** `frontend/src/pages/dashboard/ServicesPage.jsx`, `frontend/src/components/services/ServiceForm.jsx`, `frontend/src/components/services/ServiceTable.jsx`
  - **Depends On:** T-029, T-025, T-026, T-027, T-028

---

## Phase 4 — Staff & TimeSlot APIs

> Goal: Staff members are manageable per business. Owners can block time slots. Availability queries return correct windows based on working hours and existing bookings.

---

- [ ] **T-031 · Create Staff Mongoose Model**
  - **Description:** Define `Staff` schema: `businessId`, `name`, `title`, `serviceIds` (array of refs to Service), `workingHours` (array of `{ day, start, end }`), `isActive`. Index on `{ businessId, isActive }`.
  - **Files to create:** `backend/src/models/Staff.js`
  - **Depends On:** T-004, T-024

- [ ] **T-032 · GET /staff (Public — List by Business)**
  - **Description:** `GET /api/staff?businessId=xxx` — Return all active staff for a business, including their `serviceIds`. Optionally filter by `?serviceId=xxx` to show only staff who offer a specific service.
  - **Files to create:** `backend/src/routes/staff.routes.js`, `backend/src/controllers/staff.controller.js`, `backend/src/services/staff.service.js`
  - **Depends On:** T-031

- [ ] **T-033 · POST /staff (Owner — Add Staff Member)**
  - **Description:** Create a staff member scoped to `req.businessId`. Validate that all `serviceIds` in the payload belong to the same business. If `workingHours` is empty, staff inherits business working hours at query time.
  - **Files to modify:** `backend/src/controllers/staff.controller.js`, `backend/src/services/staff.service.js`
  - **Depends On:** T-032, T-015

- [ ] **T-034 · PUT /staff/:id (Owner — Update Staff)**
  - **Description:** Update staff name, title, serviceIds, or workingHours. Tenant-guard: verify `staff.businessId === req.businessId`. Re-validate serviceIds on update.
  - **Files to modify:** `backend/src/controllers/staff.controller.js`
  - **Depends On:** T-033

- [ ] **T-035 · DELETE /staff/:id (Owner — Soft Delete)**
  - **Description:** Set `isActive: false` on staff member. Staff disappears from booking flow. Future bookings referencing this staff are not affected (historical record preserved).
  - **Files to modify:** `backend/src/controllers/staff.controller.js`
  - **Depends On:** T-034

- [ ] **T-036 · Create TimeSlot Mongoose Model**
  - **Description:** Define `TimeSlot` schema: `businessId`, `staffId` (nullable), `date` (string `YYYY-MM-DD`), `startTime` (`HH:MM`), `endTime` (`HH:MM`), `status` (enum: `blocked`, `booked`), `bookingId` (ref: Booking, nullable), `reason`. Add **unique compound index** on `{ businessId, staffId, date, startTime }` — this is the race-condition guard.
  - **Files to create:** `backend/src/models/TimeSlot.js`
  - **Depends On:** T-004, T-008

- [ ] **T-037 · POST /slots/block (Owner — Block a Slot)**
  - **Description:** Create a TimeSlot document with `status: "blocked"`. Validate: date must be today or future, endTime must be after startTime, slot must not conflict with an existing `booked` TimeSlot for the same staff + date + time window.
  - **Files to create:** `backend/src/routes/slot.routes.js`, `backend/src/controllers/slot.controller.js`, `backend/src/services/slot.service.js`
  - **Depends On:** T-036, T-015

- [ ] **T-038 · DELETE /slots/:id/unblock (Owner — Unblock)**
  - **Description:** Delete a `blocked` TimeSlot document. Return 400 if the slot has `status: "booked"` (cannot unblock an active booking). Tenant-guard enforced.
  - **Files to modify:** `backend/src/controllers/slot.controller.js`
  - **Depends On:** T-037

- [ ] **T-039 · GET /slots/available (Core Availability Query)**
  - **Description:** `GET /api/slots/available?businessId=&serviceId=&date=&staffId=` — Compute available windows: (1) resolve service duration, (2) resolve staff working hours for that day-of-week, (3) generate all possible slot windows (start stepping by duration), (4) subtract any overlapping `booked` or `blocked` TimeSlots, (5) remove past windows if date is today. Return array of `{ startTime, endTime, staffId }`.
  - **Files to modify:** `backend/src/controllers/slot.controller.js`, `backend/src/services/slot.service.js`
  - **Depends On:** T-037, T-031, T-024

- [ ] **T-040 · GET /slots (Owner — List Blocked Slots)**
  - **Description:** `GET /api/slots?date=&staffId=` — Return all `blocked` TimeSlots for the owner's business within a date range. Used by dashboard calendar view.
  - **Files to modify:** `backend/src/controllers/slot.controller.js`
  - **Depends On:** T-037

- [ ] **T-041 · Frontend — Staff Management UI**
  - **Description:** Build `/dashboard/staff` page: list staff in cards (name, title, assigned services, status), "Add Staff" dialog with a form including a multi-select for services and working hours picker per day. Wire to staff API endpoints.
  - **Files to create:** `frontend/src/pages/dashboard/StaffPage.jsx`, `frontend/src/components/staff/StaffCard.jsx`, `frontend/src/components/staff/StaffForm.jsx`
  - **Depends On:** T-029, T-032, T-033, T-034, T-035

- [ ] **T-042 · Frontend — Slot Blocking UI**
  - **Description:** Build `/dashboard/slots` page: a weekly calendar view showing blocked slots as red cards and booked slots as green cards. A "Block Time" button opens a dialog to select staff, date, start/end time, and reason. Wire to slot API.
  - **Files to create:** `frontend/src/pages/dashboard/SlotsPage.jsx`, `frontend/src/components/slots/SlotCalendar.jsx`, `frontend/src/components/slots/BlockSlotForm.jsx`
  - **Depends On:** T-029, T-037, T-038, T-040

---

## Phase 5 — Booking API (Slot Conflict Logic)

> Goal: Customers can create bookings. The atomic conflict-prevention algorithm is implemented and tested. Owners and customers can view and cancel bookings.

---

- [ ] **T-043 · Create Booking Mongoose Model**
  - **Description:** Define `Booking` schema with all fields from PRD §7.7: `bookingRef` (auto-generated short ID like `BMS-00142`), `businessId`, `serviceId`, `staffId`, `customerId` (nullable), `customerName`, `customerEmail`, `customerPhone`, `date`, `startTime`, `endTime`, `status`, `cancelledBy`, `cancellationReason`, `emailSentAt`. Add compound indexes: `{ businessId, date, staffId, status }` and `{ businessId, status, createdAt }` and `{ customerEmail }`.
  - **Files to create:** `backend/src/models/Booking.js`
  - **Depends On:** T-004, T-008, T-036

- [ ] **T-044 · POST /bookings — Core Booking Creation with Conflict Guard**
  - **Description:** Implement the 3-phase slot conflict algorithm from PRD §8: (1) validate inputs, (2) re-query for any overlapping confirmed booking for same `businessId + staffId + date` using the overlap condition `existingStart < requestedEnd AND existingEnd > requestedStart`, (3) if clear, open a MongoDB session and run `session.withTransaction()` to atomically create the `Booking` document AND a `TimeSlot` (status: `booked`). Catch E11000 duplicate key error from the unique index and return 409.
  - **Files to create:** `backend/src/routes/booking.routes.js`, `backend/src/controllers/booking.controller.js`, `backend/src/services/booking.service.js`
  - **Depends On:** T-043, T-036, T-039

- [ ] **T-045 · Generate bookingRef Utility**
  - **Description:** Create a utility function that generates a unique short reference ID in the format `BMS-XXXXX` (zero-padded sequential number or random base-36). Must be collision-safe — query DB before finalizing. Used in booking creation.
  - **Files to create:** `backend/src/utils/generateRef.js`
  - **Depends On:** T-043

- [ ] **T-046 · GET /bookings (Owner — List Business Bookings)**
  - **Description:** Return paginated bookings for `req.businessId`. Support query filters: `?date=`, `?status=confirmed|cancelled|completed`, `?staffId=`. Include populated `serviceName`, `staffName` for display. Default sort: `date asc, startTime asc`.
  - **Files to modify:** `backend/src/controllers/booking.controller.js`, `backend/src/routes/booking.routes.js`
  - **Depends On:** T-044, T-015

- [ ] **T-047 · GET /bookings/my (Customer — Own Booking History)**
  - **Description:** Return all bookings where `customerId === req.user._id` OR `customerEmail === req.user.email` (to capture guest bookings later claimed). Populate `businessName`, `serviceName`, `staffName`. Sort by `date desc`.
  - **Files to modify:** `backend/src/controllers/booking.controller.js`
  - **Depends On:** T-044, T-015

- [ ] **T-048 · GET /bookings/:id (Owner or Customer — Single Booking)**
  - **Description:** Return full booking detail. Authorization: Business Owner may fetch any booking in their tenant. Customer may only fetch their own booking. Return 403 for all other cases.
  - **Files to modify:** `backend/src/controllers/booking.controller.js`
  - **Depends On:** T-046

- [ ] **T-049 · PATCH /bookings/:id/cancel (Owner & Customer)**
  - **Description:** Set booking `status: "cancelled"`, set `cancelledBy`, store `cancellationReason`. Revert the associated `TimeSlot` back to `available` (delete the booked TimeSlot document). Validate: customer can only cancel own booking; cancellation must be ≥ 1 hour before `startTime` (configurable). Trigger cancellation email (async, non-blocking).
  - **Files to modify:** `backend/src/controllers/booking.controller.js`, `backend/src/services/booking.service.js`
  - **Depends On:** T-048, T-015

- [ ] **T-050 · GET /bookings/all (Super Admin)**
  - **Description:** Return paginated bookings across all businesses. Support filters: `?businessId=`, `?date=`, `?status=`. Include `businessName` in each result. Used in admin console.
  - **Files to modify:** `backend/src/controllers/booking.controller.js`
  - **Depends On:** T-046, T-015

- [ ] **T-051 · Frontend — Public Booking Page (`/b/:slug`)**
  - **Description:** Build the customer-facing booking page. Step 1: fetch and display business info + service list. Step 2: service selection renders staff options. Step 3: date picker loads available slots via `GET /slots/available`. Step 4: slot selection. Step 5: customer info form. Step 6: confirmation screen showing `bookingRef`. Use shadcn/ui `Card`, `Button`, `Select`, `Calendar`.
  - **Files to create:** `frontend/src/pages/BookingPage.jsx`, `frontend/src/components/booking/ServiceSelector.jsx`, `frontend/src/components/booking/StaffSelector.jsx`, `frontend/src/components/booking/SlotPicker.jsx`, `frontend/src/components/booking/CustomerForm.jsx`, `frontend/src/components/booking/BookingConfirmation.jsx`
  - **Depends On:** T-039, T-044, T-006

- [ ] **T-052 · Frontend — Handle 409 Slot Conflict on Booking Page**
  - **Description:** When `POST /bookings` returns 409, show a shadcn/ui `Toast` with "This slot was just taken." and automatically re-fetch available slots to show updated options. Pre-fill customer form fields so the user doesn't re-type their details.
  - **Files to modify:** `frontend/src/pages/BookingPage.jsx`, `frontend/src/components/booking/SlotPicker.jsx`
  - **Depends On:** T-051

- [ ] **T-053 · Frontend — Owner Bookings List Page**
  - **Description:** Build `/dashboard/bookings` with a table of all bookings (customer name, service, staff, date/time, status badge). Add filter controls for date and status. Clicking a row opens a detail panel or dialog showing all booking fields and a "Cancel Booking" button.
  - **Files to create:** `frontend/src/pages/dashboard/BookingsPage.jsx`, `frontend/src/components/bookings/BookingTable.jsx`, `frontend/src/components/bookings/BookingDetail.jsx`
  - **Depends On:** T-029, T-046, T-049

- [ ] **T-054 · Frontend — Customer My Bookings Page**
  - **Description:** Build `/my-bookings` page (accessible when customer is logged in): list of their bookings with status badges, service and business name, date/time. Each booking shows a "Cancel" button if status is `confirmed` and cancellation window is open.
  - **Files to create:** `frontend/src/pages/MyBookingsPage.jsx`, `frontend/src/components/bookings/CustomerBookingCard.jsx`
  - **Depends On:** T-047, T-049, T-018

---

## Phase 6 — Email Confirmation (nodemailer)

> Goal: Booking lifecycle emails are sent automatically and asynchronously. All email templates are clean, mobile-readable HTML.

---

- [ ] **T-055 · Configure nodemailer Transporter**
  - **Description:** Create an `emailTransporter` using nodemailer with SMTP settings loaded from env (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`). Export a `sendEmail({ to, subject, html })` utility that wraps `transporter.sendMail`. Log success/failure but never throw — email failures must not break booking creation.
  - **Files to create:** `backend/src/utils/email.js`, `backend/src/config/email.config.js`
  - **Depends On:** T-003

- [ ] **T-056 · Build Email Templates**
  - **Description:** Create HTML email template functions (plain JS template literals, no external library needed) for: (1) `bookingConfirmation({ customerName, serviceName, staffName, date, startTime, businessName, bookingRef })`, (2) `bookingCancellation({ customerName, serviceName, date, startTime, businessName })`, (3) `welcomeBusiness({ ownerName, businessName, dashboardUrl })`. Templates must be mobile-readable (single-column, inline styles).
  - **Files to create:** `backend/src/utils/emailTemplates.js`
  - **Depends On:** T-055

- [ ] **T-057 · Send Booking Confirmation Email**
  - **Description:** After successful booking creation in `booking.service.js`, fire-and-forget two `sendEmail` calls: one to `customerEmail` and one to the business owner's email (fetched via `business.ownerId → user.email`). Use the `bookingConfirmation` template. Update `booking.emailSentAt` asynchronously.
  - **Files to modify:** `backend/src/services/booking.service.js`
  - **Depends On:** T-044, T-055, T-056

- [ ] **T-058 · Send Booking Cancellation Email**
  - **Description:** After cancellation in `booking.service.js`, send `bookingCancellation` email to the customer. If `cancelledBy === "business"`, additionally send an apology email using a `lateCancellationApology` template. Non-blocking.
  - **Files to modify:** `backend/src/services/booking.service.js`, `backend/src/utils/emailTemplates.js`
  - **Depends On:** T-049, T-055, T-056

- [ ] **T-059 · Send Welcome Email on Business Registration**
  - **Description:** After a new Business Owner successfully registers (T-011), fire-and-forget a `welcomeBusiness` email. Include their public booking URL (`/b/:slug`) and link to dashboard.
  - **Files to modify:** `backend/src/services/auth.service.js`
  - **Depends On:** T-011, T-055, T-056

- [ ] **T-060 · 24-Hour Reminder Email (Scheduled Job)**
  - **Description:** Create a lightweight cron job using `node-cron` (install it) that runs daily at 8:00 AM IST. It queries all `confirmed` bookings where `date === tomorrow`. For each, send a `bookingReminder` email template to the customer. Log count of reminders sent.
  - **Files to create:** `backend/src/jobs/reminderJob.js`, `backend/src/utils/emailTemplates.js` (add reminder template)
  - **Depends On:** T-055, T-056, T-043

---

## Phase 7 — Analytics & Admin Dashboard API

> Goal: Business owners see revenue and booking metrics. Super Admin has a cross-tenant console with platform-wide stats.

---

- [ ] **T-061 · GET /analytics/summary (Owner)**
  - **Description:** `GET /api/analytics/summary?from=&to=` — Aggregate from `Booking` collection for `req.businessId` in date range: total bookings, total revenue (sum of `service.priceINR` for confirmed bookings), cancellation count, cancellation rate (%). Use MongoDB aggregation pipeline. Return as a flat JSON object.
  - **Files to create:** `backend/src/routes/analytics.routes.js`, `backend/src/controllers/analytics.controller.js`, `backend/src/services/analytics.service.js`
  - **Depends On:** T-043, T-015

- [ ] **T-062 · GET /analytics/peak-hours (Owner)**
  - **Description:** Aggregate confirmed bookings by hour of day for `req.businessId` in a date range. Return array of 24 objects `{ hour: 0-23, bookingCount }`. Used to render a bar chart on the owner dashboard.
  - **Files to modify:** `backend/src/controllers/analytics.controller.js`, `backend/src/services/analytics.service.js`
  - **Depends On:** T-061

- [ ] **T-063 · GET /analytics/all (Super Admin)**
  - **Description:** Platform-wide aggregation: total businesses, total bookings, bookings today, top 5 businesses by booking count, global cancellation rate. Returns a summary object. Requires `super_admin` role.
  - **Files to modify:** `backend/src/controllers/analytics.controller.js`
  - **Depends On:** T-061, T-015

- [ ] **T-064 · Frontend — Owner Dashboard Overview Page**
  - **Description:** Build `/dashboard` (overview) with: (1) stat cards for today's bookings, today's revenue, cancellations this week using `GET /analytics/summary`; (2) "Today's Schedule" table showing upcoming bookings for today; (3) a `recharts` bar chart of peak hours using `GET /analytics/peak-hours`. Use shadcn/ui `Card` and `Badge`.
  - **Files to create:** `frontend/src/pages/dashboard/OverviewPage.jsx`, `frontend/src/components/analytics/StatCard.jsx`, `frontend/src/components/analytics/PeakHoursChart.jsx`, `frontend/src/components/analytics/TodaySchedule.jsx`
  - **Depends On:** T-029, T-061, T-062

- [ ] **T-065 · Frontend — Super Admin Console**
  - **Description:** Build `/admin` route (role-guarded to `super_admin`): a table of all businesses with columns for name, category, city, status badge, booking count, registration date. Row actions: "View Bookings" (navigates to filtered bookings view), "Suspend" / "Reactivate" toggle. Top summary stats from `GET /analytics/all`.
  - **Files to create:** `frontend/src/pages/AdminPage.jsx`, `frontend/src/components/admin/BusinessTable.jsx`, `frontend/src/components/admin/PlatformStats.jsx`
  - **Depends On:** T-022, T-023, T-050, T-063, T-018

---

## Phase 8 — Frontend Polish & UX

> Goal: Public booking flow is smooth and mobile-friendly. Dashboard is fully wired. Error states and loading states are handled everywhere.

---

- [ ] **T-066 · App Router Setup**
  - **Description:** Configure `react-router-dom` v6 with all application routes: `/` (landing/home), `/login`, `/register`, `/b/:slug` (public booking), `/my-bookings`, `/dashboard/*` (owner), `/admin` (super admin). Apply `<ProtectedRoute>` and role guards where needed.
  - **Files to create/modify:** `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/routes/AppRouter.jsx`
  - **Depends On:** T-018, T-019

- [ ] **T-067 · Global Toast Notification System**
  - **Description:** Integrate shadcn/ui `Toaster` at the app root. Create a `useToast` hook usage pattern for all API error and success messages. Standardize: green toast for success, red for error, yellow for 409 conflict, blue for info.
  - **Files to modify:** `frontend/src/main.jsx`; create `frontend/src/hooks/useToast.js`
  - **Depends On:** T-006, T-066

- [ ] **T-068 · Loading Skeletons & Empty States**
  - **Description:** Add shadcn/ui `Skeleton` placeholders to: services list, staff list, slot picker, bookings table, dashboard stats. Add empty state illustrations (inline SVG or simple text+icon) for: "No services yet", "No bookings today", "No slots available on this date".
  - **Files to create:** `frontend/src/components/common/Skeleton.jsx`, `frontend/src/components/common/EmptyState.jsx`
  - **Depends On:** T-030, T-041, T-051, T-053

- [ ] **T-069 · Mobile Responsiveness Pass**
  - **Description:** Audit and fix all pages for mobile (375px viewport): collapse sidebar to a hamburger drawer on mobile, stack form fields vertically, ensure slot picker is thumb-friendly, ensure booking confirmation is readable. Test in browser devtools device mode.
  - **Files to modify:** All page and layout components in `frontend/src/`
  - **Depends On:** T-051, T-053, T-064

- [ ] **T-070 · Landing / Home Page**
  - **Description:** Build a simple `/` landing page that explains BookMySlot in 3 sections: hero ("Book appointments at your favourite local businesses"), features overview, and a CTA to register a business. Link to `/register` and include a demo business link.
  - **Files to create:** `frontend/src/pages/LandingPage.jsx`, `frontend/src/components/landing/Hero.jsx`, `frontend/src/components/landing/Features.jsx`
  - **Depends On:** T-066

- [ ] **T-071 · 404 and Error Pages**
  - **Description:** Build a `404 Not Found` page for unknown routes and a `BusinessNotFound` page shown when `/b/:slug` resolves to an inactive or nonexistent business. Both should link back to `/`.
  - **Files to create:** `frontend/src/pages/NotFoundPage.jsx`, `frontend/src/pages/BusinessNotFoundPage.jsx`
  - **Depends On:** T-066

---

## Phase 9 — Deployment

> Goal: Backend live on Render, frontend live on Vercel, database on MongoDB Atlas. Demo business pre-seeded. Both URLs publicly accessible.

---

- [ ] **T-072 · MongoDB Atlas Setup**
  - **Description:** Create a free-tier Atlas M0 cluster. Create a database user with read/write access. Whitelist `0.0.0.0/0` (all IPs) for Render compatibility. Copy the connection string into Render's env vars. Enable Atlas backups.
  - **Files to create/modify:** (Cloud config, no code files) — document connection string format in `backend/README.md`
  - **Depends On:** T-004

- [ ] **T-073 · Backend Deployment to Render**
  - **Description:** Create a Render Web Service pointing to the `backend/` directory. Set build command: `npm install`, start command: `node src/server.js`. Add all env vars from `.env.example` to Render's environment panel: `MONGODB_URI`, `JWT_SECRET`, `EMAIL_*`, `FRONTEND_URL`, `NODE_ENV=production`. Verify `/api/health` responds after deploy.
  - **Files to modify:** `backend/README.md`; create `backend/render.yaml` (optional)
  - **Depends On:** T-009, T-060

- [ ] **T-074 · Frontend Deployment to Vercel**
  - **Description:** Connect the `frontend/` directory to a new Vercel project. Set `VITE_API_BASE_URL` environment variable to the Render backend URL. Configure output directory as `dist`. Verify the landing page loads and `/api/health` call succeeds from the deployed frontend.
  - **Files to modify:** `frontend/README.md`; create `frontend/vercel.json` with SPA redirect rule `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`
  - **Depends On:** T-066, T-073

- [ ] **T-075 · Run Seed Script on Production DB**
  - **Description:** Run `npm run seed` with `MONGODB_URI` pointing to Atlas to create: Super Admin account (credentials in a secure note), one demo Business Owner, "Demo Salon" business with 3 services, 2 staff, and a handful of sample bookings. Verify via Atlas UI and the deployed frontend.
  - **Files to modify:** `backend/src/scripts/seed.js` (ensure idempotent — skip if already seeded)
  - **Depends On:** T-072, T-009

- [ ] **T-076 · End-to-End Smoke Test on Production**
  - **Description:** Manually execute the full booking flow on the deployed URLs: (1) visit demo business public page, (2) complete a booking, (3) verify confirmation email received, (4) login as owner, verify booking appears in dashboard, (5) cancel booking, verify cancellation email, (6) login as Super Admin, verify business appears in admin console.
  - **Files to create:** `SMOKE_TEST.md` documenting steps and expected results
  - **Depends On:** T-073, T-074, T-075

- [ ] **T-077 · Write README.md**
  - **Description:** Write a thorough project README covering: project description, live demo URLs, full local setup instructions (clone → env setup → seed → run both servers), architecture overview diagram (text/ASCII), environment variable reference table, and a "How slot conflict prevention works" section (link to PRD §8).
  - **Files to create:** `README.md` (project root)
  - **Depends On:** T-076

---

## Milestone Checklist

These mark meaningful checkpoints in the project. Each milestone should be git-tagged.

---

### 🏁 Milestone 1 — Multi-Tenant Auth is Working
> *Tag: `v0.1-auth`*

- [ ] Business Owner can register with business info and receive a JWT
- [ ] Customer can register and login separately
- [ ] `GET /api/auth/me` returns correct role + businessId for each user type
- [ ] Owner JWT cannot access another business's data (verified via Postman with two different owner tokens)
- [ ] Super Admin seed account can login and access `/api/businesses`

---

### 🏁 Milestone 2 — Business Configured & Bookable
> *Tag: `v0.2-business-ready`*

- [ ] Owner can create services and staff via API
- [ ] `GET /slots/available` returns correct time windows for a given service + staff + date
- [ ] Blocked slots are correctly excluded from available windows
- [ ] Public business page (`GET /businesses/:slug`) returns business info + services
- [ ] All responses follow the standard JSON envelope (`{ success, data }` or `{ success: false, error }`)

---

### 🏁 Milestone 3 — First Booking Created with Conflict Check
> *Tag: `v0.3-booking-core`*

- [ ] A customer can create a booking via `POST /bookings` successfully
- [ ] Booking confirmation email is received by both customer and owner email addresses
- [ ] A second concurrent request for the same slot returns HTTP 409 with a clear message
- [ ] The 409 is provably caused by the unique index (tested by sending two simultaneous Postman requests)
- [ ] Cancelled bookings revert the TimeSlot and send a cancellation email

---

### 🏁 Milestone 4 — Full Frontend Wired to Real APIs
> *Tag: `v0.4-frontend-complete`*

- [ ] Customer can complete an end-to-end booking at `/b/:slug` — no mock data used
- [ ] Owner dashboard shows live bookings, live stats, live slot calendar
- [ ] 409 conflict shows a toast and refreshes slots without losing form data
- [ ] All forms show validation errors from the backend
- [ ] Mobile layout tested and passes at 375px viewport width

---

### 🏁 Milestone 5 — Deployed & Demo-Ready
> *Tag: `v1.0-production`*

- [ ] Backend live on Render, frontend live on Vercel — both URLs publicly accessible
- [ ] Smoke test completed end-to-end on production URLs (T-076 checklist fully checked)
- [ ] Demo business pre-seeded and functional
- [ ] README.md complete with setup instructions and live demo links
- [ ] Super Admin console accessible and shows demo business + bookings

---

*End of TASKS.md — BookMySlot v1.0*

*Tip: When starting a new coding session, copy the current phase's unchecked tasks into your AI coding tool along with `PRD.md` as context. Work one task at a time. Mark `[x]` and commit before moving on.*