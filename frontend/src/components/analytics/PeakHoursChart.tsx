import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface PeakHourItem {
  hour: number;
  bookingCount: number;
}

interface PeakHoursChartProps {
  data: PeakHourItem[];
}

export const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    displayHour: `${String(item.hour).padStart(2, '0')}:00`,
    bookings: item.bookingCount
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-2 rounded shadow-md text-xs font-sans text-zinc-300">
          <p className="font-semibold text-white">{payload[0].payload.displayHour}</p>
          <p className="mt-0.5">{payload[0].value} Confirmed Bookings</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 text-zinc-100 font-sans shadow-lg col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base font-bold">Peak Scheduling Hours</CardTitle>
        <CardDescription className="text-zinc-550 text-xs">
          Distribution of confirmed appointments grouped by time of day.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="displayHour"
              stroke="#52525b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke="#52525b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#18181b', opacity: 0.4 }} />
            <Bar dataKey="bookings" fill="#ffffff" radius={[2, 2, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PeakHoursChart;
