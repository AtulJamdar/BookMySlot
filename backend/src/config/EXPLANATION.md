# EXPLANATION — backend/src/config/

## Purpose

The `config/` folder handles **connections to the outside world** and **environment
configuration**. Before the app can serve a single request, it needs a database
connection, a way to send emails, and access to secrets like `JWT_SECRET`. All of
that setup lives here — not scattered across random files.

Files in this folder:
- `db.js` — connects to MongoDB Atlas via Mongoose
- `env.js` — loads `.env` and exports a typed config object
- `email.config.js` — creates the nodemailer SMTP transporter

---

## How it works

### `db.js` — MongoDB Connection

```js
// src/config/db.js
import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // ← Critical: kill the process if DB is unreachable
  }
};
```

**Why `process.exit(1)` on failure?**

If the database is unreachable, the app cannot serve any requests meaningfully.
Letting it start anyway would mean:
- Users get confusing errors instead of a clean "service unavailable"
- Render/Heroku's health checks fail and trigger a restart (which is what you want)
- You catch the problem in logs immediately instead of hours later

`process.exit(1)` signals to the operating system that the process ended with an
error (exit code 1). Exit code 0 means success. Deployment platforms use this to
detect crashes and restart automatically.

**Why Mongoose over the raw MongoDB driver?**

Mongoose sits on top of the official MongoDB Node.js driver and adds:
- Schema validation (enforce that `durationMinutes` is a number before writing)
- Middleware hooks (run bcrypt before saving a user)
- Populate (join-like queries across collections)
- Indexes defined in code alongside the schema

The raw driver gives you more control but zero structure. For an app with multiple
developers and data models, Mongoose's conventions save significant debugging time.

---

### `env.js` — Environment Variable Management

```js
// src/config/env.js
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Fail fast if critical variables are missing
const required = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
for (const key of required) {
  if (!config[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
```

**Why export a `config` object instead of reading `process.env` directly?**

Three reasons:

1. **Single source of truth.** If `MONGODB_URI` is renamed to `DATABASE_URL`, you
   change it in one place (`env.js`), not in 12 files.

2. **Type safety.** `process.env` always returns strings. In `env.js`, you can convert
   `EMAIL_PORT` to a number with `parseInt()` once, and every file that imports it
   gets the correct type.

3. **Fail fast.** The validation loop at the bottom crashes the app at startup if a
   required variable is missing. This is infinitely better than getting a cryptic
   `Cannot read properties of undefined` error at 2am when the email system tries
   to connect.

---

### What is a `.env` file?

A `.env` file stores **environment-specific secrets** that should never be committed
to git. It's a plain text file with one key=value pair per line:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bookmyslot
JWT_SECRET=a-very-long-random-string-here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

`dotenv` reads this file and loads each key into `process.env`. In production
(on Render), you set these values in the dashboard — the `.env` file is only for
local development.

**Why not commit `.env` to git?**

Because `JWT_SECRET` and `EMAIL_PASS` are sensitive credentials. If they're in git:
- Anyone with access to the repository can read them
- If the repository is public, credentials are exposed to the entire internet
- Rotating credentials requires a git history rewrite

Instead, you commit `.env.example` — a template with placeholder values that
documents which variables are needed, without revealing the actual secrets.

---

### `email.config.js` — nodemailer Transporter

```js
// src/config/email.config.js
import nodemailer from 'nodemailer';
import { config } from './env.js';

export const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_PORT === 465, // true for SSL, false for TLS/STARTTLS
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});
```

The transporter is created once and exported. Every call to `sendEmail()` in
`utils/email.js` reuses this single transporter instance — it maintains a
connection pool to the SMTP server instead of opening a new connection per email.

---

## Key Decisions

### Why is config a separate folder, not inline in `app.js`?

`app.js` should configure Express. `config/` should configure external connections.
If you mix them, `app.js` becomes 200 lines of unrelated setup code that's hard
to read and impossible to unit test in isolation.

### Why call `connectDB()` in `server.js`, not `app.js`?

`app.js` exports an Express app object. If `connectDB()` was called there,
importing `app` in a test file would attempt a real MongoDB connection on every
test run. Keeping the DB connection in `server.js` means tests can import `app`
cleanly and inject a test database if needed.

### Fail fast vs. graceful degradation

BookMySlot is a booking system. If the database is down, it cannot function at all.
There's no "read from cache" fallback. So failing immediately at startup is the
right call — it's clear, honest, and causes the deployment platform to restart
the service (which may fix a transient connection issue).

For a different kind of app (a content site where you could serve cached pages),
you might make a different choice.

---

## What you should learn from this

1. **Never read `process.env` directly in business logic files.** Always go through
   a config module. This makes your code easier to test and easier to refactor.

2. **Fail fast on missing configuration.** A crash at startup with a clear message
   is a thousand times better than a runtime error 20 minutes later.

3. **`process.exit(1)` is the right response to an unrecoverable startup error.**
   This is standard practice in Node.js backends — not an antipattern.

4. **The `.env` / `.env.example` pattern** is a professional standard. If you
   look at any open-source Node.js project, you'll find it. Learn it and use it
   from day one.    