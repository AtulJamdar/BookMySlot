# SPEC — backend/src/models/User.model.js

## File Role
Defines the Mongoose schema and model for all system users (business owners, customers, and the super admin), including the pre-save bcrypt hook that hashes passwords before storage.

---

## Dependencies

```js
import mongoose from 'mongoose';         // npm — schema + model factory
import bcrypt from 'bcryptjs';           // npm — password hashing
import { ROLES } from '../utils/constants.js'; // internal — role enum
```

---

## Exports

### Default export: `User` (Mongoose Model)

No standalone functions are exported — the model itself is the export.
All callers interact with it via standard Mongoose static methods:
`User.create()`, `User.findOne()`, `User.findById()`, `User.findByIdAndUpdate()`.

**Pre-save hook (side effect — runs automatically before every `.save()`):**
- If `passwordHash` field is modified, bcrypt-hashes it with salt rounds = 10
- Replaces the plain-text value on the document in-place before DB write
- Uses `bcrypt.genSalt(10)` + `bcrypt.hash()`
- Must use `function` keyword (not arrow function) so `this` refers to the document

**Instance method: `comparePassword(candidatePassword)`**
- Parameters: `candidatePassword` (String) — plain-text password from login request
- Returns: `Promise<Boolean>` — true if match, false otherwise
- Side effects: none
- Throws: propagates bcrypt errors (rare; treat as 500)

---

## Data Contracts

### Schema Fields

| Field          | Type     | Required | Default | Validation / Notes                                      |
|----------------|----------|----------|---------|---------------------------------------------------------|
| `name`         | String   | ✅       | —       | minLength: 2, maxLength: 100, trim: true                |
| `email`        | String   | ✅       | —       | unique, lowercase, trim, basic format regex             |
| `passwordHash` | String   | ✅       | —       | stored as bcrypt hash; never returned in API responses  |
| `role`         | String   | ✅       | —       | enum: `['customer', 'business_owner', 'super_admin']`   |
| `businessId`   | ObjectId | ❌       | null    | ref: `'Business'`; null for customer and super_admin    |
| `phone`        | String   | ❌       | null    | pattern: `/^[6-9]\d{9}$/` (Indian mobile); nullable    |
| `createdAt`    | Date     | auto     | —       | via `timestamps: true`                                  |
| `updatedAt`    | Date     | auto     | —       | via `timestamps: true`                                  |

### Indexes

| Fields   | Options          | Reason                                              |
|----------|------------------|-----------------------------------------------------|
| `email`  | `unique: true`   | Enforces globally unique emails; speeds login query |

### Schema Options
```js
{ timestamps: true, toJSON: { transform: (doc, ret) => { delete ret.passwordHash; return ret; } } }
```
The `toJSON` transform ensures `passwordHash` is **never** included when a User document is serialised to JSON (i.e., sent in an API response).

---

## Rules & Constraints

1. `passwordHash` must be bcrypt-hashed with **salt rounds ≥ 10** before storage. Never store plain text.
2. The pre-save hook must only re-hash if `this.isModified('passwordHash')` — otherwise updating `name` would unnecessarily re-hash.
3. `role` must be one of the three enum values. No other roles are valid.
4. `businessId` must be `null` for role `customer` and `super_admin`. It must reference a valid `Business` document for role `business_owner`.
5. `email` must be stored in lowercase. Enforce with `lowercase: true` in schema, not in application code.
6. The `toJSON` transform removing `passwordHash` is mandatory — no API response must ever leak the hash.
7. A single owner may own only one business in V1. This constraint is enforced at the service layer (`auth.service.js`), not in the model.

---

## Do NOT

- Do NOT validate that `businessId` belongs to the user at the model layer — that is the middleware's responsibility.
- Do NOT import or call any email utility from this file.
- Do NOT define any route or controller logic in this file.
- Do NOT return `passwordHash` in any API response — rely on the `toJSON` transform, and additionally ensure service functions select only needed fields with `.select('-passwordHash')` when returning user data.
- Do NOT use arrow functions for the pre-save hook — `this` binding will break.

---

## Related Files

| File | Relationship |
|------|-------------|
| `src/services/auth.service.js` | Calls `User.create()`, `User.findOne({ email })`, uses `comparePassword()` |
| `src/middleware/auth.middleware.js` | Calls `User.findById(decoded.userId)` to validate token (optional; see middleware spec) |
| `src/models/Business.model.js` | `businessId` references `Business._id` |
| `src/utils/constants.js` | Provides `ROLES` enum |
| `src/scripts/seed.js` | Creates super admin and demo owner via `User.create()` |