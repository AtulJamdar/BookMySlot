import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface Staff {
  _id: string;
  name: string;
  title?: string;
}

interface StaffSelectorProps {
  staffList: Staff[];
  selectedStaffId: string | null;
  onSelect: (id: string) => void;
}

export const StaffSelector: React.FC<StaffSelectorProps> = ({
  staffList,
  selectedStaffId,
  onSelect
}) => {
  return (
    <div className="space-y-3 font-sans">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pl-1">
        Choose a Practitioner
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Any Staff option */}
        <Card
          onClick={() => onSelect('any')}
          className={`border transition-all cursor-pointer select-none text-zinc-100 ${
            selectedStaffId === 'any' || selectedStaffId === null
              ? 'border-white bg-zinc-900 shadow-lg'
              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
          }`}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-850 flex items-center justify-center text-zinc-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Any Practitioner</h4>
              <p className="text-zinc-500 text-xs">Broadest scheduling availability</p>
            </div>
          </CardContent>
        </Card>

        {/* Individual staff members */}
        {staffList.map((staff) => {
          const isSelected = selectedStaffId === staff._id;
          return (
            <Card
              key={staff._id}
              onClick={() => onSelect(staff._id)}
              className={`border transition-all cursor-pointer select-none text-zinc-100 ${
                isSelected
                  ? 'border-white bg-zinc-900 shadow-lg'
                  : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
              }`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold uppercase text-xs">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{staff.name}</h4>
                  <p className="text-zinc-500 text-xs">{staff.title || 'Specialist'}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StaffSelector;
