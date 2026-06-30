import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 text-zinc-400 font-sans py-16">
      <div className="max-w-5xl mx-auto px-6 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        
        {/* Brand column */}
        <div className="space-y-4 col-span-1 sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center text-zinc-950 font-bold text-lg">
              B
            </div>
            <span className="text-white font-extrabold tracking-tight text-base">BookMySlot</span>
          </div>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
            Stateless scheduling framework designed for salons, clinics, consultants, and local professionals. Streamline slot generation, prevent overlaps, and delight customers.
          </p>
        </div>

        {/* Navigation links column */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold tracking-wider text-white uppercase">Product</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/register" className="hover:text-amber-500 transition-colors">Register Business</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-amber-500 transition-colors">Owner Console</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-amber-500 transition-colors">Customer Portal</Link>
            </li>
          </ul>
        </div>

        {/* Resources column */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold tracking-wider text-white uppercase">Legal & Contact</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
            </li>
            <li className="text-zinc-650">
              support@bookmyslot.in
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 mt-12 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-600 tracking-wider uppercase font-semibold gap-4">
        <span>© {new Date().getFullYear()} BookMySlot. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">GitHub</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
