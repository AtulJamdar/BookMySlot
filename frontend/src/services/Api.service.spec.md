# SPEC — frontend/src/services/api.service.js

## File Role
Provides a pre-configured Axios instance with authentication headers automatically attached, and exports named async functions for every API endpoint the frontend consumes. This is the single point of contact between the React frontend and the BookMySlot backend API.

---

## Dependencies

```js
import axios from 'axios'; // npm — HTTP client
```

No other imports. This file must not import from React context, hooks, or router — it is a plain JavaScript module.

---

## Exports

### `apiClient` — Axios Instance (named export)

**Purpose:** A configured Axios instance that all API calls use. Not called directly by components — use the named function exports below.

**Configuration:**
```js
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:5000/api
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 seconds
});
```

**Request interceptor** — attaches JWT automatically:
```js
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response interceptor** — handles 401 globally:
```js
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bms_token');
      window.location.href = '/login'; // hard redirect — clears all state
    }
    return Promise.reject(error); // always re-throw so callers can handle
  }
);
```

---

## Named Function Exports (by resource group)

All functions return `Promise<data>` where `data` is the `.data` field of the standard success envelope (`response.data.data`). All functions re-throw Axios errors — callers handle them with try/catch or `.catch()`.

### Auth

```ts
registerOwner(payload: RegisterOwnerRequest): Promise<AuthResponseData>
registerCustomer(payload: RegisterCustomerRequest): Promise<AuthResponseData>
login(email: string, password: string): Promise<AuthResponseData>
logout(): Promise<{ message: string }>
getMe(): Promise<UserProfile>
```

### Business

```ts
getBusinessBySlug(slug: string): Promise<BusinessPublic>
updateBusiness(id: string, payload: UpdateBusinessRequest): Promise<Business>
setWorkingHours(id: string, workingHours: WorkingHoursEntry[]): Promise<Business>
blockDays(id: string, payload: BlockDaysRequest): Promise<{ blockedDates: string[]; slotsCreated: number }>
getAllBusinesses(params?: { page?: number; limit?: number; isActive?: boolean }): Promise<{ businesses: BusinessAdminView[]; pagination: Pagination }>
suspendBusiness(id: string, payload: SuspendBusinessRequest): Promise<{ id: string; isActive: boolean; auditLogId: string }>
```

### Services

```ts
getServices(businessId: string): Promise<Service[]>
createService(businessId: string, payload: CreateServiceRequest): Promise<Service>
updateService(businessId: string, serviceId: string, payload: UpdateServiceRequest): Promise<Service>
deleteService(businessId: string, serviceId: string): Promise<{ message: string }>
```

### Staff

```ts
getStaff(businessId: string, params?: { serviceId?: string }): Promise<Staff[]>
createStaff(businessId: string, payload: CreateStaffRequest): Promise<Staff>
updateStaff(businessId: string, staffId: string, payload: UpdateStaffRequest): Promise<Staff>
deleteStaff(businessId: string, staffId: string): Promise<{ message: string }>
```

### Time Slots

```ts
getAvailableSlots(businessId: string, params: {
  date: string;
  serviceId: string;
  staffId?: string;
}): Promise<{ date: string; serviceId: string; durationMinutes: number; slots: AvailableSlot[] }>

blockTimeSlot(businessId: string, payload: GenerateTimeSlotRequest): Promise<TimeSlot>
unblockTimeSlot(businessId: string, slotId: string): Promise<{ message: string }>
getBlockedSlots(businessId: string, params?: { date?: string; staffId?: string; from?: string; to?: string }): Promise<TimeSlot[]>
```

### Bookings

```ts
createBooking(payload: CreateBookingRequest): Promise<Booking>
getMyBookings(): Promise<BookingCustomerView[]>
getAllBookings(params?: { businessId?: string; date?: string; status?: string; page?: number; limit?: number }): Promise<{ bookings: BookingAdminView[]; pagination: Pagination }>
getBookingById(id: string): Promise<BookingPopulated>
cancelBooking(id: string, payload: CancelBookingRequest): Promise<Booking>
updateBookingStatus(id: string, payload: UpdateBookingStatusRequest): Promise<Booking>
listBusinessBookings(businessId: string, params?: { date?: string; status?: string; staffId?: string; page?: number; limit?: number }): Promise<{ bookings: BookingPopulated[]; pagination: Pagination }>
```

### Analytics & Dashboard

```ts
getDashboard(businessId: string, params?: { from?: string; to?: string }): Promise<DashboardSummary>
getAnalyticsSummary(params?: { from?: string; to?: string }): Promise<AnalyticsSummary>
getPeakHours(params?: { from?: string; to?: string }): Promise<{ period: DatePeriod; peakHours: PeakHourEntry[] }>
getPlatformAnalytics(): Promise<PlatformAnalytics>
```

---

## Data Contracts

### localStorage key
```
'bms_token' — the JWT is stored and read from this key exclusively
```
No other localStorage keys are used for auth. Components must not read `localStorage` directly — read from `AuthContext` instead.

### Error shape received by callers
When a request fails, Axios rejects with an error object. The backend error is at:
```ts
error.response.data.error: {
  code: string;        // e.g. 'SLOT_UNAVAILABLE'
  message: string;     // human-readable
  statusCode: number;
}
```

Callers should extract the message like:
```js
const message = error.response?.data?.error?.message ?? 'Something went wrong.';
```

### Unwrapping the envelope
Every function unwraps the standard `{ success: true, data: {...} }` envelope:
```js
const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data.data; // not response.data
};
```

---

## Rules & Constraints

1. **Token key is `'bms_token'`** — this string must be consistent across `api.service.js`, `AuthContext.jsx`, and anywhere else localStorage is touched. Never use a different key name.
2. **The response interceptor's 401 handler must remove the token AND hard-redirect to `/login`** — a soft React Router navigation is insufficient because the app state needs a full reset.
3. **Every function must unwrap `response.data.data`** before returning — callers must never receive the outer `{ success, data }` envelope.
4. **All functions re-throw errors** — never catch and swallow. Components and contexts handle errors and display toasts.
5. **`baseURL` must come from `import.meta.env.VITE_API_BASE_URL`** — never hardcoded. In development this is `http://localhost:5000/api`, in production the Render URL.
6. **This file must not import from React** — no `useContext`, no `useState`, no router imports. It is a plain JS module importable in any context.
7. **Timeout must be set** (15 seconds) — Render free tier has cold-start latency; without a timeout, requests can hang indefinitely.
8. All date strings passed to API functions must be in `YYYY-MM-DD` format. This service does not format dates — callers are responsible.
9. `getAvailableSlots` must always include `date` and `serviceId` params — both are required by the backend.

---

## Do NOT

- Do NOT import React, `useContext`, or any hook in this file.
- Do NOT store the token anywhere other than `localStorage` under key `'bms_token'`.
- Do NOT return the raw Axios response — always unwrap `.data.data`.
- Do NOT catch errors inside the named functions — re-throw so the caller handles them.
- Do NOT hardcode the API base URL.
- Do NOT make raw `axios.get(...)` calls in components — always go through these named functions.
- Do NOT add business logic to this file — it is a transport layer only.

---

## Related Files

| File | Relationship |
|------|-------------|
| `frontend/src/context/AuthContext.jsx` | Reads JWT from localStorage using `'bms_token'` key; calls `login()`, `registerOwner()`, `getMe()` from this service |
| `frontend/.env` / `.env.example` | Provides `VITE_API_BASE_URL` |
| `frontend/src/pages/BookingPage.jsx` | Calls `getBusinessBySlug`, `getServices`, `getStaff`, `getAvailableSlots`, `createBooking` |
| `frontend/src/pages/dashboard/OverviewPage.jsx` | Calls `getDashboard` |
| `frontend/src/pages/dashboard/ServicesPage.jsx` | Calls `getServices`, `createService`, `updateService`, `deleteService` |
| `frontend/src/pages/dashboard/StaffPage.jsx` | Calls `getStaff`, `createStaff`, `updateStaff`, `deleteStaff` |
| `frontend/src/pages/dashboard/SlotsPage.jsx` | Calls `getBlockedSlots`, `blockTimeSlot`, `unblockTimeSlot` |
| `frontend/src/pages/dashboard/BookingsPage.jsx` | Calls `listBusinessBookings`, `cancelBooking`, `updateBookingStatus` |
| `frontend/src/pages/MyBookingsPage.jsx` | Calls `getMyBookings`, `cancelBooking` |
| `frontend/src/pages/AdminPage.jsx` | Calls `getAllBusinesses`, `suspendBusiness`, `getAllBookings`, `getPlatformAnalytics` |