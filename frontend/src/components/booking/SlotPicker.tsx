import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface AvailableSlot {
  startTime: string;
  endTime: string;
  staffId: string;
}

interface SlotPickerProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  slots: AvailableSlot[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  isLoadingSlots: boolean;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  selectedDate,
  onSelectDate,
  slots,
  selectedTime,
  onSelectTime,
  isLoadingSlots
}) => {
  const handleDateSelect = (date: Date | undefined) => {
    onSelectDate(date);
  };

  const formatDateString = (d: Date | undefined) => {
    if (!d) return '';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 font-sans text-zinc-100">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pl-1">
        Select Date & Time
      </h3>
      <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
        {/* Calendar Picker Panel */}
        <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-950/40 backdrop-blur-md">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="text-zinc-100"
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
          />
        </div>

        {/* Time Slot Grid Panel */}
        <div className="flex-1 w-full space-y-3">
          <div className="border-b border-zinc-800 pb-2">
            <h4 className="font-semibold text-white text-sm">
              {selectedDate ? formatDateString(selectedDate) : 'No date selected'}
            </h4>
            <p className="text-xs text-zinc-550">Select an appointment time interval below</p>
          </div>

          {isLoadingSlots ? (
            <div className="flex h-40 items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border border-white border-t-transparent" />
            </div>
          ) : !selectedDate ? (
            <div className="text-center py-12 text-zinc-550 text-xs italic">
              Please choose a date from the calendar to check available times.
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-zinc-550 text-xs italic">
              No appointments available for this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {slots
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((slot) => {
                  const isSelected = selectedTime === slot.startTime;
                  return (
                    <Button
                      key={slot.startTime}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => onSelectTime(slot.startTime)}
                      className={`h-9 text-xs transition-all ${
                        isSelected
                          ? 'bg-white text-zinc-950 hover:bg-zinc-200 border-white'
                          : 'border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {slot.startTime}
                    </Button>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotPicker;
