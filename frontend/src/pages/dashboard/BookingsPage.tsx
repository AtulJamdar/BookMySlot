import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BookingTable } from '@/components/bookings/BookingTable';
import { BookingDetail } from '@/components/bookings/BookingDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  serviceId: {
    _id: string;
    name: string;
    priceINR: number;
  };
  staffId: {
    _id: string;
    name: string;
    title?: string;
  };
}

export const BookingsPage: React.FC = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchBookings = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterDate) queryParams.append('date', filterDate);
      if (filterStatus) queryParams.append('status', filterStatus);

      const response = await fetch(`${API_BASE_URL}/bookings?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setBookings(resData.data.items || []);
      } else {
        toast.error('Failed to load appointments roster');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error loading business appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token, filterDate, filterStatus]);

  const handleRowClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsOpen(true);
  };

  const handleCancelBooking = async (id: string, reason: string) => {
    setIsCancelling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success('Appointment cancelled successfully');
        setIsOpen(false);
        fetchBookings();
      } else {
        toast.error(resData.error?.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error cancelling appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Appointments</h1>
        <p className="text-zinc-400 text-sm">
          Track customer booking entries, filters, schedules, and cancellation records.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap gap-4 items-end bg-zinc-900/30 p-4 border border-zinc-800 rounded-lg">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider pl-0.5">Filter by Date</label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border-zinc-800 bg-zinc-950/60 text-zinc-100 h-9 text-xs focus-visible:ring-zinc-700 w-44"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider pl-0.5">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-xs text-zinc-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-750 w-44"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {(filterDate || filterStatus) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterDate('');
              setFilterStatus('');
            }}
            className="h-9 text-xs text-zinc-550 hover:text-white hover:bg-zinc-850/60 px-3"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent animate-pulse"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20 text-zinc-555 text-sm">
          No appointments found matching search criteria.
        </div>
      ) : (
        <BookingTable bookings={bookings} onViewDetail={handleRowClick} />
      )}

      {/* Booking Details modal dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-905 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <BookingDetail
              booking={selectedBooking}
              onCancel={handleCancelBooking}
              isCancelling={isCancelling}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage;
