import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Menu, X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-900 text-zinc-100 font-sans relative">
      {/* Desktop Sidebar (visible on md and up) */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        <Sidebar onClose={() => setIsMobileOpen(false)} />
      </div>

      {/* Mobile Drawer (visible on mobile when open) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-64 h-full relative animate-in slide-in-from-left duration-200">
            <Sidebar onClose={() => setIsMobileOpen(false)} />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-[-48px] p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* click outside overlay to close */}
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* Main workspace */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger button visible only on mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 md:hidden hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-white font-semibold text-base md:text-lg truncate">
              {user?.role === 'business_owner' ? 'Business Owner Dashboard' : 'Management Portal'}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-450">
            <span className="hidden sm:flex items-center gap-2">
              Server Status: 
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-semibold text-xs uppercase">Online</span>
            </span>
          </div>
        </header>

        {/* Dynamic page viewport */}
        <main className="flex-1 overflow-y-auto bg-zinc-900 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
