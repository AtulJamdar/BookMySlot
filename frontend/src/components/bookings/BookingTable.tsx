import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

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

interface BookingTableProps {
  bookings: Booking[];
  onViewDetail: (booking: Booking) => void;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onViewDetail
}) => {
  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950/40 overflow-hidden font-sans">
      <Table>
        <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
          <TableRow className="border-b border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Ref</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Customer</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Service</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Practitioner</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Schedule</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Status</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11 text-right pr-4">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-zinc-150">
          {bookings.map((booking) => (
            <TableRow
              key={booking._id}
              className="border-b border-zinc-800 hover:bg-zinc-900/40 transition-colors"
            >
              <TableCell className="font-mono text-white font-bold text-xs">
                {booking.bookingRef}
              </TableCell>
              <TableCell className="py-3">
                <div className="space-y-0.5">
                  <p className="font-bold text-white text-xs">{booking.customerName}</p>
                  <p className="text-[10px] text-zinc-550 font-medium">{booking.customerPhone}</p>
                </div>
              </TableCell>
              <TableCell className="text-xs font-semibold text-white">
                {booking.serviceId?.name || 'Unknown Service'}
              </TableCell>
              <TableCell className="text-xs text-zinc-300">
                {booking.staffId?.name || 'Unknown Staff'}
              </TableCell>
              <TableCell className="py-3">
                <div className="space-y-0.5">
                  <p className="font-medium text-white text-xs">{formatDisplayDate(booking.date)}</p>
                  <p className="text-[10px] text-zinc-550 font-bold">{booking.startTime} - {booking.endTime}</p>
                </div>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-right pr-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetail(booking)}
                  className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-805 h-8 text-xs gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingTable;
