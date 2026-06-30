import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 font-sans bg-zinc-950 text-zinc-100">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-800/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-900/20 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-850 bg-zinc-900/50 backdrop-blur-md text-xs font-medium text-zinc-300">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          Simplifying scheduling for businesses and clients
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Book appointments at your favourite local businesses.
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          BookMySlot is the all-in-one reservation console. Reserve time slots with top practitioners, track bookings, and manage slots seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-zinc-950 font-bold rounded-md hover:bg-amber-600 transition-all text-sm group"
          >
            Register Your Business
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-md font-bold text-sm text-zinc-200 transition-all"
          >
            Login to Workspace
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
