import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PlatformStats } from '@/components/admin/PlatformStats';
import { BusinessTable } from '@/components/admin/BusinessTable';
import { toast } from 'sonner';

interface Business {
  _id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  totalBusinesses: number;
  totalBookings: number;
  bookingsToday: number;
  globalCancellationRate: number;
}

export const AdminPage: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalBusinesses: 0,
    totalBookings: 0,
    bookingsToday: 0,
    globalCancellationRate: 0
  });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const statsResponse = await fetch(`${API_BASE_URL}/analytics/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const statsResData = await statsResponse.json();

      const busResponse = await fetch(`${API_BASE_URL}/businesses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const busResData = await busResponse.json();

      if (statsResponse.ok && busResponse.ok) {
        setStats(statsResData.data);
        setBusinesses(busResData.data);
      } else {
        toast.error('Failed to load platform settings');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error loading platform console');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsTogglingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/businesses/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success(currentStatus ? 'Business suspended' : 'Business reactivated');
        fetchAdminData();
      } else {
        toast.error(resData.error?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error updating business status');
    } finally {
      setIsTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Super Admin Console</h1>
          <p className="text-zinc-400 text-sm">
            Cross-tenant platform configurations, booking metrics, and tenant suspension lists.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent animate-pulse"></div>
          </div>
        ) : (
          <>
            <PlatformStats stats={stats} />
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white pl-0.5">Registered Tenants</h2>
              <BusinessTable
                businesses={businesses}
                onToggleStatus={handleToggleStatus}
                isTogglingId={isTogglingId}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
