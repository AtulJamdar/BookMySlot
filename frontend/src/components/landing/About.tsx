import React from 'react';
import { Target, ShieldCheck, Zap } from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To provide absolute scheduling convenience for Indian local businesses and their customers, reducing downtime and streamlining customer queues.'
    },
    {
      icon: Zap,
      title: 'Speed & Reliability',
      description: 'Powered by highly optimized backend scheduling algorithms that calculate and allocate appointment slots instantly with zero overlap.'
    },
    {
      icon: ShieldCheck,
      title: 'Data Privacy & Safety',
      description: 'Robust tenant isolation guarantees that business data, customer details, and transaction logs are kept completely secure and isolated.'
    }
  ];

  const stats = [
    { value: '15,000+', label: 'Slots Scheduled' },
    { value: '99.99%', label: 'Platform Uptime' },
    { value: '500+', label: 'Active Service Providers' }
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center bg-white dark:bg-zinc-950 font-sans relative overflow-hidden py-16">
      <div className="max-w-5xl mx-auto px-6 space-y-16 relative z-10 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">
              About Our Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
              Bridging the gap between service providers and clients.
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              BookMySlot was built with local practitioners in mind. Whether you manage a busy wellness clinic, a salon, or consult clients hourly, our tools simplify your administration so you can focus on what you do best.
            </p>
          </div>

          <div className="grid gap-6">
            {values.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-4 p-5 rounded-lg border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-zinc-950 dark:text-white text-sm">{item.title}</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aggregate Stats Section */}
        <div className="grid grid-cols-3 gap-4 py-8 border-t border-zinc-200 dark:border-zinc-900 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-zinc-500 dark:text-zinc-550 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
