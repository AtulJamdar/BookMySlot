import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 font-sans text-zinc-100">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pl-1">
        Your Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cust-name" className="text-zinc-300 text-xs">Full Name</Label>
          <Input
            id="cust-name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus-visible:ring-zinc-700 text-sm"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cust-phone" className="text-zinc-300 text-xs">Phone Number</Label>
          <Input
            id="cust-phone"
            type="tel"
            placeholder="9876543210"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus-visible:ring-zinc-700 text-sm"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cust-email" className="text-zinc-300 text-xs">Email Address</Label>
        <Input
          id="cust-email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus-visible:ring-zinc-700 text-sm"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cust-notes" className="text-zinc-300 text-xs">Special Requests / Notes (Optional)</Label>
        <textarea
          id="cust-notes"
          placeholder="Any special instructions for the practitioner..."
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          className="w-full min-h-[80px] rounded-md border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:opacity-50"
          disabled={isSubmitting}
        />
      </div>

      <div className="pt-4 border-t border-zinc-800 flex justify-end">
        <Button
          type="submit"
          className="bg-white text-zinc-950 hover:bg-zinc-200 w-full md:w-auto font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border border-zinc-950 border-t-transparent" />
              Completing Appointment...
            </span>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
