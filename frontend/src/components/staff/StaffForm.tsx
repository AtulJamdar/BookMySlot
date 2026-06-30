import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Service {
  _id: string;
  name: string;
}

interface WorkingHour {
  day: string;
  start: string;
  end: string;
}

interface Staff {
  _id: string;
  name: string;
  title?: string;
  serviceIds: string[];
  workingHours: WorkingHour[];
  isActive: boolean;
}

interface StaffFormProps {
  onSubmit: (data: { name: string; title: string; serviceIds: string[]; workingHours: WorkingHour[] }) => Promise<void>;
  services: Service[];
  initialData?: Staff | null;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const StaffForm: React.FC<StaffFormProps> = ({
  onSubmit,
  services,
  initialData,
  onCancel,
  isSubmitting
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, { active: boolean; start: string; end: string }>>({
    monday: { active: true, start: '09:00', end: '18:00' },
    tuesday: { active: true, start: '09:00', end: '18:00' },
    wednesday: { active: true, start: '09:00', end: '18:00' },
    thursday: { active: true, start: '09:00', end: '18:00' },
    friday: { active: true, start: '09:00', end: '18:00' },
    saturday: { active: true, start: '09:00', end: '18:00' },
    sunday: { active: false, start: '09:00', end: '18:00' }
  });

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTitle(initialData.title || '');
      setSelectedServiceIds(initialData.serviceIds);
      
      if (initialData.workingHours && initialData.workingHours.length > 0) {
        setUseCustomSchedule(true);
        const newSchedule = { ...schedule };
        Object.keys(newSchedule).forEach(day => {
          newSchedule[day] = { ...newSchedule[day], active: false };
        });
        initialData.workingHours.forEach(h => {
          newSchedule[h.day] = { active: true, start: h.start, end: h.end };
        });
        setSchedule(newSchedule);
      } else {
        setUseCustomSchedule(false);
      }
    } else {
      setName('');
      setTitle('');
      setSelectedServiceIds([]);
      setUseCustomSchedule(false);
    }
  }, [initialData]);

  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleScheduleChange = (day: string, field: 'active' | 'start' | 'end', value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const workingHours: WorkingHour[] = [];
    if (useCustomSchedule) {
      Object.entries(schedule).forEach(([day, val]) => {
        if (val.active) {
          workingHours.push({
            day,
            start: val.start,
            end: val.end
          });
        }
      });
    }

    onSubmit({
      name,
      title,
      serviceIds: selectedServiceIds,
      workingHours
    });
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-zinc-100 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-1.5">
        <Label htmlFor="staff-name" className="text-zinc-300 text-xs">Full Name</Label>
        <Input
          id="staff-name"
          type="text"
          placeholder="e.g. Alice Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 focus-visible:ring-zinc-750"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="staff-title" className="text-zinc-300 text-xs">Professional Title</Label>
        <Input
          id="staff-title"
          type="text"
          placeholder="e.g. Senior Hair Stylist / Therapist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 focus-visible:ring-zinc-750"
          disabled={isSubmitting}
        />
      </div>

      {/* Services Checkboxes */}
      <div className="space-y-2">
        <Label className="text-zinc-300 text-xs">Assigned Services</Label>
        <div className="grid grid-cols-2 gap-2 border border-zinc-800 bg-zinc-950/40 p-3 rounded-md max-h-[120px] overflow-y-auto">
          {services.map((s) => (
            <label key={s._id} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServiceIds.includes(s._id)}
                onChange={() => handleServiceToggle(s._id)}
                className="rounded border-zinc-800 bg-zinc-950 text-zinc-50 focus:ring-zinc-800 h-4 w-4"
                disabled={isSubmitting}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      {/* Custom Schedule */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={useCustomSchedule}
            onChange={(e) => setUseCustomSchedule(e.target.checked)}
            className="rounded border-zinc-800 bg-zinc-950 text-zinc-50 focus:ring-zinc-800 h-4 w-4"
            disabled={isSubmitting}
          />
          Configure Custom Schedule (Overrides business hours)
        </label>

        {useCustomSchedule && (
          <div className="space-y-2 border border-zinc-800 bg-zinc-950/40 p-3 rounded-md">
            <div className="grid grid-cols-7 text-[10px] text-zinc-550 font-bold uppercase pb-1 border-b border-zinc-850">
              <span className="col-span-2">Day</span>
              <span className="col-span-1 text-center">Active</span>
              <span className="col-span-2 text-center">Start</span>
              <span className="col-span-2 text-center">End</span>
            </div>
            <div className="space-y-2 mt-2">
              {daysOfWeek.map((day) => {
                const item = schedule[day];
                return (
                  <div key={day} className="grid grid-cols-7 items-center text-xs text-zinc-300 gap-1">
                    <span className="col-span-2 capitalize font-medium">{day.slice(0, 3)}</span>
                    <span className="col-span-1 text-center">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={(e) => handleScheduleChange(day, 'active', e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-950 focus:ring-zinc-800 h-4 w-4"
                        disabled={isSubmitting}
                      />
                    </span>
                    <input
                      type="text"
                      value={item.start}
                      onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                      className="col-span-2 bg-zinc-950 border border-zinc-800 text-zinc-200 text-center rounded py-0.5"
                      placeholder="09:00"
                      disabled={!item.active || isSubmitting}
                    />
                    <input
                      type="text"
                      value={item.end}
                      onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                      className="col-span-2 bg-zinc-950 border border-zinc-800 text-zinc-200 text-center rounded py-0.5"
                      placeholder="18:00"
                      disabled={!item.active || isSubmitting}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
              Saving...
            </span>
          ) : (
            'Save Staff'
          )}
        </Button>
      </div>
    </form>
  );
};

export default StaffForm;
