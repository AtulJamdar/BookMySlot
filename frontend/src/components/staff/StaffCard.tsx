import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Calendar } from 'lucide-react';

interface Staff {
  _id: string;
  name: string;
  title?: string;
  serviceIds: string[];
  workingHours: Array<{ day: string; start: string; end: string }>;
  isActive: boolean;
}

interface Service {
  _id: string;
  name: string;
}

interface StaffCardProps {
  staff: Staff;
  services: Service[];
  onEdit: (staff: Staff) => void;
  onDelete: (id: string) => void;
  isDeletingId: string | null;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  services,
  onEdit,
  onDelete,
  isDeletingId,
}) => {
  const assignedServices = services.filter((s) => staff.serviceIds.includes(s._id));

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all shadow-lg text-zinc-100 flex flex-col justify-between font-sans">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-base leading-none">{staff.name}</h3>
          <p className="text-zinc-550 text-xs font-medium">{staff.title || 'Staff Member'}</p>
        </div>
        <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 font-medium text-[10px] rounded px-2">
          Active
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 py-2">
        {/* Services List */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Services Offered</p>
          <div className="flex flex-wrap gap-1.5 min-h-[24px]">
            {assignedServices.length > 0 ? (
              assignedServices.map((s) => (
                <Badge key={s._id} className="bg-zinc-950 text-zinc-300 border-zinc-800 text-[10px] py-0.5 px-2">
                  {s.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-zinc-600 italic">No assigned services</span>
            )}
          </div>
        </div>

        {/* Working Days */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Schedule</p>
          <p className="text-zinc-300 text-xs flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
            {staff.workingHours && staff.workingHours.length > 0 ? (
              <span>{staff.workingHours.length} days configured</span>
            ) : (
              <span className="text-zinc-500 italic">Inherits business hours</span>
            )}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-zinc-850 flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(staff)}
          className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 text-xs gap-1"
        >
          <Edit2 className="h-3 w-3" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(staff._id)}
          className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 text-xs gap-1"
          disabled={isDeletingId === staff._id}
        >
          {isDeletingId === staff._id ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-red-400 border-t-transparent" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StaffCard;
