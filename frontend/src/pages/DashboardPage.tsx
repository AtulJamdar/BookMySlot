import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Scissors, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Bookings', value: '18', change: '+12% from last week', icon: Calendar, color: 'text-blue-500' },
    { label: 'Active Services', value: '6', change: '2 created recently', icon: Scissors, color: 'text-purple-500' },
    { label: 'Staff Members', value: '4', change: 'All active', icon: Users, color: 'text-emerald-500' },
    { label: 'Platform Rating', value: '4.8', change: 'Based on 24 reviews', icon: TrendingUp, color: 'text-amber-500' }
  ];

  return (
    <div className="space-y-8 font-sans text-zinc-100">
      {/* Header welcome banner */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back, {user?.name || 'Partner'}
        </h1>
        <p className="text-zinc-400">
          Here is what's happening with your business appointments today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-zinc-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-zinc-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder content sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-zinc-100">
          <CardHeader>
            <CardTitle className="text-white text-lg">Upcoming Appointments</CardTitle>
            <CardDescription className="text-zinc-500">
              A list of slots booked by clients for this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-[200px] items-center justify-center text-zinc-550 border border-dashed border-zinc-800 rounded-md m-6 mt-0">
            <p className="text-sm">No upcoming bookings for today.</p>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-zinc-100">
          <CardHeader>
            <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-zinc-500">
              Common business management shortcuts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <button className="text-left w-full px-4 py-2.5 bg-zinc-800/80 hover:bg-zinc-800 rounded-md text-sm font-medium text-white border border-zinc-800 transition-all">
                Configure Working Hours
              </button>
              <button className="text-left w-full px-4 py-2.5 bg-zinc-800/80 hover:bg-zinc-800 rounded-md text-sm font-medium text-white border border-zinc-800 transition-all">
                Manage Appointment Services
              </button>
              <button className="text-left w-full px-4 py-2.5 bg-zinc-800/80 hover:bg-zinc-800 rounded-md text-sm font-medium text-white border border-zinc-800 transition-all">
                Add New Staff Member
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
