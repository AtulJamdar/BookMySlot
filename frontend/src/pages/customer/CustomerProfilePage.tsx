import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="text-zinc-400 text-xs">
          View your personal details and account settings.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-900/25 p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-zinc-850 border border-zinc-700 flex items-center justify-center text-white font-extrabold uppercase text-xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">{user?.name}</CardTitle>
              <CardDescription className="text-zinc-400 text-xs capitalize">{user?.role?.replace('_', ' ')} Account</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3 w-3 text-zinc-550" /> Full Name
              </span>
              <p className="text-sm font-medium text-white bg-zinc-950 border border-zinc-900 rounded p-2.5">{user?.name}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-zinc-550" /> Email Address
              </span>
              <p className="text-sm font-medium text-white bg-zinc-950 border border-zinc-900 rounded p-2.5 truncate">{user?.email}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-zinc-550" /> Phone Number
              </span>
              <p className="text-sm font-medium text-white bg-zinc-950 border border-zinc-900 rounded p-2.5">{user?.phone || 'Not Provided'}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-zinc-550" /> Account Status
              </span>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-450 bg-emerald-500/5 border border-emerald-500/10 rounded p-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Active and Verified
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfilePage;
