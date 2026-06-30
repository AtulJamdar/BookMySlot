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
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface Business {
  _id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

interface BusinessTableProps {
  businesses: Business[];
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>;
  isTogglingId: string | null;
}

export const BusinessTable: React.FC<BusinessTableProps> = ({
  businesses,
  onToggleStatus,
  isTogglingId
}) => {
  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950/40 overflow-hidden font-sans">
      <Table>
        <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
          <TableRow className="border-b border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Name</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Category</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">City</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Status</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11">Registered On</TableHead>
            <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider h-11 text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-zinc-150">
          {businesses.map((bus) => (
            <TableRow
              key={bus._id}
              className="border-b border-zinc-800 hover:bg-zinc-900/40 transition-colors"
            >
              <TableCell className="font-bold text-white text-xs py-3">
                {bus.name}
              </TableCell>
              <TableCell className="text-xs text-zinc-300 capitalize">{bus.category}</TableCell>
              <TableCell className="text-xs text-zinc-300">{bus.city}</TableCell>
              <TableCell>
                <Badge
                  className={
                    bus.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded'
                      : 'bg-red-500/10 text-red-400 border-red-500/20 rounded'
                  }
                >
                  {bus.isActive ? 'Active' : 'Suspended'}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-zinc-450">
                {formatDisplayDate(bus.createdAt)}
              </TableCell>
              <TableCell className="text-right pr-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleStatus(bus._id, bus.isActive)}
                  className={`h-8 text-xs gap-1.5 ${
                    bus.isActive
                      ? 'text-red-400 hover:text-red-305 hover:bg-red-500/10'
                      : 'text-emerald-400 hover:text-emerald-305 hover:bg-emerald-500/10'
                  }`}
                  disabled={isTogglingId === bus._id}
                >
                  {isTogglingId === bus._id ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : bus.isActive ? (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Suspend
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Reactivate
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BusinessTable;
