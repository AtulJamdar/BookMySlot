import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

export interface Service {
  _id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceINR: number;
  isActive: boolean;
}

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  isDeletingId: string | null;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  onEdit,
  onDelete,
  isDeletingId,
}) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20 text-zinc-500 text-sm">
        No services created yet. Click "Add Service" to start.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 overflow-hidden font-sans">
      <Table>
        <TableHeader className="bg-zinc-950/80 border-b border-zinc-800">
          <TableRow className="hover:bg-transparent border-b-0">
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider h-11">Service Name</TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider h-11">Description</TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider h-11">Duration</TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider h-11">Price</TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider h-11 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service._id} className="border-b border-zinc-850 hover:bg-zinc-900/30 transition-colors">
              <TableCell className="font-semibold text-white text-sm py-4">{service.name}</TableCell>
              <TableCell className="text-zinc-450 text-sm py-4 max-w-xs truncate">
                {service.description || <span className="text-zinc-600 italic">No description</span>}
              </TableCell>
              <TableCell className="text-zinc-300 text-sm py-4">
                {service.durationMinutes} mins
              </TableCell>
              <TableCell className="font-medium text-white text-sm py-4">
                ₹{service.priceINR}
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(service)}
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    title="Edit Service"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(service._id)}
                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                    disabled={isDeletingId === service._id}
                    title="Delete Service"
                  >
                    {isDeletingId === service._id ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border border-red-400 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceTable;
