import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const CustomerDiscoverPage: React.FC = () => {
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchBusinesses = async (searchVal = '') => {
    if (!token) return;
    setIsLoadingBusinesses(true);
    try {
      const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
      const response = await fetch(`${API_BASE_URL}/businesses${searchParam}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        const list = Array.isArray(resData.data)
          ? resData.data
          : (resData.data?.items || resData.data?.businesses || []);
        setBusinesses(list.filter((b: any) => b.isActive));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  // Unified initial load and debounced typing search effect
  useEffect(() => {
    if (!token) return;

    const timer = setTimeout(() => {
      fetchBusinesses(searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Discover Local Providers</h1>
          <p className="text-zinc-400 text-xs">Search and select a business below to explore services and book an appointment.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <input
            type="text"
            placeholder="Search business or service name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-zinc-750 placeholder-zinc-650 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold rounded transition-colors"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchBusinesses('');
              }}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded border border-zinc-800 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Top / Featured Businesses */}
      {!searchQuery && businesses.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="text-xs font-bold tracking-wider text-amber-500 uppercase">Top Rated / Most Booked</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[...businesses]
              .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
              .slice(0, 3)
              .map((bus) => (
                <Link
                  key={`top-${bus._id}`}
                  to={`/b/${bus.slug}`}
                  className="relative group p-5 border border-zinc-800/80 rounded-lg bg-gradient-to-br from-zinc-900/60 to-zinc-950 hover:to-zinc-900/80 hover:border-amber-500/50 transition-all flex flex-col justify-between h-40 shadow-lg shadow-amber-950/5"
                >
                  <div className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/20 text-amber-450 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    ★ Featured
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white group-hover:text-amber-400 transition-colors text-sm truncate pr-16">{bus.name}</h4>
                    <p className="text-[10px] text-zinc-550 capitalize">{bus.category} • {bus.city}</p>
                  </div>
                  
                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{bus.bookingCount || 0} active bookings</span>
                    <span className="font-extrabold text-amber-455 group-hover:underline">Book →</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* All / Search Results Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold tracking-wider text-zinc-650 uppercase">
          {searchQuery ? `Search Results (${businesses.length})` : 'All Available Providers'}
        </h3>

        {isLoadingBusinesses ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent animate-pulse"></div>
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-xs text-zinc-655 italic py-4">No matching providers found. Try another search term.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((bus) => (
              <Link
                key={bus._id}
                to={`/b/${bus.slug}`}
                className="group p-5 border border-zinc-800 rounded-lg bg-zinc-900/40 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all flex flex-col justify-between h-36"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm truncate">{bus.name}</h3>
                  <p className="text-[11px] text-zinc-500 capitalize">{bus.category} • {bus.city}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/40">
                  <span>{bus.phone}</span>
                  <span className="font-bold text-amber-500 group-hover:underline">Book Now →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDiscoverPage;
