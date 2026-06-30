import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Staff {
  _id: string;
  name: string;
}

interface BlockSlotFormProps {
  onSubmit: (data: { staffId: string; date: string; startTime: string; endTime: string; reason: string }) => Promise<void>;
  staffList: Staff[];
  onCancel: () => void;
  isSubmitting: boolean;
}

export const BlockSlotForm: React.FC<BlockSlotFormProps> = ({
  onSubmit,
  staffList,
  onCancel,
  isSubmitting
}) => {
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [staffId, setStaffId] = useState(staffList[0]?._id || '');
  const [date, setDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('14:00');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      staffId,
      date,
      startTime,
      endTime,
      reason
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-zinc-100">
      <div className="space-y-1.5">
        <Label htmlFor="block-staff" className="text-zinc-300 text-xs">Assign Staff Member</Label>
        <select
          id="block-staff"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:opacity-50"
          disabled={isSubmitting}
          required
        >
          <option value="" disabled>Select Staff</option>
          {staffList.map((staff) => (
            <option key={staff._id} value={staff._id}>
              {staff.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="block-date" className="text-zinc-300 text-xs">Date</Label>
        <Input
          id="block-date"
          type="date"
          min={getTodayString()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus-visible:ring-zinc-700 text-sm"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="block-start" className="text-zinc-300 text-xs">Start Time (HH:MM)</Label>
          <Input
            id="block-start"
            type="text"
            placeholder="13:00"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 focus-visible:ring-zinc-750 text-sm text-center"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="block-end" className="text-zinc-300 text-xs">End Time (HH:MM)</Label>
          <Input
            id="block-end"
            type="text"
            placeholder="14:00"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 focus-visible:ring-zinc-750 text-sm text-center"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="block-reason" className="text-zinc-300 text-xs">Reason / Label (Optional)</Label>
        <Input
          id="block-reason"
          type="text"
          placeholder="e.g. Lunch Break / Doctor Visit"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 focus-visible:ring-zinc-750 text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-white text-zinc-950 hover:bg-zinc-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 animate-spin rounded-full border border-zinc-950 border-t-transparent" />
              Blocking...
            </span>
          ) : (
            'Block Time'
          )}
        </Button>
      </div>
    </form>
  );
};

export default BlockSlotForm;
