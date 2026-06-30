# EXPLANATION — backend/src/middleware/

## Purpose

Middleware is the **pipeline** every HTTP request passes through before it reaches
a controller. Think of it like airport security — your bag goes through multiple
checkpoints (metal detector, X-ray, ID check) before you're allowed to board the
plane. Each checkpoint either lets you through or stops you with a clear reason.

In BookMySlot, the middleware folder handles four concerns:
- `auth.middleware.js` — Is this user who they claim to be? What role do they have?
- `rateLimiter.middleware.js` — Is this IP sending too many requests?
- `validate.middleware.js` — Is the request body shaped correctly?
- `errorHandler.middleware.js` — Something went wrong deep in the app; format the error response.
- `tenant/tenantResolver.middleware.js` — Which business does this public request belong to?
- `tenant/tenantGuard.middleware.js` — Does the authenticated owner own this resource?

---

## How it works

### The Express Middleware Chain

In Express, every middleware function has the same signature:

```js
(req, res, next) => { ... }
```

The `next` function is the key. Calling `next()` passes control to the next
middleware in the chain. Calling `next(error)` skips all remaining middleware
and jumps straight to the error handler. Not calling `next()` at all means the
request is stuck — the client waits forever.

A route definition like this:

```js
router.post('/services', authenticate, requireRole('business_owner'), requireBusinessScope, createService);
```

...runs four functions in sequence. If any of the first three call `next(error)`,
`createService` is never called.

---

### `auth.middleware.js` — JWT Authentication & Role Guard

This file exports three functions that are used together in route definitions.

#### `authenticate`

```js
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('UNAUTHORIZED', 'No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    // decoded = { userId, role, businessId, iat, exp }

    req.user = await User.findById(decoded.userId).select('-passwordHash');
    if (!req.user) return next(new AppError('UNAUTHORIZED', 'User no longer exists.', 401));

    next();
  } catch (err) {
    next(new AppError('UNAUTHORIZED', 'Token is invalid or expired.', 401));
  }
};
```

**What it does step by step:**

1. Reads the `Authorization: Bearer <token>` header
2. Strips the `Bearer ` prefix to get the raw token string
3. Calls `jwt.verify()` — this checks the signature AND the expiry
4. Looks up the user in MongoDB to confirm they still exist (accounts could be deleted)
5. Attaches the user object to `req.user` so downstream middleware and controllers can read it
6. Calls `next()` to continue the chain

**Why attach to `req.user` and not pass it as a function argument?**

Express middleware runs sequentially and the only thing each function shares is the
`req` and `res` objects. Attaching data to `req` is the idiomatic way to pass
information down the chain. It's the same pattern used by Passport.js and every
major Express authentication library.

#### `requireRole(...roles)`

```js
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('FORBIDDEN', 'You do not have permission to access this resource.', 403));
  }
  next();
};
```

This is a **middleware factory** — a function that returns a middleware function.
The outer function captures `roles` in a closure; the inner function uses them.

Usage:
```js
router.get('/businesses', authenticate, requireRole('super_admin'), listAllBusinesses);
router.post('/services', authenticate, requireRole('business_owner'), createService);
```

The difference between 401 and 403 is important:
- **401 Unauthorized** = We don't know who you are (missing or bad token)
- **403 Forbidden** = We know who you are, but you're not allowed here

#### `requireBusinessScope`

```js
export const requireBusinessScope = (req, res, next) => {
  if (!req.user.businessId) {
    return next(new AppError('FORBIDDEN', 'No business associated with this account.', 403));
  }
  req.businessId = req.user.businessId;
  next();
};
```

This middleware serves a subtle but critical purpose: it injects `req.businessId`
from the JWT so controllers and services never have to worry about "which business
is this request for?" — it's always automatically set to the authenticated owner's
business. This is the core of the tenant isolation guarantee.

---

### `tenant/tenantResolver.middleware.js` — Multi-Tenancy for Public Routes

For routes that require no login (like `GET /businesses/:slug` or
`GET /businesses/:businessId/services`), there's no JWT to extract `businessId` from.
But the server still needs to know which business the request targets.

```js
export const tenantResolver = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const business = await Business.findOne({ slug, isActive: true }).lean();

    if (!business) {
      return next(new AppError('NOT_FOUND', 'Business not found or unavailable.', 404));
    }

    req.resolvedBusinessId = business._id;
    req.resolvedBusiness = business;
    next();
  } catch (err) {
    next(err);
  }
};
```

Used on the public booking page route:

```js
router.get('/businesses/:slug', tenantResolver, getBusinessBySlug);
router.get('/businesses/:businessId/services', tenantResolverById, listServices);
```

**Why `.lean()`?**

`.lean()` tells Mongoose to return a plain JavaScript object instead of a full
Mongoose Document. Plain objects are faster (no Mongoose overhead) and use less
memory. Use `.lean()` whenever you only need to read data, not save it back.

---

### `tenant/tenantGuard.middleware.js` — Ownership Verification

When an owner tries to update a service, the server must confirm that service
actually belongs to their business. This check cannot live in the controller
(that would repeat code across dozens of routes) or the model (models don't
know about the current request).

```js
export const tenantGuard = (Model) => async (req, res, next) => {
  try {
    const resource = await Model.findById(req.params.id);

    if (!resource) {
      return next(new AppError('NOT_FOUND', 'Resource not found.', 404));
    }

    if (resource.businessId.toString() !== req.businessId.toString()) {
      return next(new AppError('FORBIDDEN', 'You do not own this resource.', 403));
    }

    req.resource = resource; // attach for the controller to use
    next();
  } catch (err) {
    next(err);
  }
};
```

Usage:
```js
router.put('/services/:id', authenticate, requireBusinessScope, tenantGuard(Service), updateService);
```

This is another middleware factory. The `Model` parameter lets you reuse the same
guard for Service, Staff, TimeSlot, Booking — any model that has a `businessId` field.

---

### `rateLimiter.middleware.js` — Rate Limiting

```js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please wait 15 minutes and try again.',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
```

Applied in `app.js`:
```js
app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

**Why do auth routes need a stricter limit?**

Login and registration endpoints are the primary targets for:
- **Brute force attacks** — trying thousands of password combinations
- **Credential stuffing** — using leaked passwords from other sites
- **Account enumeration** — probing to see which emails are registered

10 requests per 15 minutes per IP is generous for a legitimate user (you'd
never login 10 times in 15 minutes) but stops automated attack tools cold.

---

### `validate.middleware.js` — Request Body Validation

`express-validator` lets you define validation chains inline in route files:

```js
// In auth.routes.js
export const registerOwnerValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('phone').matches(/^[6-9]\d{9}$/),
  body('businessName').trim().notEmpty(),
  body('category').isIn(['salon', 'clinic', 'coaching', 'other']),
  validate, // ← this middleware runs after the chain
];
```

The `validate` middleware collects the results:

```js
import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => `${e.path}: ${e.msg}`).join(', ');
    return next(new AppError('VALIDATION_ERROR', messages, 400));
  }
  next();
};
```

**Why validate at the route level instead of the service level?**

Both layers validate, but for different reasons:

- **Route validation (express-validator):** Catches obviously wrong input (missing
  fields, wrong types, malformed emails) early — before any DB queries run.
  Cheap and fast.

- **Service validation:** Catches business-rule violations (duplicate service name,
  service not owned by this business) that require a database lookup to determine.

Validating early saves unnecessary database roundtrips and returns user-friendly
field-level errors that the frontend can display per-field.

---

### `errorHandler.middleware.js` — Global Error Handler

Express recognises a 4-argument middleware as an error handler:

```js
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred.';

  // Don't leak stack traces in production
  if (config.NODE_ENV === 'development') {
    console.error(err.stack);
  } else {
    console.error(`[${code}] ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message, statusCode },
  });
};
```

Registered last in `app.js` — Express's rule is that error handlers must come
after all routes:

```js
app.use('/api', routes);
app.use(errorHandler); // ← must be last
```

**The `AppError` class**

Throughout the codebase, errors are thrown as `AppError` instances:

```js
// src/utils/AppError.js
export class AppError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
```

When a service throws `new AppError('SLOT_UNAVAILABLE', '...', 409)`, the error
propagates up through the controller to the global error handler, which formats
it into the standard JSON envelope. No try/catch needed in every controller.

---

## Key Decisions

**Why not put auth logic inside each controller?**

Repetition and forgetting. If auth lived in controllers, you'd copy-paste the JWT
verification code 15 times. Then one day you'd add a new route, forget the
copy-paste, and create a security hole. Middleware enforces the rule everywhere
automatically.

**Why separate `tenantResolver` and `tenantGuard` into their own subfolder?**

Multi-tenancy is a cross-cutting concern that touches many routes. Isolating it
in `middleware/tenant/` makes it easy to find, review, and audit. Security-sensitive
code deserves its own namespace.

**Why does `requireBusinessScope` put `businessId` on `req` instead of `req.user`?**

`req.user.businessId` already exists, but `req.businessId` is a deliberate
shorthand injected by middleware. Services receive `req.businessId` as a
function argument — they never import `req` directly. This makes the flow
explicit: middleware extracts the businessId, the controller passes it to the
service. No service ever needs to think about where businessId came from.

---

## What you should learn from this

1. **Middleware is the right place for cross-cutting concerns** — auth, logging,
   rate limiting, validation. If you find yourself doing the same thing in 5
   controllers, it belongs in middleware.

2. **The 401 vs 403 distinction is meaningful.** 401 means "authenticate first."
   403 means "you're authenticated, but you can't do this." Confusing them
   confuses your API consumers.

3. **Middleware factories** (functions that return middleware) are a powerful
   pattern. `requireRole('admin')`, `tenantGuard(Service)` — the outer function
   configures the inner function via closure.

4. **A global error handler is non-negotiable** in production. Without it, unhandled
   errors either crash the server or leak internal stack traces to the client.

5. **Fail at the earliest possible point.** Validate input before hitting the DB.
   Check auth before running any business logic. Rate-limit before doing anything.
   Cheap checks first, expensive operations last.