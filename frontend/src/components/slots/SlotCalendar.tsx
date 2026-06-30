import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Trash2, User } from 'lucide-react';

interface BlockedSlot {
  _id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

interface Staff {
  _id: string;
  name: string;
}

interface SlotCalendarProps {
  slots: BlockedSlot[];
  staffList: Staff[];
  onUnblock: (id: string) => void;
  isUnblockingId: string | null;
}

export const SlotCalendar: React.FC<SlotCalendarProps> = ({
  slots,
  staffList,
  onUnblock,
  isUnblockingId
}) => {
  const getStaffName = (id: string) => {
    return staffList.find((s) => s._id === id)?.name || 'Unknown Staff';
  };

  const groupSlotsByDate = () => {
    const groups: Record<string, BlockedSlot[]> = {};
    slots.forEach((slot) => {
      if (!groups[slot.date]) {
        groups[slot.date] = [];
      }
      groups[slot.date].push(slot);
    });
    return groups;
  };

  const grouped = groupSlotsByDate();
  const sortedDates = Object.keys(grouped).sort();

  if (slots.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20 text-zinc-550 text-sm">
        No active blocked time slots on record. Click "Block Time" to lock a slot.
      </div>
    );
  }

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 font-sans">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
            {formatDisplayDate(date)}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[date]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((slot) => (
                <Card key={slot._id} className="border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all text-zinc-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-white">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        <p className="text-xs text-zinc-450 flex items-center gap-1">
                          <User className="h-3 w-3 text-zinc-655" />
                          {getStaffName(slot.staffId)}
                        </p>
                        {slot.reason && (
                          <p className="text-[10px] text-zinc-500 truncate max-w-[180px]" title={slot.reason}>
                            Reason: {slot.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onUnblock(slot._id)}
                      className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                      disabled={isUnblockingId === slot._id}
                      title="Unblock slot"
                    >
                      {isUnblockingId === slot._id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border border-red-400 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlotCalendar;
