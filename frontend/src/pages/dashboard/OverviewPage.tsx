import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/analytics/StatCard';
import { PeakHoursChart } from '@/components/analytics/PeakHoursChart';
import { TodaySchedule } from '@/components/analytics/TodaySchedule';
import { CalendarCheck, DollarSign, XOctagon, Percent } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryStats {
  totalBookings: number;
  totalRevenue: number;
  cancellationCount: number;
  cancellationRate: number;
}

interface PeakHourItem {
  hour: number;
  bookingCount: number;
}

interface Booking {
  _id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  serviceId: {
    name: string;
  };
  staffId: {
    name: string;
  };
}

export const OverviewPage: React.FC = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState<SummaryStats>({
    totalBookings: 0,
    totalRevenue: 0,
    cancellationCount: 0,
    cancellationRate: 0
  });
  const [peakHours, setPeakHours] = useState<PeakHourItem[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const summaryResponse = await fetch(`${API_BASE_URL}/analytics/summary`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const summaryResData = await summaryResponse.json();

        const peakResponse = await fetch(`${API_BASE_URL}/analytics/peak-hours`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const peakResData = await peakResponse.json();

        const todayStr = new Date().toISOString().split('T')[0];
        const bookingsResponse = await fetch(`${API_BASE_URL}/bookings?date=${todayStr}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const bookingsResData = await bookingsResponse.json();

        if (summaryResData.success && peakResData.success && bookingsResData.success) {
          setSummary(summaryResData.data);
          setPeakHours(peakResData.data);
          setTodayBookings(bookingsResData.data.items || []);
        } else {
          toast.error('Failed to load summary stats');
        }
      } catch (error) {
        console.error(error);
        toast.error('Network error loading overview panels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-zinc-400 text-sm">
          Track business growth metrics, slot occupancy, and daily appointment timelines.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={summary.totalBookings}
          description="Lifetime bookings scheduled"
          icon={<CalendarCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${summary.totalRevenue.toLocaleString()}`}
          description="Sum of completed/confirmed bookings"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Cancellations"
          value={summary.cancellationCount}
          description="Appointments cancelled by clients or business"
          icon={<XOctagon className="h-4 w-4" />}
        />
        <StatCard
          title="Cancellation Rate"
          value={`${summary.cancellationRate}%`}
          description="Percentage of total cancelled appointments"
          icon={<Percent className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <PeakHoursChart data={peakHours} />
        <TodaySchedule bookings={todayBookings} />
      </div>
    </div>
  );
};

export default OverviewPage;
