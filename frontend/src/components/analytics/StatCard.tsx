import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon
}) => {
  return (
    <Card className="border-zinc-800 bg-zinc-900/40 shadow-lg text-zinc-100 font-sans">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-450 uppercase tracking-wider">
            {title}
          </p>
          {icon && <div className="text-zinc-500">{icon}</div>}
        </div>
        <div className="mt-2">
          <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
          {description && (
            <p className="text-[10px] text-zinc-500 font-medium mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
