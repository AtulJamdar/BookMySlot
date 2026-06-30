import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Mail, Phone, Coins, AlertCircle } from 'lucide-react';

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
  cancelledBy?: string;
  cancellationReason?: string;
}

interface BookingDetailProps {
  booking: Booking;
  onCancel: (id: string, reason: string) => Promise<void>;
  isCancelling: boolean;
}

export const BookingDetail: React.FC<BookingDetailProps> = ({
  booking,
  onCancel,
  isCancelling
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reason, setReason] = useState('');

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCancel(booking._id, reason || 'Cancelled by business owner');
    setShowCancelConfirm(false);
    setReason('');
  };

  return (
    <div className="space-y-6 text-zinc-150 font-sans max-h-[80vh] overflow-y-auto pr-2">
      {/* Overview Block */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Booking Ref</p>
          <h3 className="text-lg font-bold text-white font-mono">{booking.bookingRef}</h3>
        </div>
        <Badge
          className={
            booking.status === 'confirmed'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded'
              : booking.status === 'cancelled'
              ? 'bg-red-500/10 text-red-400 border-red-500/20 rounded'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700 rounded'
          }
        >
          {booking.status}
        </Badge>
      </div>

      {/* Appointment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 bg-zinc-950/40 p-4 border border-zinc-800 rounded-lg">
          <h4 className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Session Details</h4>
          
          <div className="space-y-2 text-xs">
            <div>
              <p className="text-zinc-550 text-[10px]">Service</p>
              <p className="text-white font-bold">{booking.serviceId?.name || 'Unknown Service'}</p>
            </div>
            <div>
              <p className="text-zinc-550 text-[10px]">Practitioner</p>
              <p className="text-white font-medium">{booking.staffId?.name || 'Unknown Staff'}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Coins className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-white font-semibold">₹{booking.serviceId?.priceINR || 0}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-zinc-950/40 p-4 border border-zinc-800 rounded-lg">
          <h4 className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Schedule</h4>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-zinc-650" />
              <span className="text-white">{formatDisplayDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-zinc-655" />
              <span className="text-white">{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Contact Details */}
      <div className="bg-zinc-950/20 p-4 border border-zinc-800 rounded-lg space-y-3">
        <h4 className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Customer Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-zinc-600" />
            <span className="text-white font-medium">{booking.customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-zinc-600" />
            <span className="text-zinc-350">{booking.customerPhone}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <Mail className="h-3.5 w-3.5 text-zinc-600" />
            <span className="text-zinc-350">{booking.customerEmail}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="space-y-1.5 pl-1">
          <Label className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Notes</Label>
          <div className="bg-zinc-950/40 p-3 border border-zinc-800 rounded-md text-xs text-zinc-300">
            {booking.notes}
          </div>
        </div>
      )}

      {/* Cancellation Reason details */}
      {booking.status === 'cancelled' && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="space-y-1 text-xs">
            <p className="text-red-400 font-bold">Appointment Cancelled</p>
            <p className="text-zinc-400">
              Cancelled by: <span className="text-zinc-200 capitalize">{booking.cancelledBy || 'system'}</span>
            </p>
            {booking.cancellationReason && (
              <p className="text-zinc-500 italic mt-1">Reason: "{booking.cancellationReason}"</p>
            )}
          </div>
        </div>
      )}

      {/* Cancel action confirmation forms */}
      {booking.status === 'confirmed' && (
        <div className="pt-4 border-t border-zinc-800">
          {!showCancelConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(true)}
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full h-9 text-xs"
              disabled={isCancelling}
            >
              Cancel Appointment
            </Button>
          ) : (
            <form onSubmit={handleCancelSubmit} className="space-y-3 bg-red-950/10 border border-red-950/30 p-4 rounded-lg">
              <div className="space-y-1.5">
                <Label htmlFor="cancel-reason" className="text-red-400 text-xs font-semibold">Cancellation Reason</Label>
                <Input
                  id="cancel-reason"
                  type="text"
                  placeholder="e.g. Schedule Conflict / Sick leave"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="border-red-950/40 bg-zinc-950/60 text-zinc-200 focus-visible:ring-red-900 text-sm"
                  disabled={isCancelling}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                  className="border-zinc-800 text-zinc-400 h-8 text-xs hover:bg-zinc-800"
                  disabled={isCancelling}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="bg-red-500 text-white hover:bg-red-650 h-8 text-xs"
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
