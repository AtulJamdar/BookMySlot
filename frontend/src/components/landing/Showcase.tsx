import React, { useState } from 'react';
import { LayoutDashboard, Compass, CalendarRange } from 'lucide-react';

export const Showcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'owner' | 'customer' | 'bookings'>('owner');

  const tabs = [
    {
      id: 'owner' as const,
      label: 'Owner Dashboard',
      icon: LayoutDashboard,
      title: 'Real-Time Business Analytics Overview',
      description: 'Track key performance indicators including lifetime bookings, total revenue, cancellation metrics, and scheduling trends from a unified, modern interface.',
      image: '/dashboard.png'
    },
    {
      id: 'customer' as const,
      label: 'Customer Discovery',
      icon: Compass,
      title: 'Seamless Service & Provider Search',
      description: 'Search by provider name or services. Highlight featured businesses, list local active shops, and book slots in a single click.',
      image: '/discover.png'
    },
    {
      id: 'bookings' as const,
      label: 'Appointments Ledger',
      icon: CalendarRange,
      title: 'Detailed Administrative Bookings Grid',
      description: 'Filter bookings by date range or reservation status. View individual customer names, phone contacts, service selections, and practitioner allocations.',
      image: '/bookings.png'
    }
  ];

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="min-h-screen flex flex-col justify-center bg-white dark:bg-black border-y border-zinc-200 dark:border-zinc-900 font-sans py-16">
      <div className="max-w-5xl mx-auto px-6 space-y-12 w-full">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">
            Product Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-955 dark:text-white tracking-tight">
            Designed for Speed and Clarity
          </h2>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm max-w-xl mx-auto">
            Take a look inside the BookMySlot workspace. Our interfaces are crafted to look premium and operate smoothly on any screen.
          </p>
        </div>

        {/* Showcase interactive selector tabs */}
        <div className="flex justify-center gap-2 border-b border-zinc-200 dark:border-zinc-900 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded transition-all duration-200 border ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'text-zinc-500 dark:text-zinc-550 border-transparent hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content viewer */}
        <div className="grid md:grid-cols-3 gap-8 items-center pt-4">
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white leading-tight">
              {currentTab.title}
            </h3>
            <p className="text-zinc-650 dark:text-zinc-400 text-xs leading-relaxed">
              {currentTab.description}
            </p>
          </div>

          <div className="md:col-span-2 relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-2 shadow-2xl shadow-amber-500/5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            {/* Browser top-bar mockup */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950/70 rounded-t mb-2">
              <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-800" />
              <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-850" />
              <div className="h-2 w-2 rounded-full bg-zinc-500 dark:bg-zinc-900" />
            </div>
            
            <div className="aspect-video relative overflow-hidden rounded bg-zinc-200 dark:bg-zinc-950">
              <img
                src={currentTab.image}
                alt={currentTab.label}
                className="object-cover w-full h-full opacity-90 group-hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
