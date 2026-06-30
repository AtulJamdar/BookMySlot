# SPEC — backend/src/middleware/auth.middleware.js

## File Role
Exports three composable Express middleware functions that enforce identity verification (`authenticate`), role-based access control (`requireRole`), and tenant scope injection (`requireBusinessScope`) for all protected API routes.

---

## Dependencies

```js
import jwt from 'jsonwebtoken';           // npm — JWT verify
import { config } from '../config/env.js'; // internal — JWT_SECRET
import { errorResponse } from '../utils/response.js'; // internal — standard error envelope
import { ROLES } from '../utils/constants.js';         // internal — role enum
```

---

## Exports

### `authenticate` — Middleware Function

**Signature:** `(req, res, next) => Promise<void>`

**Purpose:** Verifies the Bearer JWT in the `Authorization` header. If valid, attaches the decoded payload to `req.user`. If invalid or absent, returns 401 immediately.

**Algorithm:**
1. Read `req.headers.authorization`
2. If missing or does not start with `'Bearer '` → `return res.status(401).json(errorResponse(...))`
3. Extract token: `authHeader.split(' ')[1]`
4. Call `jwt.verify(token, config.JWT_SECRET)`
5. On success: `req.user = decoded` (shape: `{ userId, role, businessId, iat, exp }`) then `next()`
6. On `JsonWebTokenError` or `TokenExpiredError`: return 401

**Parameters:** Standard Express `(req, res, next)`
**Return:** void — calls `next()` or sends response
**Side effects:** Mutates `req.user`
**Throws:** Never throws — all errors are caught and converted to 401 responses

---

### `requireRole(...roles)` — Middleware Factory

**Signature:** `(...roles: string[]) => (req, res, next) => void`

**Purpose:** Returns a middleware that checks `req.user.role` against an allowed set. Must be called **after** `authenticate` in the middleware chain.

**Algorithm:**
1. Read `req.user.role` (set by `authenticate`)
2. If `req.user` is undefined → return 401 (guard against misconfigured routes)
3. If `req.user.role` not in `roles` array → return 403
4. Otherwise → `next()`

**Usage example:**
```js
router.get('/admin', authenticate, requireRole('super_admin'), handler);
router.post('/services', authenticate, requireRole('business_owner', 'super_admin'), handler);
```

**Parameters:** `roles` (rest parameter, string[]) — array of permitted role strings
**Return:** Middleware function
**Side effects:** None
**Throws:** Never throws

---

### `requireBusinessScope` — Middleware Function

**Signature:** `(req, res, next) => void`

**Purpose:** Injects `req.businessId` from `req.user.businessId`. Returns 403 if the caller has no business scope (customers and super_admin have no businessId). Must be called **after** `authenticate`.

**Algorithm:**
1. Read `req.user.businessId`
2. If null or undefined → return 403 with `'FORBIDDEN'` code
3. Set `req.businessId = req.user.businessId.toString()` → `next()`

**Parameters:** Standard Express `(req, res, next)`
**Return:** void
**Side effects:** Mutates `req.businessId`
**Throws:** Never throws

---

## Data Contracts

### `req.user` shape (set by `authenticate`)
```ts
{
  userId: string;      // MongoDB ObjectId as string
  role: 'customer' | 'business_owner' | 'super_admin';
  businessId: string | null;  // null for customer and super_admin
  iat: number;         // issued-at Unix timestamp
  exp: number;         // expiry Unix timestamp
}
```

### `req.businessId` shape (set by `requireBusinessScope`)
```ts
string // MongoDB ObjectId as string — guaranteed non-null when this middleware runs
```

---

## Rules & Constraints

1. `authenticate` must never make a database query. JWT verification is cryptographic only — no `User.findById()` call. The payload is trusted if the signature validates.
2. `requireRole` must always be used **after** `authenticate` in the chain — it depends on `req.user` being set.
3. `requireBusinessScope` must always be used **after** `authenticate` — it depends on `req.user.businessId`.
4. `requireBusinessScope` must convert `businessId` to a string with `.toString()` before assigning to `req.businessId` — Mongoose ObjectId objects and string comparisons must be consistent downstream.
5. Super Admin routes must use `authenticate` + `requireRole('super_admin')` but must **NOT** use `requireBusinessScope` — admins are cross-tenant.
6. Public routes (customer booking page, service listing) must use **neither** `authenticate` nor `requireBusinessScope`.
7. All 401/403 responses must use the standard `errorResponse()` envelope — no raw `res.json({ message: ... })`.
8. `jwt.verify()` must use `config.JWT_SECRET` — never hardcode the secret.

---

## Do NOT

- Do NOT call `User.findById()` inside `authenticate` — JWT verification is sufficient and a DB call would defeat the stateless performance benefit.
- Do NOT combine `authenticate`, `requireRole`, and `requireBusinessScope` into a single monolithic middleware — they must remain separate and composable.
- Do NOT throw uncaught errors — all `jwt.verify()` exceptions must be caught and converted to 401 responses.
- Do NOT set `req.businessId` from `req.params.businessId` in this file — that is the job of `tenantGuard.middleware.js`.
- Do NOT use `req.user.businessId` directly in service calls without going through `req.businessId` — use the injected, stringified version.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/config/env.js` | Provides `JWT_SECRET` |
| `src/utils/constants.js` | Provides `ROLES` enum |
| `src/utils/response.js` | Provides `errorResponse()` |
| `src/services/auth.service.js` | Signs the JWT that this middleware verifies |
| `src/routes/*.routes.js` | All protected routes import and apply these middleware |
| `src/middleware/tenant/tenantGuard.middleware.js` | Runs after `requireBusinessScope`; compares `req.businessId` to URL param |