import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/10 font-sans">
      {Icon && (
        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 mb-4">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-zinc-550 mt-1 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
