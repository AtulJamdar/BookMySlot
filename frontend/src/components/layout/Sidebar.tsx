import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Scissors,
  Users,
  Clock,
  Calendar,
  LogOut,
  Settings
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Services', path: '/dashboard/services', icon: Scissors },
    { label: 'Staff Members', path: '/dashboard/staff', icon: Users },
    { label: 'Time Slots', path: '/dashboard/slots', icon: Clock },
    { label: 'Bookings', path: '/dashboard/bookings', icon: Calendar },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-850 flex flex-col min-h-screen text-zinc-300 font-sans">
      {/* Brand header */}
      <div className="p-6 border-b border-zinc-850 flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center text-zinc-950 font-bold text-lg">
          B
        </div>
        <div>
          <h1 className="text-white font-bold tracking-tight text-base leading-none">BookMySlot</h1>
          <span className="text-[10px] text-zinc-555 font-medium uppercase tracking-wider">Business Hub</span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                  : 'hover:bg-zinc-900/60 hover:text-zinc-150'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-amber-450' : 'text-zinc-550 group-hover:text-zinc-300'
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User profile section at the bottom */}
      <div className="p-4 border-t border-zinc-850 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold uppercase text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all group"
        >
          <LogOut className="h-4 w-4 text-zinc-500 group-hover:text-red-400 transition-transform group-hover:translate-x-0.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
