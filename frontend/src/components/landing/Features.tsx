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
    <section className="min-h-screen flex flex-col justify-center font-sans  bg-black dark:bg-zinc-950 text-zinc-300 relative py-24 border-t border-zinc-900/60">
      <div className="max-w-5xl mx-auto px-6 space-y-16 w-full flex-1 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Designed for Scalable Scheduling
          </h2>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Everything you need to run appointments, coordinate staff, and grow your local business.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {list.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all space-y-4 shadow-xl"
              >
                <div className="h-10 w-10 rounded bg-amber-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/10">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
