# BookMySlot — Project Folder & File Structure

**Version:** 1.0  
**Stack:** MERN · JWT · nodemailer · shadcn/ui · Tailwind CSS  
**Architecture:** Strict MVC (backend) · Feature-grouped components (frontend) · Multi-tenant middleware

> **How to use this file:** Before writing any code, create every file listed here as an empty placeholder with a one-line comment describing its purpose. This prevents import errors during development and gives AI coding tools a complete picture of the project graph.

---

## ASCII Folder Tree

```
bookmyslot/
├── PRD.md
├── TASKS.md
├── STRUCTURE.md
├── README.md
├── .gitignore
├── .env.example
│
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   │
│   └── src/
│       ├── server.js
│       ├── app.js
│       │
│       ├── config/
│       │   ├── db.js
│       │   ├── env.js
│       │   └── email.config.js
│       │
│       ├── models/
│       │   ├── User.js
│       │   ├── Business.js
│       │   ├── Service.js
│       │   ├── Staff.js
│       │   ├── TimeSlot.js
│       │   ├── Booking.js
│       │   └── AuditLog.js
│       │
│       ├── routes/
│       │   ├── index.js
│       │   ├── auth.routes.js
│       │   ├── business.routes.js
│       │   ├── service.routes.js
│       │   ├── staff.routes.js
│       │   ├── slot.routes.js
│       │   ├── booking.routes.js
│       │   └── analytics.routes.js
│       │
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── business.controller.js
│       │   ├── service.controller.js
│       │   ├── staff.controller.js
│       │   ├── slot.controller.js
│       │   ├── booking.controller.js
│       │   └── analytics.controller.js
│       │
│       ├── services/
│       │   ├── auth.service.js
│       │   ├── business.service.js
│       │   ├── service.service.js
│       │   ├── staff.service.js
│       │   ├── slot.service.js
│       │   ├── booking.service.js
│       │   └── analytics.service.js
│       │
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── rateLimiter.middleware.js
│       │   ├── validate.middleware.js
│       │   ├── errorHandler.middleware.js
│       │   └── tenant/
│       │       ├── tenantResolver.middleware.js
│       │       └── tenantGuard.middleware.js
│       │
│       ├── utils/
│       │   ├── constants.js
│       │   ├── response.js
│       │   ├── email.js
│       │   ├── emailTemplates.js
│       │   ├── generateRef.js
│       │   └── slugify.js
│       │
│       ├── jobs/
│       │   └── reminderJob.js
│       │
│       ├── scripts/
│       │   └── seed.js
│       │
│       └── docs/
│           └── api-overview.md
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── components.json
    ├── index.html
    ├── .env
    ├── .env.example
    ├── .gitignore
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── lib/
        │   ├── utils.js
        │   └── apiClient.js
        │
        ├── context/
        │   └── AuthContext.jsx
        │
        ├── services/
        │   ├── auth.service.js
        │   ├── business.service.js
        │   ├── service.service.js
        │   ├── staff.service.js
        │   ├── slot.service.js
        │   ├── booking.service.js
        │   └── analytics.service.js
        │
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── BookingPage.jsx
        │   ├── BookingConfirmationPage.jsx
        │   ├── MyBookingsPage.jsx
        │   ├── AdminPage.jsx
        │   ├── NotFoundPage.jsx
        │   ├── BusinessNotFoundPage.jsx
        │   └── dashboard/
        │       ├── OverviewPage.jsx
        │       ├── ServicesPage.jsx
        │       ├── StaffPage.jsx
        │       ├── SlotsPage.jsx
        │       └── BookingsPage.jsx
        │
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   │
        │   ├── ui/                         ← shadcn/ui generated components (do not hand-edit)
        │   │   ├── button.jsx
        │   │   ├── input.jsx
        │   │   ├── card.jsx
        │   │   ├── badge.jsx
        │   │   ├── dialog.jsx
        │   │   ├── form.jsx
        │   │   ├── label.jsx
        │   │   ├── select.jsx
        │   │   ├── toast.jsx
        │   │   ├── toaster.jsx
        │   │   ├── calendar.jsx
        │   │   ├── skeleton.jsx
        │   │   ├── table.jsx
        │   │   └── separator.jsx
        │   │
        │   ├── layout/
        │   │   ├── DashboardLayout.jsx
        │   │   ├── Sidebar.jsx
        │   │   ├── Topbar.jsx
        │   │   └── PublicLayout.jsx
        │   │
        │   ├── common/
        │   │   ├── Spinner.jsx
        │   │   ├── EmptyState.jsx
        │   │   ├── ErrorMessage.jsx
        │   │   └── PageSkeleton.jsx
        │   │
        │   ├── booking/
        │   │   ├── ServiceSelector.jsx
        │   │   ├── StaffSelector.jsx
        │   │   ├── SlotPicker.jsx
        │   │   ├── CustomerForm.jsx
        │   │   └── BookingConfirmation.jsx
        │   │
        │   ├── services/
        │   │   ├── ServiceTable.jsx
        │   │   └── ServiceForm.jsx
        │   │
        │   ├── staff/
        │   │   ├── StaffCard.jsx
        │   │   └── StaffForm.jsx
        │   │
        │   ├── slots/
        │   │   ├── SlotCalendar.jsx
        │   │   └── BlockSlotForm.jsx
        │   │
        │   ├── bookings/
        │   │   ├── BookingTable.jsx
        │   │   ├── BookingDetail.jsx
        │   │   └── CustomerBookingCard.jsx
        │   │
        │   ├── analytics/
        │   │   ├── StatCard.jsx
        │   │   ├── PeakHoursChart.jsx
        │   │   └── TodaySchedule.jsx
        │   │
        │   └── admin/
        │       ├── BusinessTable.jsx
        │       └── PlatformStats.jsx
        │
        └── routes/
            └── AppRouter.jsx
```

---

## File-by-File Purpose Reference

### Root Level

| File | Purpose |
|---|---|
| `PRD.md` | Product Requirements Document — source of truth for all features, data models, and business rules |
| `TASKS.md` | Development task tracker with 77 tasks across 9 phases, task IDs, dependencies, and milestone checklist |
| `STRUCTURE.md` | This file — complete folder tree and file purpose reference |
| `README.md` | Project overview, local setup instructions, env variable reference, live demo URLs, architecture summary |
| `.gitignore` | Root-level ignore rules — excludes `node_modules`, `.env`, `dist`, `.DS_Store`, `*.log` for both workspaces |
| `.env.example` | Template showing required root-level env vars (if any); primarily serves as documentation for the monorepo |

---

### Backend — Root

| File | Purpose |
|---|---|
| `backend/package.json` | Node.js project manifest — scripts (`start`, `dev`, `seed`), all dependencies and devDependencies |
| `backend/.env` | Local environment secrets — never committed to git |
| `backend/.env.example` | Template of all required env vars: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `EMAIL_*`, `FRONTEND_URL`, `NODE_ENV` |
| `backend/.gitignore` | Excludes `node_modules/`, `.env`, `*.log` from git |

---

### Backend — `src/`

| File | Purpose |
|---|---|
| `src/server.js` | Entry point — calls `connectDB()`, starts `app.listen()` on `process.env.PORT`, registers the cron job |
| `src/app.js` | Express app factory — registers `helmet`, `cors`, `express.json()`, mounts all route groups under `/api`, attaches global error handler |

---

### Backend — `src/config/`

| File | Purpose |
|---|---|
| `config/db.js` | Mongoose `connectDB()` — reads `MONGODB_URI`, connects with options, logs success/failure, exits process on error |
| `config/env.js` | Loads and validates `.env` via `dotenv`; exports a typed config object so the rest of the app never reads `process.env` directly |
| `config/email.config.js` | Creates and exports the nodemailer SMTP transporter instance using `EMAIL_*` env vars |

---

### Backend — `src/models/`

| File | Purpose |
|---|---|
| `models/User.js` | Mongoose schema for all users — fields: `name`, `email`, `passwordHash`, `role` (enum), `businessId`, `phone`; pre-save bcrypt hook |
| `models/Business.js` | Mongoose schema for tenant businesses — fields: `ownerId`, `name`, `slug` (unique indexed), `category`, `city`, `workingHours`, `bufferMinutes`, `isActive`; pre-save slug generator |
| `models/Service.js` | Mongoose schema for bookable services — fields: `businessId`, `name`, `description`, `durationMinutes`, `priceINR`, `isActive`; compound index on `{ businessId, isActive }` |
| `models/Staff.js` | Mongoose schema for staff members — fields: `businessId`, `name`, `title`, `serviceIds` (array ref), `workingHours` (per-staff override), `isActive` |
| `models/TimeSlot.js` | Mongoose schema for blocked/booked time windows — fields: `businessId`, `staffId`, `date`, `startTime`, `endTime`, `status`, `bookingId`, `reason`; **unique compound index** on `{ businessId, staffId, date, startTime }` (race-condition guard) |
| `models/Booking.js` | Mongoose schema for appointments — fields: `bookingRef`, `businessId`, `serviceId`, `staffId`, `customerId`, `customerName`, `customerEmail`, `customerPhone`, `date`, `startTime`, `endTime`, `status`, `cancelledBy`, `emailSentAt`; all required compound indexes |
| `models/AuditLog.js` | Mongoose schema for Super Admin actions — fields: `actorId`, `action`, `targetType`, `targetId`, `metadata`, `createdAt`; used when businesses are suspended/deleted |

---

### Backend — `src/routes/`

| File | Purpose |
|---|---|
| `routes/index.js` | Central router — mounts all sub-routers: `/auth`, `/businesses`, `/services`, `/staff`, `/slots`, `/bookings`, `/analytics`; also mounts `GET /health` |
| `routes/auth.routes.js` | Auth routes — `POST /register`, `POST /register/customer`, `POST /login`, `GET /me`; applies rate limiter to register and login |
| `routes/business.routes.js` | Business routes — `GET /:slug` (public), `PUT /:id` (owner), `GET /` (admin), `PATCH /:id/suspend` (admin) |
| `routes/service.routes.js` | Service routes — `GET /` (public), `POST /` (owner), `PUT /:id` (owner), `DELETE /:id` (owner) |
| `routes/staff.routes.js` | Staff routes — `GET /` (public), `POST /` (owner), `PUT /:id` (owner), `DELETE /:id` (owner) |
| `routes/slot.routes.js` | Slot routes — `GET /available` (public), `POST /block` (owner), `DELETE /:id/unblock` (owner), `GET /` (owner — list blocked) |
| `routes/booking.routes.js` | Booking routes — `POST /` (public/customer), `GET /` (owner), `GET /my` (customer), `GET /all` (admin), `GET /:id`, `PATCH /:id/cancel` |
| `routes/analytics.routes.js` | Analytics routes — `GET /summary` (owner), `GET /peak-hours` (owner), `GET /all` (admin) |

---

### Backend — `src/controllers/`

> Controllers receive `req`/`res`, call the appropriate service function, and return the HTTP response. No business logic lives here.

| File | Purpose |
|---|---|
| `controllers/auth.controller.js` | Handles registration (owner + customer), login, and `GET /me` — calls `auth.service.js`, returns JWT and user object |
| `controllers/business.controller.js` | Handles public slug lookup, owner profile update, admin list/suspend — calls `business.service.js` |
| `controllers/service.controller.js` | Handles service CRUD — public list, owner create/update/soft-delete — calls `service.service.js` |
| `controllers/staff.controller.js` | Handles staff CRUD — public list, owner create/update/soft-delete — calls `staff.service.js` |
| `controllers/slot.controller.js` | Handles availability query, slot blocking/unblocking, blocked slot listing — calls `slot.service.js` |
| `controllers/booking.controller.js` | Handles booking creation, owner/customer listing, single fetch, and cancellation — calls `booking.service.js` |
| `controllers/analytics.controller.js` | Handles owner summary, peak-hours aggregation, and admin platform stats — calls `analytics.service.js` |

---

### Backend — `src/services/`

> Services contain all business logic, DB queries, and cross-model orchestration. Controllers are thin wrappers around these.

| File | Purpose |
|---|---|
| `services/auth.service.js` | `registerOwner()`, `registerCustomer()`, `login()`, `getMe()` — handles bcrypt comparison, JWT signing, business + user co-creation in a Mongoose transaction, triggers welcome email |
| `services/business.service.js` | `getBySlug()`, `updateBusiness()`, `listAll()`, `suspendBusiness()` — slug uniqueness check, AuditLog write on suspend |
| `services/service.service.js` | `listActiveServices()`, `createService()`, `updateService()`, `softDeleteService()` — tenant guard on all mutations, duplicate name check |
| `services/staff.service.js` | `listActiveStaff()`, `createStaff()`, `updateStaff()`, `softDeleteStaff()` — validates serviceIds belong to same business |
| `services/slot.service.js` | `getAvailableSlots()` (core availability algorithm), `blockSlot()`, `unblockSlot()`, `listBlockedSlots()` — slot window computation: working hours → step by duration → subtract conflicts |
| `services/booking.service.js` | `createBooking()` (3-phase conflict guard + atomic transaction), `listBusinessBookings()`, `listMyBookings()`, `getBookingById()`, `cancelBooking()` — triggers confirmation and cancellation emails |
| `services/analytics.service.js` | `getSummary()`, `getPeakHours()`, `getPlatformStats()` — MongoDB aggregation pipelines for revenue, booking counts, cancellation rates, top businesses |

---

### Backend — `src/middleware/`

| File | Purpose |
|---|---|
| `middleware/auth.middleware.js` | Three exports: `authenticate` (verifies JWT, attaches `req.user`), `requireRole(...roles)` (role-based access guard, returns 403), `requireBusinessScope` (injects `req.businessId`, returns 403 if null) |
| `middleware/rateLimiter.middleware.js` | Two `express-rate-limit` instances: `authLimiter` (10 req/15 min for auth routes) and `globalLimiter` (applied app-wide) |
| `middleware/validate.middleware.js` | Wraps `express-validator`'s `validationResult` — collects errors and returns a 400 with structured field-level messages; imported after validator chains in route files |
| `middleware/errorHandler.middleware.js` | Global Express error handler (4-arg middleware) — catches all unhandled errors, formats them into the standard `{ success: false, error: { code, message, statusCode } }` envelope, logs stack in development only |

#### Backend — `src/middleware/tenant/`

| File | Purpose |
|---|---|
| `tenant/tenantResolver.middleware.js` | For public routes that identify a business by slug or query param — resolves the `businessId` from the slug and attaches `req.resolvedBusinessId`; used on the public booking and services endpoints |
| `tenant/tenantGuard.middleware.js` | Validates that a resource being read or mutated belongs to the authenticated owner's `businessId` — compares `req.businessId` against the resource's `businessId` field; throws 403 on mismatch |

---

### Backend — `src/utils/`

| File | Purpose |
|---|---|
| `utils/constants.js` | Shared enums as frozen objects: `ROLES`, `BOOKING_STATUS` (`confirmed`, `cancelled`, `completed`), `SLOT_STATUS` (`blocked`, `booked`), `BUSINESS_CATEGORIES`, `ERROR_CODES` |
| `utils/response.js` | Two helper functions: `successResponse(res, data, statusCode)` and `errorResponse(res, code, message, statusCode)` — enforce consistent JSON envelopes across all controllers |
| `utils/email.js` | `sendEmail({ to, subject, html })` — wraps `transporter.sendMail`, catches and logs errors silently (never throws), updates `emailSentAt` if `bookingId` is provided |
| `utils/emailTemplates.js` | Pure functions returning HTML strings: `bookingConfirmation()`, `bookingCancellation()`, `lateCancellationApology()`, `welcomeBusiness()`, `bookingReminder()` — single-column inline-styled templates |
| `utils/generateRef.js` | `generateBookingRef()` — generates a unique `BMS-XXXXX` reference ID, queries the DB to ensure no collision, retries on conflict |
| `utils/slugify.js` | `slugify(name)` — converts a business name to a URL-safe lowercase hyphenated slug (e.g., "Sunshine Salon" → "sunshine-salon"); used in Business model pre-save hook and during name updates |

---

### Backend — `src/jobs/`

| File | Purpose |
|---|---|
| `jobs/reminderJob.js` | `node-cron` job scheduled at 8:00 AM IST daily — queries all `confirmed` bookings with `date === tomorrow`, sends `bookingReminder` email to each customer, logs count of emails dispatched |

---

### Backend — `src/scripts/`

| File | Purpose |
|---|---|
| `scripts/seed.js` | Idempotent seed script — drops and recreates: Super Admin account (from env), one Business Owner, "Demo Salon" business with slug `demo-salon`, 3 services, 2 staff, 5 sample bookings across past and future dates; runnable via `npm run seed` |

---

### Backend — `src/docs/`

| File | Purpose |
|---|---|
| `docs/api-overview.md` | Human-readable API reference — all resources, HTTP methods, auth requirements, and example request/response shapes; maintained manually alongside route changes |

---

### Frontend — Root

| File | Purpose |
|---|---|
| `frontend/package.json` | Vite + React project manifest — scripts (`dev`, `build`, `preview`), dependencies including `axios`, `react-router-dom`, `recharts`, `tailwindcss`, shadcn peer deps |
| `frontend/vite.config.js` | Vite config — React plugin, resolve aliases (`@` → `src/`), proxy for local dev API calls to `localhost:5000` |
| `frontend/tailwind.config.js` | Tailwind config — content paths including `./src/**/*.{js,jsx}`, shadcn CSS variable theme extension |
| `frontend/postcss.config.js` | PostCSS config — Tailwind CSS and Autoprefixer plugins |
| `frontend/components.json` | shadcn/ui config — style (`default`), RSC disabled, Tailwind config path, component aliases (`@/components`, `@/lib`) |
| `frontend/index.html` | Vite HTML entry point — mounts `<div id="root">`, loads `src/main.jsx` |
| `frontend/.env` | Local frontend env — `VITE_API_BASE_URL=http://localhost:5000/api`; never committed |
| `frontend/.env.example` | Template: `VITE_API_BASE_URL=` — documents required frontend env var |
| `frontend/.gitignore` | Excludes `node_modules/`, `dist/`, `.env` |

---

### Frontend — `src/`

| File | Purpose |
|---|---|
| `src/main.jsx` | React entry point — renders `<App>` inside `<BrowserRouter>` and `<AuthContext>`, mounts shadcn/ui `<Toaster>` at the root |
| `src/App.jsx` | Thin root component — renders `<AppRouter>` only; no layout logic here |
| `src/index.css` | Global CSS — Tailwind `@base`, `@components`, `@utilities` directives; shadcn CSS variable declarations for light/dark theme |

---

### Frontend — `src/lib/`

| File | Purpose |
|---|---|
| `lib/utils.js` | shadcn/ui required utility — exports the `cn()` helper (merges Tailwind class strings using `clsx` + `tailwind-merge`) |
| `lib/apiClient.js` | Axios instance configured with `baseURL` from `VITE_API_BASE_URL`; request interceptor attaches `Authorization: Bearer <token>` from localStorage; response interceptor catches 401 and redirects to `/login` |

---

### Frontend — `src/context/`

| File | Purpose |
|---|---|
| `context/AuthContext.jsx` | React Context providing `{ user, token, login(), logout(), register() }` — persists token to localStorage, exposes `isAuthenticated` and `role` booleans for route guards |

---

### Frontend — `src/services/`

> Each file is a thin collection of named axios functions. Components call these directly (no custom hooks layer).

| File | Purpose |
|---|---|
| `services/auth.service.js` | `loginUser()`, `registerOwner()`, `registerCustomer()`, `getMe()` — axios calls to `/api/auth/*` |
| `services/business.service.js` | `getBusinessBySlug()`, `updateBusiness()`, `getAllBusinesses()`, `suspendBusiness()` — axios calls to `/api/businesses/*` |
| `services/service.service.js` | `getServices()`, `createService()`, `updateService()`, `deleteService()` — axios calls to `/api/services/*` |
| `services/staff.service.js` | `getStaff()`, `createStaff()`, `updateStaff()`, `deleteStaff()` — axios calls to `/api/staff/*` |
| `services/slot.service.js` | `getAvailableSlots()`, `blockSlot()`, `unblockSlot()`, `getBlockedSlots()` — axios calls to `/api/slots/*` |
| `services/booking.service.js` | `createBooking()`, `getBusinessBookings()`, `getMyBookings()`, `getBookingById()`, `cancelBooking()`, `getAllBookings()` — axios calls to `/api/bookings/*` |
| `services/analytics.service.js` | `getSummary()`, `getPeakHours()`, `getPlatformStats()` — axios calls to `/api/analytics/*` |

---

### Frontend — `src/routes/`

| File | Purpose |
|---|---|
| `routes/AppRouter.jsx` | `react-router-dom` v6 route definitions — all paths: `/`, `/login`, `/register`, `/b/:slug`, `/booking-confirmation`, `/my-bookings`, `/dashboard/*`, `/admin`, `*` (404); applies `<ProtectedRoute>` and role guards |

---

### Frontend — `src/pages/`

| File | Purpose |
|---|---|
| `pages/LandingPage.jsx` | Public home page — hero section, feature highlights, CTAs to register a business or view demo |
| `pages/LoginPage.jsx` | Business owner and customer login form — email + password, uses shadcn/ui `Card`, `Form`, `Input`, `Button`; redirects to dashboard or home on success |
| `pages/RegisterPage.jsx` | Business owner registration form — owner info + business info in a multi-section form; redirects to dashboard on success |
| `pages/BookingPage.jsx` | **Public customer booking flow** at `/b/:slug` — multi-step wizard: service → staff → date → slot → customer info → confirm; handles 409 conflict gracefully |
| `pages/BookingConfirmationPage.jsx` | **Customer booking confirmation** shown after successful booking — displays `bookingRef`, service details, date/time, business contact; link to "View My Bookings" |
| `pages/MyBookingsPage.jsx` | Authenticated customer page listing all their bookings — status badges, cancel button with confirmation dialog |
| `pages/AdminPage.jsx` | Super Admin console at `/admin` — platform stats header, full business table with suspend/reactivate actions |
| `pages/NotFoundPage.jsx` | 404 catch-all page — friendly message, link back to home |
| `pages/BusinessNotFoundPage.jsx` | Shown when `/b/:slug` resolves to a nonexistent or suspended business — suggests contacting the business directly |

#### Frontend — `src/pages/dashboard/`

| File | Purpose |
|---|---|
| `dashboard/OverviewPage.jsx` | **Owner dashboard home** at `/dashboard` — stat cards (bookings today, revenue today, cancellations), today's schedule table, peak hours bar chart |
| `dashboard/ServicesPage.jsx` | Services management at `/dashboard/services` — table of all services, "New Service" dialog, inline edit and soft-delete per row |
| `dashboard/StaffPage.jsx` | Staff management at `/dashboard/staff` — staff cards with assigned services, "Add Staff" dialog with working hours picker |
| `dashboard/SlotsPage.jsx` | Slot management at `/dashboard/slots` — weekly calendar showing blocked (red) and booked (green) slots, "Block Time" dialog |
| `dashboard/BookingsPage.jsx` | Bookings list at `/dashboard/bookings` — filterable table by date and status, booking detail panel/dialog with cancel action |

---

### Frontend — `src/components/`

#### `components/` (root)

| File | Purpose |
|---|---|
| `ProtectedRoute.jsx` | Route wrapper — reads `AuthContext`, redirects to `/login` if unauthenticated; accepts optional `role` prop to enforce role-based access (redirects to home if role mismatches) |

---

#### `components/ui/` — shadcn/ui Generated (do not hand-edit)

| File | Purpose |
|---|---|
| `ui/button.jsx` | shadcn/ui Button — variants: `default`, `destructive`, `outline`, `ghost`, `link` |
| `ui/input.jsx` | shadcn/ui Input — styled text input with Tailwind focus ring |
| `ui/card.jsx` | shadcn/ui Card — exports `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` |
| `ui/badge.jsx` | shadcn/ui Badge — status indicators: `default`, `secondary`, `destructive`, `outline` |
| `ui/dialog.jsx` | shadcn/ui Dialog — modal overlay; exports `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle` |
| `ui/form.jsx` | shadcn/ui Form — React Hook Form integration; exports `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` |
| `ui/label.jsx` | shadcn/ui Label — accessible form label with `htmlFor` binding |
| `ui/select.jsx` | shadcn/ui Select — exports `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` |
| `ui/toast.jsx` | shadcn/ui Toast — individual toast component |
| `ui/toaster.jsx` | shadcn/ui Toaster — global toast renderer; mounted in `main.jsx` |
| `ui/calendar.jsx` | shadcn/ui Calendar — date picker built on `react-day-picker`; used in booking flow and slot blocking |
| `ui/skeleton.jsx` | shadcn/ui Skeleton — animated loading placeholder rectangle |
| `ui/table.jsx` | shadcn/ui Table — exports `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |
| `ui/separator.jsx` | shadcn/ui Separator — horizontal or vertical divider line |

---

#### `components/layout/`

| File | Purpose |
|---|---|
| `layout/DashboardLayout.jsx` | Authenticated layout wrapper — renders `<Sidebar>` and `<Topbar>` around `<Outlet>`; collapses sidebar to drawer on mobile |
| `layout/Sidebar.jsx` | Dashboard navigation sidebar — links to Overview, Services, Staff, Slots, Bookings; highlights active route |
| `layout/Topbar.jsx` | Dashboard top bar — shows business name from `AuthContext`, logout button, and mobile hamburger toggle |
| `layout/PublicLayout.jsx` | Minimal layout for public-facing pages (landing, booking, login) — simple header with logo and nav links |

---

#### `components/common/`

| File | Purpose |
|---|---|
| `common/Spinner.jsx` | Centered loading spinner — used during async data fetches |
| `common/EmptyState.jsx` | Empty state illustration + message — accepts `title`, `description`, optional `action` button; used in tables and lists with no data |
| `common/ErrorMessage.jsx` | Inline error display — renders a red alert box with an error message string; used for API error feedback |
| `common/PageSkeleton.jsx` | Full-page skeleton for initial page load — reusable pattern of `<Skeleton>` blocks matching the page's rough layout |

---

#### `components/booking/`

| File | Purpose |
|---|---|
| `booking/ServiceSelector.jsx` | Step 1 of booking wizard — renders service cards with name, duration, price; highlights selection; calls `getServices()` on mount |
| `booking/StaffSelector.jsx` | Step 2 of booking wizard — renders staff cards filtered by selected service; includes "Any Available" option |
| `booking/SlotPicker.jsx` | Step 3 of booking wizard — date picker + available slot grid; calls `getAvailableSlots()` on date change; handles re-fetch on 409 conflict |
| `booking/CustomerForm.jsx` | Step 4 of booking wizard — name, email, phone inputs with validation; optional account creation checkbox |
| `booking/BookingConfirmation.jsx` | Step 5 (inline) — success state inside the booking wizard showing ref ID, summary, and a "View My Bookings" link before redirect |

---

#### `components/services/`

| File | Purpose |
|---|---|
| `services/ServiceTable.jsx` | Table of business services — columns: name, duration, price, status badge; row actions: edit (opens dialog), soft-delete (with confirm) |
| `services/ServiceForm.jsx` | Form inside a Dialog for creating or editing a service — fields: name, description, duration select, price; validates on submit |

---

#### `components/staff/`

| File | Purpose |
|---|---|
| `staff/StaffCard.jsx` | Card displaying one staff member — name, title, assigned service badges, active/inactive toggle |
| `staff/StaffForm.jsx` | Form inside a Dialog for adding or editing a staff member — name, title, service multi-select, per-day working hours toggles |

---

#### `components/slots/`

| File | Purpose |
|---|---|
| `slots/SlotCalendar.jsx` | Weekly calendar grid — renders each day with colour-coded slot indicators (red = blocked, green = booked); navigable by week |
| `slots/BlockSlotForm.jsx` | Form inside a Dialog for blocking a time slot — staff selector, date picker, start time, end time, optional reason field |

---

#### `components/bookings/`

| File | Purpose |
|---|---|
| `bookings/BookingTable.jsx` | Owner-facing table of bookings — columns: ref, customer name, service, staff, date/time, status badge; row click opens `<BookingDetail>` |
| `bookings/BookingDetail.jsx` | Dialog or side panel showing full booking info — all fields plus a "Cancel Booking" button with reason input |
| `bookings/CustomerBookingCard.jsx` | Card for a single customer booking on "My Bookings" page — business name, service, date/time, status badge, cancel button if eligible |

---

#### `components/analytics/`

| File | Purpose |
|---|---|
| `analytics/StatCard.jsx` | Single metric card — accepts `label`, `value`, `icon`, optional `trend`; used in dashboard overview |
| `analytics/PeakHoursChart.jsx` | `recharts` bar chart of bookings by hour of day — X-axis: 0–23 hours, Y-axis: booking count; data from `GET /analytics/peak-hours` |
| `analytics/TodaySchedule.jsx` | Compact table of today's confirmed bookings sorted by time — columns: time, customer, service, staff; linked from dashboard overview |

---

#### `components/admin/`

| File | Purpose |
|---|---|
| `admin/BusinessTable.jsx` | Super Admin table of all businesses — columns: name, category, city, status, booking count, joined date; row actions: suspend/reactivate toggle, view bookings |
| `admin/PlatformStats.jsx` | Platform-wide summary card row — total businesses, total bookings, bookings today, global cancellation rate; data from `GET /analytics/all` |

---

## Key Architectural Decisions Summarised

| Decision | Detail |
|---|---|
| **MVC strict separation** | Routes define paths and apply middleware only. Controllers handle req/res only. Services own all logic and DB calls. |
| **Tenant isolation layer** | Two dedicated middleware files in `middleware/tenant/` — one resolves businessId from slug (public routes), one guards mutations (owner routes). Neither lives in `auth.middleware.js`. |
| **No custom hooks** | Frontend API calls are made directly from components using named functions in `src/services/`. This keeps the dependency graph flat and easy to trace for AI coding tools. |
| **shadcn/ui isolation** | All generated shadcn components live exclusively in `components/ui/`. Custom components never live here, preventing accidental overwrite on `npx shadcn add`. |
| **Atomic booking** | The unique compound index on `TimeSlot` is the final race-condition guard — its existence is structural, not just a code pattern, which is why it is documented in the model file description above. |
| **Email never blocks** | `sendEmail()` is always called with fire-and-forget (`email.js` catches internally). Booking creation returns 201 immediately regardless of email status. |
| **Seed is idempotent** | `seed.js` checks for existing records before inserting — safe to run multiple times in development without duplicating data. |

---

*End of STRUCTURE.md — BookMySlot v1.0*

*Next step: create every file listed above as an empty placeholder, then begin Phase 1 tasks from TASKS.md.*