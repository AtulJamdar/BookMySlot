import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Import Layouts
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CustomerDashboardLayout } from '../components/layout/CustomerDashboardLayout';

// Import Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { BookingPage } from '../pages/BookingPage';
import { AdminPage } from '../pages/AdminPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Import Customer Dashboard Pages
import { CustomerBookingsPage } from '../pages/customer/CustomerBookingsPage';
import { CustomerDiscoverPage } from '../pages/customer/CustomerDiscoverPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';

// Import Dashboard Pages
import { OverviewPage } from '../pages/dashboard/OverviewPage';
import { ServicesPage } from '../pages/dashboard/ServicesPage';
import { StaffPage } from '../pages/dashboard/StaffPage';
import { SlotsPage } from '../pages/dashboard/SlotsPage';
import { BookingsPage } from '../pages/dashboard/BookingsPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/b/:slug" element={<BookingPage />} />

      {/* Customer Protected Pages */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/bookings" replace />} />
        <Route path="bookings" element={<CustomerBookingsPage />} />
        <Route path="discover" element={<CustomerDiscoverPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="*" element={<Navigate to="/customer/bookings" replace />} />
      </Route>

      {/* Redirect old path /my-bookings to customer portal */}
      <Route path="/my-bookings" element={<Navigate to="/customer/bookings" replace />} />

      {/* Owner Protected Dashboard Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['business_owner']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="slots" element={<SlotsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        {/* Redirect unknown dashboard paths */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Super Admin Protected Pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
