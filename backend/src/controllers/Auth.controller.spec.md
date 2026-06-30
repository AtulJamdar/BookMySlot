# SPEC — backend/src/controllers/auth.controller.js

## File Role
Handles all HTTP request/response concerns for authentication endpoints: owner registration, customer registration, login, logout, and current-user retrieval. Delegates all business logic to `auth.service.js` and formats responses using standard envelopes.

---

## Dependencies

```js
import * as authService from '../services/auth.service.js'; // internal — all auth logic
import { successResponse, errorResponse } from '../utils/response.js'; // internal
import { validationResult } from 'express-validator'; // npm — collect validation errors
```

---

## Exports

### `registerOwner` — Controller Handler

**Route:** `POST /api/auth/register`
**Auth:** Public

**Algorithm:**
1. Collect `validationResult(req)` — if errors exist, return 400
2. Call `authService.registerOwner(req.body)`
3. Return `successResponse(res, { token, user }, 201)`

**Request body shape:**
```ts
{
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  category: 'salon' | 'clinic' | 'coaching' | 'other';
  city: string;
  description?: string;
}
```

**Response — 201:**
```ts
{
  success: true;
  data: {
    token: string;       // signed JWT
    user: UserProfile;   // { id, name, email, role, businessId, phone }
  }
}
```

**Response — 400:** Validation errors
**Response — 409:** Email or slug already taken
**Side effects:** None — side effects (DB write, welcome email) are in the service
**Throws:** Never — passes errors to `next(err)`

---

### `registerCustomer` — Controller Handler

**Route:** `POST /api/auth/register/customer`
**Auth:** Public

**Algorithm:**
1. Collect validation errors — return 400 if any
2. Call `authService.registerCustomer(req.body)`
3. Return `successResponse(res, { token, user }, 201)`

**Request body shape:**
```ts
{
  name: string;
  email: string;
  password: string;
  phone: string;
}
```

**Response — 201:** Same shape as `registerOwner` but `user.role === 'customer'` and `user.businessId === null`
**Response — 400/409:** Same patterns as `registerOwner`

---

### `login` — Controller Handler

**Route:** `POST /api/auth/login`
**Auth:** Public

**Algorithm:**
1. Collect validation errors — return 400 if any
2. Call `authService.login(req.body.email, req.body.password)`
3. Return `successResponse(res, { token, user }, 200)`

**Request body shape:**
```ts
{
  email: string;
  password: string;
}
```

**Response — 200:**
```ts
{
  success: true;
  data: {
    token: string;
    user: UserProfile;
  }
}
```

**Response — 400:** Validation errors
**Response — 401:** Invalid credentials

---

### `logout` — Controller Handler

**Route:** `POST /api/auth/logout`
**Auth:** `authenticate` middleware required

**Algorithm:**
1. Because JWTs are stateless, server-side logout is a signal only
2. Return `successResponse(res, { message: 'Logged out successfully.' }, 200)`
3. The frontend is responsible for deleting the token from localStorage on receipt

**Response — 200:**
```ts
{
  success: true;
  data: { message: 'Logged out successfully.' }
}
```

**Note:** No token blocklist in V1. This endpoint exists to give the frontend a standard logout target and for future server-side token revocation.

---

### `getMe` — Controller Handler

**Route:** `GET /api/auth/me`
**Auth:** `authenticate` middleware required

**Algorithm:**
1. `req.user` is already populated by `authenticate` middleware (contains decoded JWT payload)
2. Optionally call `authService.getMe(req.user.userId)` to get the freshest user data from DB
3. Return `successResponse(res, user, 200)`

**Response — 200:**
```ts
{
  success: true;
  data: UserProfile; // { id, name, email, role, businessId, phone }
}
```

**Response — 401:** No valid token (handled by `authenticate` middleware before this runs)

---

## Data Contracts

### `UserProfile` (returned by all auth handlers)
```ts
{
  id: string;               // MongoDB ObjectId as string
  name: string;
  email: string;
  role: 'customer' | 'business_owner' | 'super_admin';
  businessId: string | null;
  phone: string | null;
}
```

### Error Response Patterns

| Situation | Status | Code |
|-----------|--------|------|
| Missing/invalid fields | 400 | `VALIDATION_ERROR` |
| Email already registered | 409 | `EMAIL_TAKEN` |
| Slug collision on registration | 409 | `SLUG_TAKEN` |
| Wrong password / no user found | 401 | `UNAUTHORIZED` |
| Expired / invalid token (getMe) | 401 | `UNAUTHORIZED` |

---

## Rules & Constraints

1. All four handlers must check `validationResult(req)` at the top before doing anything else. Validation rules are defined in the route file using `express-validator` chains.
2. `passwordHash` must **never** appear in any response from this controller — rely on the `User` model's `toJSON` transform.
3. The controller must pass errors to `next(err)` (not `res.status(500).json(...)`) so the global error handler formats them consistently.
4. `getMe` should call the service to get fresh DB data rather than returning the JWT payload directly — a user's name or phone may have changed since the token was issued.
5. `logout` must return 200 even though it does nothing server-side — this is intentional V1 behaviour, not a bug.
6. `registerOwner` creates both a User and a Business in one transaction — this detail is hidden in the service layer. The controller does not need to know about the transaction.

---

## Do NOT

- Do NOT write any business logic in this controller — no bcrypt calls, no JWT signing, no DB queries.
- Do NOT send emails from this controller — welcome email is sent from `auth.service.js`.
- Do NOT return `passwordHash` in any response.
- Do NOT catch errors with try/catch in this controller — use `next(err)` and let the global error handler format the response.
- Do NOT reference `Business`, `User`, or any Mongoose model directly — go through `auth.service.js`.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/services/auth.service.js` | Called for all business logic |
| `src/routes/auth.routes.js` | Mounts these handlers; applies validators + rate limiter |
| `src/middleware/auth.middleware.js` | `authenticate` protects `logout` and `getMe` |
| `src/utils/response.js` | `successResponse` / `errorResponse` used in every handler |
| `src/models/User.model.js` | Indirectly accessed via service |