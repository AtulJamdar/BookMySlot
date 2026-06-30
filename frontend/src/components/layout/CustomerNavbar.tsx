import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Calendar, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export const CustomerNavbar: React.FC = () => {
  const { logout, user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-zinc-900 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 font-sans">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center text-zinc-950 font-bold text-lg">
            B
          </div>
          <span className="text-zinc-950 dark:text-white font-extrabold tracking-tight text-base">BookMySlot</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && (
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all mr-2"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  My Bookings
                </Link>
              )}
              {user?.role === 'business_owner' && (
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all mr-2"
                >
                  Dashboard
                </Link>
              )}
              {user?.role === 'super_admin' && (
                <Link
                  to="/admin"
                  className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all mr-2"
                >
                  Admin Console
                </Link>
              )}
              <span className="text-xs text-zinc-300 dark:text-zinc-800 hidden sm:inline mr-2">|</span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-bold transition-all">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-200 rounded text-xs font-bold hover:bg-zinc-800 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all ml-1 cursor-pointer flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default CustomerNavbar;
