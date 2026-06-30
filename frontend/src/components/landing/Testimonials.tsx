import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  stars: number;
}

export const Testimonials: React.FC = () => {
  const list: Testimonial[] = [
    {
      name: 'Dr. Atul Jamdar',
      role: 'Business Owner, JA Consulting',
      avatar: 'A',
      content: 'BookMySlot has completely eliminated double bookings for my clinic. The dynamic slot generator coordinates working hours and practitioner schedules effortlessly.',
      stars: 5
    },
    {
      name: 'Rakesh Kumar',
      role: 'Independent Tech Consultant',
      avatar: 'R',
      content: 'The dashboard gives me crystal clear analytics on my weekly slot fill rates. My clients love booking directly on the portal without waiting for phone calls.',
      stars: 5
    },
    {
      name: 'Sunil Mhopare',
      role: 'Salon Director, SM Styling',
      avatar: 'S',
      content: 'Adding staff members and allocating services is incredibly simple. Our client turnover rate has improved by 25% since we onboarded.',
      stars: 5
    }
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center bg-white dark:bg-zinc-950 font-sans py-16">
      <div className="max-w-5xl mx-auto px-6 space-y-12 w-full">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">
            User Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-955 dark:text-white tracking-tight">
            Trusted by Service Professionals
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xl mx-auto">
            See how BookMySlot helps business owners organize calendars and keeps customers happy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {list.map((item, idx) => (
            <div
              key={idx}
              className="p-6 border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-xs italic leading-relaxed">
                  "{item.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-900 mt-6">
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-750 dark:text-white text-xs font-bold font-sans uppercase">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-xs leading-none">{item.name}</h4>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-550 font-medium">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
