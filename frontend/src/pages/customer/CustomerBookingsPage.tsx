import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CustomerBookingCard } from '@/components/bookings/CustomerBookingCard';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  bookingRef: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  businessId: {
    name: string;
    slug: string;
  };
  serviceId: {
    name: string;
  };
  staffId: {
    name: string;
  };
}

export const CustomerBookingsPage: React.FC = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancellingId, setIsCancellingId] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchMyBookings = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setBookings(resData.data || []);
      } else {
        toast.error('Failed to load your booking history');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error loading appointment logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyBookings();
    }
  }, [token]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setIsCancellingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by customer' })
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success('Appointment cancelled successfully');
        fetchMyBookings();
      } else {
        toast.error(resData.error?.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error cancelling appointment');
    } finally {
      setIsCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">My Appointments</h1>
        <p className="text-zinc-400 text-xs">
          View your upcoming slots, reservation logs, and cancel appointments.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent animate-pulse"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20 text-zinc-500 text-sm">
          You don't have any bookings registered yet. Use the "Discover Providers" tab to book an appointment!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <CustomerBookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancelBooking}
              isCancelling={isCancellingId === booking._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerBookingsPage;
