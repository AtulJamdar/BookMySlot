# BookMySlot 📅

BookMySlot is a premium, multi-tenant appointment scheduling and booking platform tailored for local Indian service businesses (salons, health clinics, coaching centers, and other professional service providers). It features role-based access control, tenant isolation, dynamic slot generation with buffer times, real-time dashboards, automated email confirmations, and a unified customer discovery flow.

---

## Key Features

- **Multi-Tenant Architecture**: Robust tenant isolation at the database and middleware layers using JWT claims.
- **Dynamic Slot Generation**: Automatically generates available booking slots based on staff availability, business working hours, service durations, and customizable buffer times.
- **Owner Dashboard**: Detailed aggregate metrics (revenue, total bookings, cancellation rates) with active staff and service roster management tools.
- **Customer Portal**: Dynamic search and provider discovery panel, featured top-rated providers, active booking logs, and slot reservation controls.
- **Automated Email System**: Asynchronous welcome emails and appointment status alerts (confirmations, reminders, cancellations).
- **Modern UI/UX**: Premium dark mode theme built using React, Vite, Tailwind CSS, and Lucide icon sets.

---

## Tech Stack

### Frontend
- **Framework**: React 18 (Vite build runner)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & CSS Variables
- **Icons**: Lucide Icons
- **Notifications**: Sonner toasts

### Backend
- **Framework**: Node.js & Express
- **Database**: MongoDB & Mongoose
- **Authentication**: Stateless JSON Web Tokens (JWT)
- **Validation**: Express-Validator
- **Mailing**: Nodemailer

---

## Project Structure

```text
BookMySlot/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment variables and DB client config
│   │   ├── controllers/     # API request handlers
│   │   ├── middleware/      # Authentication, role-guards, error logs
│   │   ├── models/          # Mongoose Schemas (User, Business, Service, Staff, Slot, Booking)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic operations & transactions
│   │   └── utils/           # Emails, constants, error envelopes
│   └── .env.example         # Template for backend env variables
└── frontend/
    ├── src/
    │   ├── components/      # UI elements, layouts, selectors, cards
    │   ├── context/         # AuthContext and session state
    │   ├── hooks/           # Custom hooks
    │   ├── pages/           # Landing, Auth, Dashboard, Booking Wizard, Portals
    │   ├── routes/          # AppRouter definitions
    │   └── main.tsx         # Entry point
    └── .env.example         # Template for frontend env variables
```

---

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local standalone instance or Atlas Cluster)

### 1. Backend Configuration
Navigate to the `backend/` directory:
```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/bookmyslot
JWT_SECRET=your_super_secure_jwt_secret_key

# Email configuration (SMTP provider like Mailtrap, Gmail, etc.)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password

# Frontend dynamic origin
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
# Production start
npm start

# Development hot-reload
npm run dev
```

### 2. Frontend Configuration
Navigate to the `frontend/` directory:
```bash
cd ../frontend
npm install
```

Create a `.env` file based on `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

---

## API Routes Overview

### Auth (`/api/auth`)
- `POST /register` — Register a new business owner and their business.
- `POST /register/customer` — Register a new customer.
- `POST /login` — Authenticate and retrieve JWT token.
- `GET /me` — Retrieve active profile details.

### Business (`/api/businesses`)
- `GET /` — List all registered businesses (includes search filters).
- `GET /:slug` — Retrieve public profile by slug.
- `PUT /:id` — Update business details (Working hours, buffers).

### Bookings (`/api/bookings`)
- `POST /` — Create a new slot booking.
- `GET /my` — Retrieve authenticated customer's booking logs.
- `PATCH /:id/cancel` — Cancel an appointment slot.

---

## Design Systems & Aesthetics

BookMySlot uses a dark mode aesthetic designed to wow users. It incorporates subtle gradients, frosted-glass structures, micro-animations, and responsive grids matching premium design systems.

---

## License
Distributed under the MIT License. See `LICENSE` for more information.
