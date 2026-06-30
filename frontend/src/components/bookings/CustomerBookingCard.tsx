import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin } from 'lucide-react';

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

interface CustomerBookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}

export const CustomerBookingCard: React.FC<CustomerBookingCardProps> = ({
  booking,
  onCancel,
  isCancelling
}) => {
  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isCancellationAllowed = () => {
    if (booking.status !== 'confirmed') return false;
    const now = new Date();
    const [y, m, d] = booking.date.split('-').map(Number);
    const [hr, min] = booking.startTime.split(':').map(Number);
    const bookingTime = new Date(y, m - 1, d, hr, min);
    const diffHrs = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHrs >= 1;
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all shadow-lg text-zinc-100 flex flex-col justify-between font-sans">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider font-mono">
            {booking.bookingRef}
          </p>
          <h3 className="font-bold text-white text-base leading-none">
            {booking.serviceId?.name || 'Service Appointment'}
          </h3>
          <p className="text-zinc-400 text-xs flex items-center gap-1 font-medium pt-1">
            <MapPin className="h-3 w-3 text-zinc-550" />
            {booking.businessId?.name || 'Business'}
          </p>
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
      </CardHeader>
      <CardContent className="space-y-3 py-2 text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-300">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            <span>{formatDisplayDate(booking.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <User className="h-3.5 w-3.5 text-zinc-500" />
            <span>Practitioner: <strong className="text-white font-semibold">{booking.staffId?.name || 'Any'}</strong></span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t border-zinc-850 flex justify-end">
        {isCancellationAllowed() ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onCancel(booking._id)}
            className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 h-8 text-xs"
            disabled={isCancelling}
          >
            {isCancelling ? 'Processing...' : 'Cancel Appointment'}
          </Button>
        ) : booking.status === 'confirmed' ? (
          <span className="text-[10px] text-zinc-500 italic select-none">
            Cancellation locked (&lt; 1hr left)
          </span>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default CustomerBookingCard;
