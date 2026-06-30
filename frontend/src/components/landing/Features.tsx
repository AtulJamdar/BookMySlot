import React from 'react';
import { Store, ShieldCheck, Mail, LineChart } from 'lucide-react';

export const Features: React.FC = () => {
  const list = [
    {
      title: 'Tenant Business Portal',
      description: 'Host custom profiles, register service categories, map staff rosters, and manage availability windows.',
      icon: Store
    },
    {
      title: 'Live Availability Engine',
      description: 'Search active slots, prevention checks, and prevent scheduling overlaps using transactional logic.',
      icon: ShieldCheck
    },
    {
      title: 'Email Reminders & Alerts',
      description: 'Automated confirmations on signup, cancellation notices, apologies, and 24h cron reminders.',
      icon: Mail
    },
    {
      title: 'Analytical Performance Summary',
      description: 'Review total revenue aggregates, tracking charts, and peak hours distribution widgets.',
      icon: LineChart
    }
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center font-sans bg-amber-500 text-zinc-950 relative py-16">
      <div className="max-w-5xl mx-auto px-6 space-y-12 w-full">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Designed for Scalable Scheduling
          </h2>
          <p className="text-zinc-850 text-xs sm:text-sm max-w-md mx-auto">
            Everything you need to run appointments, coordinate staff, and grow your local business.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {list.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-lg border border-zinc-950/10 bg-zinc-950/5 hover:border-zinc-950/20 hover:bg-zinc-950/10 transition-all space-y-3"
              >
                <div className="h-9 w-9 rounded bg-zinc-950/10 border border-zinc-950/20 flex items-center justify-center text-zinc-950">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 tracking-tight">{item.title}</h3>
                <p className="text-xs text-zinc-800 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
