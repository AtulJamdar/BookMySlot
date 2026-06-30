import React from 'react';
import { StatCard } from '@/components/analytics/StatCard';
import { Store, CalendarCheck, Activity, Percent } from 'lucide-react';

interface PlatformStatsProps {
  stats: {
    totalBusinesses: number;
    totalBookings: number;
    bookingsToday: number;
    globalCancellationRate: number;
  };
}

export const PlatformStats: React.FC<PlatformStatsProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-sans">
      <StatCard
        title="Businesses"
        value={stats.totalBusinesses}
        description="Total registered tenants"
        icon={<Store className="h-4 w-4" />}
      />
      <StatCard
        title="Total Bookings"
        value={stats.totalBookings}
        description="Lifetime platform appointments"
        icon={<CalendarCheck className="h-4 w-4" />}
      />
      <StatCard
        title="Bookings Today"
        value={stats.bookingsToday}
        description="Appointments scheduled for today"
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Cancellation Rate"
        value={`${stats.globalCancellationRate}%`}
        description="Average platform cancellation rate"
        icon={<Percent className="h-4 w-4" />}
      />
    </div>
  );
};

export default PlatformStats;
