import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ServiceFormProps {
  onSubmit: (data: { name: string; description: string; durationMinutes: number; priceINR: number }) => Promise<void>;
  initialData?: { name: string; description?: string; durationMinutes: number; priceINR: number } | null;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  isSubmitting
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priceINR, setPriceINR] = useState(0);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setDurationMinutes(initialData.durationMinutes);
      setPriceINR(initialData.priceINR);
    } else {
      setName('');
      setDescription('');
      setDurationMinutes(30);
      setPriceINR(0);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      durationMinutes: Number(durationMinutes),
      priceINR: Number(priceINR)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-zinc-100">
      <div className="space-y-1.5">
        <Label htmlFor="service-name" className="text-zinc-300 text-xs">Service Name</Label>
        <Input
          id="service-name"
          type="text"
          placeholder="e.g. Haircut & Styling"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus-visible:ring-zinc-700"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="service-desc" className="text-zinc-300 text-xs">Description (Optional)</Label>
        <textarea
          id="service-desc"
          placeholder="Describe the service details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-h-[80px] rounded-md border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:opacity-50"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="service-duration" className="text-zinc-300 text-xs">Duration</Label>
          <select
            id="service-duration"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value={15}>15 Minutes</option>
            <option value={30}>30 Minutes</option>
            <option value={45}>45 Minutes</option>
            <option value={60}>1 Hour</option>
            <option value={75}>1 Hour 15 Min</option>
            <option value={90}>1.5 Hours</option>
            <option value={120}>2 Hours</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-price" className="text-zinc-300 text-xs">Price (INR)</Label>
          <Input
            id="service-price"
            type="number"
            min={0}
            placeholder="300"
            value={priceINR}
            onChange={(e) => setPriceINR(Number(e.target.value))}
            className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus-visible:ring-zinc-700"
            disabled={isSubmitting}
            required
          />
        </div>
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
            'Save Service'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
