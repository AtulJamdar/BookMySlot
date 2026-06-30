import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Clock, User, Clipboard } from 'lucide-react';

interface BookingConfirmationProps {
  bookingRef: string;
  businessName: string;
  serviceName: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingRef,
  businessName,
  serviceName,
  staffName,
  date,
  startTime,
  endTime
}) => {
  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 font-sans text-zinc-100 py-6 max-w-md mx-auto">
      <div className="flex flex-col items-center text-center space-y-2">
        <CheckCircle className="h-16 w-16 text-emerald-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-white tracking-tight">Booking Confirmed!</h2>
        <p className="text-zinc-400 text-sm">
          Your appointment has been successfully scheduled at <span className="text-white font-medium">{businessName}</span>.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-md text-zinc-350 shadow-xl overflow-hidden">
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 text-center">
          <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-widest mb-1">Booking Reference</p>
          <div className="flex items-center justify-center gap-1.5">
            <Badge className="bg-zinc-800 text-emerald-400 border-zinc-700 font-mono text-base px-3 py-1 rounded">
              {bookingRef}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <Clipboard className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Service</p>
              <p className="text-white font-bold text-sm">{serviceName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Practitioner</p>
              <p className="text-white font-medium">{staffName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Date</p>
              <p className="text-white font-medium">{formatDisplayDate(date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Time Range</p>
              <p className="text-white font-medium">{startTime} - {endTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-zinc-550">
          A confirmation email has been dispatched with these details.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
