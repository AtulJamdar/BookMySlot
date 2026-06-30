# EXPLANATION — backend/

## Purpose

The backend is a **Node.js + Express.js REST API** that serves as the brain of
BookMySlot. It handles all business logic, database operations, authentication,
email notifications, and multi-tenant data isolation. Every action a user takes
on the frontend (booking an appointment, blocking a slot, viewing analytics) results
in an HTTP request to this server.

---

## How it works

The request lifecycle looks like this:

```
HTTP Request
     │
     ▼
server.js          ← Starts the server, connects to MongoDB
     │
     ▼
app.js             ← Registers global middleware (helmet, cors, json parser)
     │
     ▼
routes/            ← Matches the URL path + HTTP method, applies middleware
     │
     ▼
middleware/        ← authenticate, requireRole, requireBusinessScope (tenant guard)
     │
     ▼
controllers/       ← Reads req, calls the right service, sends res
     │
     ▼
services/          ← All business logic lives here (DB queries, conflict checks)
     │
     ▼
models/            ← Mongoose schemas — the shape of data in MongoDB
     │
     ▼
MongoDB Atlas      ← Where data is actually stored
```

Each layer has one job and one job only. This is the MVC (Model-View-Controller)
pattern adapted for an API — there's no "View" in the traditional sense because
the React frontend is the view.

---

## Key Decisions

### Why separate routes, controllers, and services?

This is the most important architectural decision in the project. Here's what
each layer is responsible for and why they must not bleed into each other:

**Routes** (`src/routes/`)
- Define which URL + HTTP method combinations exist
- Apply middleware (auth, rate limiting, input validation)
- Delegate immediately to a controller
- They should never contain any logic. A route file reads almost like a table of
  contents for the API.

```js
// routes/service.routes.js — thin, declarative, no logic
router.post('/', authenticate, requireBusinessScope, createServiceValidator, createService);
router.put('/:id', authenticate, requireBusinessScope, updateServiceValidator, updateService);
```

**Controllers** (`src/controllers/`)
- Receive `req` and `res` from Express
- Extract what the service needs from `req` (params, body, user)
- Call the appropriate service function
- Format and send the HTTP response
- They contain NO business logic — no DB queries, no if/else for business rules

```js
// controllers/service.controller.js — thin, just orchestration
export const createService = async (req, res) => {
  const service = await serviceService.createService(req.businessId, req.body);
  return successResponse(res, service, 201);
};
```

**Services** (`src/services/`)
- Contain all business logic
- Talk directly to Mongoose models
- Make decisions (does this slot conflict? is this name a duplicate?)
- Return plain data objects — they never touch `req` or `res`
- This makes them independently testable without needing to mock HTTP

```js
// services/service.service.js — where decisions are made
export const createService = async (businessId, data) => {
  const existing = await Service.findOne({ businessId, name: new RegExp(`^${data.name}$`, 'i') });
  if (existing) throw new AppError('DUPLICATE_NAME', 'A service with this name already exists.', 409);
  return await Service.create({ ...data, businessId });
};
```

**Why does this matter?**

Imagine your business logic lives in the controller. Now you want to:
- Write a unit test → you need to spin up Express
- Call the same logic from a cron job → you have to copy-paste
- Switch from Express to Fastify → rewrite everything

With a service layer, none of these are problems. Services are plain JavaScript
functions that take inputs and return outputs. They're easy to test, reuse, and reason about.

---

### Why `server.js` and `app.js` are separate

`server.js` does one thing: start the HTTP server.
`app.js` does one thing: configure the Express application.

```js
// server.js
import app from './app.js';
import { connectDB } from './config/db.js';

await connectDB();
app.listen(process.env.PORT, () => console.log('Server running'));
```

```js
// app.js
import express from 'express';
const app = express();
app.use(helmet());
app.use(cors(...));
// mount all routes
export default app;
```

The reason: when you write integration tests, you import `app` directly and use
`supertest` to make requests without actually starting a listening server. If
all the setup was in `server.js` you couldn't do this cleanly.

---

### Folder structure rationale

```
src/
├── config/       ← External connections and environment config (db, email)
├── models/       ← Data shape and database indexes
├── routes/       ← URL definitions and middleware application
├── controllers/  ← HTTP layer — reads req, sends res
├── services/     ← Business logic — all decisions made here
├── middleware/   ← Reusable Express middleware (auth, validation, errors)
├── utils/        ← Pure helper functions (email templates, slug generation)
├── jobs/         ← Scheduled background tasks (reminder emails)
└── scripts/      ← One-off scripts run manually (seed data)
```

`config/` is separate from `utils/` because config sets up connections to the outside
world (MongoDB, SMTP server). `utils/` contains pure functions that have no side effects.

`jobs/` is separate from `services/` because jobs are triggered by time, not by HTTP
requests. They use the same service functions internally.

`scripts/` contains things you run once from the command line (`npm run seed`), not
code that runs during normal app operation.

---

## What you should learn from this

1. **MVC is about separation of concerns.** Every file should have one reason to change.
   If changing a business rule requires editing a route file, your architecture is leaking.

2. **Thin controllers, fat services.** Controllers are glue. Services are where the
   interesting code lives. This is a widely-adopted convention in Node.js backends
   (also seen in NestJS, Django, Rails, Spring Boot).

3. **The request lifecycle is a pipeline.** Each middleware/layer either modifies
   the request, passes it on, or short-circuits with an error response. Understanding
   this pipeline is key to debugging any Express issue.

4. **`server.js` vs `app.js` separation** is a small thing that makes a big difference
   when you start writing tests. Form the habit early.