# SPEC — backend/src/middleware/tenantResolver.middleware.js

## File Role
Resolves the active tenant (Business document) from the URL slug for public-facing routes where no JWT is present, and attaches the full Business document to `req.business` so downstream controllers and services do not need to re-query it.

---

## Dependencies

```js
import { Business } from '../models/Business.model.js'; // internal — Mongoose model
import { errorResponse } from '../utils/response.js';   // internal — standard error envelope
```

---

## Exports

### `tenantResolver` — Middleware Function

**Signature:** `(req, res, next) => Promise<void>`

**Purpose:** Used on all public routes that are scoped to a specific business by slug (e.g., `GET /businesses/:slug`, `GET /businesses/:businessId/services`, `GET /businesses/:businessId/timeslots/available`). Queries MongoDB once to verify the business exists and is active, then attaches it to the request so every downstream handler gets it for free.

**Algorithm:**
1. Read slug from `req.params.slug` OR `req.params.businessId` (path parameter) OR `req.query.businessSlug` (query string fallback)
2. If no slug/id found: call `next()` without doing anything (some routes may not need resolution)
3. Determine if the value looks like a MongoDB ObjectId (24 hex chars) or a slug string
   - If ObjectId: `Business.findById(value).select('-ownerId')`
   - If slug: `Business.findOne({ slug: value }).select('-ownerId')`
4. If no document found OR `business.isActive === false` → return 404 with `'NOT_FOUND'`
   - Exception: Super Admin routes must bypass the `isActive` check — pass an `options` param or use a separate admin-scoped query in the admin controller instead
5. Attach to request: `req.business = business`
6. Also set `req.resolvedBusinessId = business._id.toString()` as a convenience alias
7. Call `next()`

**Parameters:** Standard Express `(req, res, next)`
**Return:** void — calls `next()` or sends 404
**Side effects:**
- Makes one MongoDB query (`Business.findOne` or `Business.findById`)
- Mutates `req.business` and `req.resolvedBusinessId`
**Throws:** Never throws — DB errors call `next(err)` to route to global error handler

---

## Data Contracts

### `req.business` shape (after resolution)
```ts
{
  _id: ObjectId;
  name: string;
  slug: string;
  category: 'salon' | 'clinic' | 'coaching' | 'other';
  city: string;
  phone: string;
  description: string | null;
  workingHours: WorkingHoursEntry[];
  bufferMinutes: number;
  isActive: true;   // always true here — inactive businesses are rejected as 404
  // ownerId is excluded via .select('-ownerId')
}
```

### `req.resolvedBusinessId` shape
```ts
string // MongoDB ObjectId as string
```

---

## Rules & Constraints

1. `tenantResolver` must **always** check `isActive === true`. An inactive (suspended) business must not be accessible to the public — return 404, not 403, to avoid leaking that the business exists.
2. `req.business` must be populated before any controller or service that needs business data runs — it should never be null when downstream code expects it.
3. `ownerId` must be excluded from `req.business` using `.select('-ownerId')`. It must never be exposed on public routes.
4. The middleware must support both ObjectId (for `/businesses/:businessId/services`) and slug (for `/businesses/:slug`) to avoid two separate middleware functions.
5. If the resolution fails due to a DB error (not a "not found"), call `next(err)` so the global error handler returns a 500 — do not swallow DB errors.
6. This middleware must **not** be applied to Super Admin routes — admins need to access suspended businesses.
7. The middleware is **idempotent** — if `req.business` is already set (e.g., chained with another middleware), it must not re-query.

---

## Do NOT

- Do NOT call this middleware on authenticated owner or admin routes — use `req.businessId` from `auth.middleware.js` instead.
- Do NOT expose `ownerId` on the `req.business` object.
- Do NOT return 403 for suspended businesses on public routes — return 404 to avoid leaking existence.
- Do NOT make this middleware async without proper try/catch and `next(err)` on failure.
- Do NOT assume `req.params.businessId` is always a slug — it may be an ObjectId string in nested resource routes.
- Do NOT re-query the business in controllers that already have `req.business` — use the attached object.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/models/Business.model.js` | The only model queried by this middleware |
| `src/routes/business.routes.js` | Applies this middleware on public `GET /businesses/:slug` |
| `src/routes/service.routes.js` | Applies this middleware on `GET /businesses/:businessId/services` |
| `src/routes/slot.routes.js` | Applies this middleware on `GET /businesses/:businessId/timeslots/available` |
| `src/middleware/tenant/tenantGuard.middleware.js` | Counterpart for authenticated owner routes |
| `src/controllers/business.controller.js` | Reads `req.business` instead of re-querying |
| `src/controllers/service.controller.js` | Reads `req.resolvedBusinessId` for service listing |
| `src/utils/response.js` | Provides `errorResponse()` |