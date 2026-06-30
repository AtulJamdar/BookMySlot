import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Showcase from '../components/landing/Showcase';
import About from '../components/landing/About';
import FAQ from '../components/landing/FAQ';
import Testimonials from '../components/landing/Testimonials';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1">
        <Hero />
        <Showcase />
        <Features />
        <About />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
