import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceINR: number;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (id: string) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServiceId,
  onSelect
}) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        No active services listed for this business.
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pl-1">
        Choose a Service
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const isSelected = selectedServiceId === service._id;
          return (
            <Card
              key={service._id}
              onClick={() => onSelect(service._id)}
              className={`border transition-all cursor-pointer select-none text-zinc-150 ${
                isSelected
                  ? 'border-white bg-zinc-900 shadow-lg'
                  : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
              }`}
            >
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">{service.name}</h4>
                  {service.description && (
                    <p className="text-zinc-400 text-xs line-clamp-2">{service.description}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-zinc-850/60 text-xs">
                  <span className="flex items-center gap-1 text-zinc-450 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {service.durationMinutes} mins
                  </span>
                  <span className="text-white font-bold text-sm">
                    ₹{service.priceINR}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceSelector;
