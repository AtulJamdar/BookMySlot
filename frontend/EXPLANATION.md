# EXPLANATION — frontend/

## Purpose

The frontend is a **React single-page application (SPA)** built with Vite. It is
the user interface layer — every screen a Business Owner, Customer, or Super Admin
sees and interacts with. It talks exclusively to the backend via HTTP requests
and renders the responses as visual UI.

Three tools define the frontend's foundation:
- **Vite** — the build tool and development server
- **React** — the UI library for building component trees
- **Tailwind CSS + shadcn/ui** — the styling system

Understanding why each was chosen, and how they fit together, makes every
subsequent file in the project easier to understand.

---

## How it works

### Vite — the Build Tool

When you run `npm run dev`, you're running Vite. Vite does two things:

**In development:**
- Serves your source files directly to the browser using native ES Modules
- Watches for file changes and reloads only the changed module (Hot Module Replacement)
- Proxies API requests to `localhost:5000` so you avoid CORS issues locally

**In production (npm run build):**
- Bundles all your JavaScript, CSS, and assets into optimised static files in `/dist`
- Tree-shakes unused code
- Minifies output
- The `/dist` folder is what gets deployed to Vercel

**Why Vite over Create React App (CRA)?**

CRA was the standard for years but is now deprecated and unmaintained. Vite is
significantly faster — its development server starts in milliseconds instead of
seconds, and Hot Module Replacement is near-instant. For a project with dozens
of components, this makes a real difference to developer experience.

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ← '@/components/...' resolves to 'src/components/...'
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // ← forward API calls to Express in development
    },
  },
});
```

The `@` alias is critical. Without it, imports look like:
```js
import Button from '../../../components/ui/button'; // fragile, breaks on refactor
```
With the alias:
```js
import Button from '@/components/ui/button'; // always resolves from src/
```

---

### React — How the App Renders

The entry point is `src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster />  {/* Global toast notifications, mounted once at root */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**Why is `<Toaster>` at the root?**

The toast notification system needs to render overlay elements above all other
content. Mounting it once at the root ensures it's always available, regardless
of which page is currently displayed. Any component anywhere in the tree can
trigger a toast without knowing where `<Toaster>` lives.

**Why wrap everything in `<BrowserRouter>`?**

React Router needs a single `<BrowserRouter>` at the top of the tree to provide
routing context to all nested `<Route>`, `<Link>`, and `useNavigate()` calls.
It must be an ancestor of `<App>` — not inside it.

**Why `<AuthProvider>` wraps `<App>`?**

`AuthProvider` makes auth state (`user`, `token`, `login()`, `logout()`) available
to any component in the tree via `useContext(AuthContext)`. Components like
`<ProtectedRoute>`, `<Sidebar>`, and `<Topbar>` all need to know if the user is
logged in. By wrapping at the root, the context is available everywhere without
prop drilling.

---

### Tailwind CSS — Utility-First Styling

Tailwind CSS provides atomic CSS classes that map directly to CSS properties:

```jsx
<button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
  Book Appointment
</button>
```

Each class does one thing: `bg-indigo-600` sets background colour, `px-4` sets
horizontal padding, `rounded-md` sets border radius.

**Why Tailwind over writing regular CSS?**

1. **No context switching.** You style components inline without jumping between
   a JSX file and a CSS file. The visual result is right next to the markup.

2. **No naming things.** CSS requires you to invent class names (`.booking-button`,
   `.primary-action-btn`). With Tailwind, there are no custom class names to bikeshed.

3. **No CSS specificity wars.** Every Tailwind class has the same specificity.
   There are no `!important` hacks needed.

4. **Automatic purging.** Vite + Tailwind scans your JSX files and includes only
   the classes you actually use in the production build. Unused utility classes
   are removed, keeping the CSS bundle small.

**The `tailwind.config.js`:**

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'], // ← tells Tailwind which files to scan
  theme: {
    extend: {
      // shadcn/ui injects CSS variable references here
      colors: {
        border:     'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... other design tokens
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

The CSS variable references (`hsl(var(--primary))`) are how shadcn/ui implements
theming. The actual values for `--primary`, `--background`, etc. are defined in
`src/index.css` and can be swapped out for a different theme.

---

### shadcn/ui — the Component Library

shadcn/ui is different from component libraries like Material UI or Ant Design.
It does **not** install as a package you import from. Instead, it copies component
source code directly into your project:

```bash
npx shadcn-ui@latest add button
# This creates src/components/ui/button.jsx in YOUR project
```

**Why is this better than importing from a package?**

When you import `<Button>` from `@mui/material`, you get what MUI gives you.
Changing its internals requires overriding CSS or using theme configuration — often
an uphill battle. With shadcn/ui, the `button.jsx` file is in your project.
You can read it, understand it, and modify it directly. No fighting the library.

**The `cn()` helper — the glue between Tailwind and shadcn:**

```js
// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

`cn()` combines two libraries:
- `clsx` — conditionally joins class names: `clsx('base', isActive && 'text-blue-500')` → `'base text-blue-500'`
- `twMerge` — intelligently merges conflicting Tailwind classes: `twMerge('px-4 px-6')` → `'px-6'` (last one wins)

Without `twMerge`, if you have a base class `px-4` and override it with `px-6`,
both would be in the className string and the browser would apply whichever CSS
rule has higher specificity — unpredictable. `twMerge` solves this by removing
the earlier conflicting class.

Used in every shadcn component and in your custom components:

```jsx
// In button.jsx — allows callers to extend or override the button's default classes
<button className={cn('bg-primary text-white px-4 py-2', className)}>
  {children}
</button>

// Caller can extend:
<Button className="w-full mt-4">Book Now</Button>
// Result: 'bg-primary text-white px-4 py-2 w-full mt-4'
```

---

### Axios and the API Client Pattern

All HTTP communication goes through `src/lib/apiClient.js`:

```js
// src/lib/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. 'http://localhost:5000/api'
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // hard redirect, clears React state
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Why interceptors instead of adding the token in each service function?**

Without interceptors, every service function would need:
```js
const token = localStorage.getItem('token');
const response = await axios.get('/bookings', {
  headers: { Authorization: `Bearer ${token}` }
});
```

That's 3 lines of repetitive code in every function. The request interceptor
does it once, invisibly, for every request the app makes. The token is always
sent without any developer having to remember it.

The 401 response interceptor handles session expiry globally. When the token
expires, any API call returns 401. The interceptor catches this, clears the
stale token, and redirects to login — from one place, covering all API calls.

**`import.meta.env.VITE_API_BASE_URL` — Vite's environment variables**

Vite uses `import.meta.env` instead of `process.env`. Variables must be prefixed
with `VITE_` to be exposed to the browser bundle (for security — you don't want
server-side secrets in the browser). The value is set in `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

In production (on Vercel), this is set as an environment variable in the Vercel
dashboard, pointing to the Render backend URL.

---

### `src/services/` — The Frontend Service Layer

Each file in `src/services/` is a thin collection of named functions that call the API:

```js
// src/services/booking.service.js
import apiClient from '@/lib/apiClient';

export const createBooking = async (data) => {
  const response = await apiClient.post('/bookings', data);
  return response.data; // { success: true, data: { booking } }
};

export const getMyBookings = async () => {
  const response = await apiClient.get('/bookings/my');
  return response.data;
};

export const cancelBooking = async (bookingId, payload) => {
  const response = await apiClient.patch(`/bookings/${bookingId}/cancel`, payload);
  return response.data;
};
```

Components call these directly:

```jsx
// In BookingPage.jsx
import { createBooking } from '@/services/booking.service';

const handleSubmit = async () => {
  try {
    setIsLoading(true);
    const result = await createBooking({ businessId, serviceId, staffId, date, startTime, ...customerData });
    navigate(`/booking-confirmation?ref=${result.data.bookingRef}`);
  } catch (err) {
    if (err.response?.status === 409) {
      toast({ title: 'This slot was just taken', description: 'Please choose another time.', variant: 'destructive' });
      refetchSlots();
    }
  } finally {
    setIsLoading(false);
  }
};
```

**Why no custom hooks layer (no `useBookings()`, `useSlots()`)?**

As documented in STRUCTURE.md, this is a deliberate architectural decision for
this project. Custom hooks add a layer of indirection — when you see
`const { data } = useBookings()`, you need to open a separate file to understand
what query it runs. Calling `getMyBookings()` directly in the component makes the
data flow explicit and traceable.

For a larger production app with complex caching requirements, you might use
React Query or SWR with custom hooks. For BookMySlot, direct service calls
keep the dependency graph flat and easy for AI coding tools to reason about.

---

## Key Decisions

**Why Vite + React over Next.js?**

Next.js is excellent for SEO-heavy, server-rendered applications. BookMySlot
is an app, not a content site. Business owners manage their schedules; customers
book appointments. These are authenticated flows that don't benefit from
server-side rendering. A Vite SPA is simpler to build, deploy (Vercel static),
and reason about for this use case.

**Why Tailwind instead of CSS Modules or Styled Components?**

CSS Modules are great but require creating a separate `.module.css` file per
component. Styled Components add runtime CSS-in-JS overhead. Tailwind keeps
styles co-located with markup, eliminates unused CSS at build time, and has
first-class support in shadcn/ui. For a project using shadcn/ui, Tailwind is
the natural choice.

**Why shadcn/ui over Material UI, Chakra UI, or Ant Design?**

shadcn/ui's "your code, not a package" philosophy means you're never fighting
the library. Material UI and Ant Design have strong design opinions that are hard
to override. shadcn/ui ships with sensible defaults you can change freely. It's
also built on Radix UI primitives, which handle accessibility (focus management,
keyboard navigation, ARIA attributes) out of the box.

---

## What you should learn from this

1. **Vite is the modern standard** for React development. Learn its config file,
   understand the `@` alias, and understand how environment variables work with
   `import.meta.env`.

2. **Axios interceptors are more powerful than they look.** Global auth header
   injection and 401 handling from one place — this pattern appears in virtually
   every professional React codebase.

3. **shadcn/ui is not a UI library you install.** It's a collection of components
   you own. The `cn()` helper and Tailwind CSS variables are the glue that holds
   the whole system together. Understand those two things and shadcn/ui becomes
   very easy.

4. **Context at the root, services called from components** — this is a clean,
   understandable architecture for apps at this scale. You know where auth state
   lives (AuthContext) and you know how data reaches the server (service functions).

5. **`import.meta.env.VITE_*` for frontend config**, `.env` for local, Vercel
   dashboard for production. The same mental model as the backend, just different
   syntax.