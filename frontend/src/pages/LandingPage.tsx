import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1">
        <Hero />
        <Features />
      </main>

      <footer className="border-t border-zinc-900 py-8 bg-zinc-950 text-center text-[10px] text-zinc-500 tracking-wider uppercase font-medium">
        © {new Date().getFullYear()} BookMySlot Platform. All Rights Reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
