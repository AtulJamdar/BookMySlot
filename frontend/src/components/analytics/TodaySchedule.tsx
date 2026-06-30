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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Booking {
  _id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  serviceId: {
    name: string;
  };
  staffId: {
    name: string;
  };
}

interface TodayScheduleProps {
  bookings: Booking[];
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ bookings }) => {
  return (
    <Card className="border-zinc-800 bg-zinc-900/40 text-zinc-100 font-sans shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base font-bold">Today's Schedule</CardTitle>
        <CardDescription className="text-zinc-550 text-xs">
          Your upcoming appointments for today.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-zinc-555 text-xs italic">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950/20 max-h-[280px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-b border-zinc-850">
                <TableRow className="border-b border-zinc-850 hover:bg-transparent">
                  <TableHead className="text-zinc-500 font-bold text-[10px] uppercase h-9">Time</TableHead>
                  <TableHead className="text-zinc-500 font-bold text-[10px] uppercase h-9">Customer</TableHead>
                  <TableHead className="text-zinc-500 font-bold text-[10px] uppercase h-9">Service</TableHead>
                  <TableHead className="text-zinc-500 font-bold text-[10px] uppercase h-9">Staff</TableHead>
                  <TableHead className="text-zinc-500 font-bold text-[10px] uppercase h-9">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-zinc-200">
                {bookings
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((booking) => (
                    <TableRow key={booking._id} className="border-b border-zinc-850 hover:bg-zinc-900/30">
                      <TableCell className="font-semibold text-xs text-white py-2.5">
                        {booking.startTime}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white text-xs">{booking.customerName}</p>
                          <p className="text-[9px] text-zinc-550">{booking.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-300 py-2.5">
                        {booking.serviceId?.name || 'Service'}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-300 py-2.5">
                        {booking.staffId?.name || 'Practitioner'}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge
                          className={`text-[9px] py-0.5 px-1.5 rounded ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaySchedule;
