import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SlotCalendar } from '@/components/slots/SlotCalendar';
import { BlockSlotForm } from '@/components/slots/BlockSlotForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface BlockedSlot {
  _id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

interface Staff {
  _id: string;
  name: string;
}

export const SlotsPage: React.FC = () => {
  const { token } = useAuth();
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnblockingId, setIsUnblockingId] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const slotsResponse = await fetch(`${API_BASE_URL}/slots`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const slotsResData = await slotsResponse.json();

      const staffResponse = await fetch(`${API_BASE_URL}/staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const staffResData = await staffResponse.json();

      if (slotsResData.success && staffResData.success) {
        setSlots(slotsResData.data);
        setStaffList(staffResData.data);
      } else {
        toast.error('Failed to load scheduling data');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error loading slots planner');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleBlockClick = () => {
    if (staffList.length === 0) {
      toast.error('Requirement Error', { description: 'Please onboard at least one staff member before blocking time.' });
      return;
    }
    setIsOpen(true);
  };

  const handleFormSubmit = async (data: { staffId: string; date: string; startTime: string; endTime: string; reason: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/slots/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const resData = await response.json();
      if (resData.success) {
        toast.success('Time slot blocked successfully');
        setIsOpen(false);
        fetchData();
      } else {
        toast.error(resData.error?.message || 'Failed to block slot');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error blocking slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblock = async (id: string) => {
    setIsUnblockingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/slots/${id}/unblock`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success('Slot unblocked successfully');
        fetchData();
      } else {
        toast.error(resData.error?.message || 'Failed to unblock slot');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error unblocking slot');
    } finally {
      setIsUnblockingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Time Slots Planner</h1>
          <p className="text-zinc-400 text-sm">
            Block staff working hours to prevent booking overlaps during lunch, leaves, or meetings.
          </p>
        </div>
        <Button
          onClick={handleBlockClick}
          className="bg-white text-zinc-950 hover:bg-zinc-200 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Block Time
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <SlotCalendar
          slots={slots}
          staffList={staffList}
          onUnblock={handleUnblock}
          isUnblockingId={isUnblockingId}
        />
      )}

      {/* dialog view for blocking a slot */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Block Time Slot</DialogTitle>
          </DialogHeader>
          <BlockSlotForm
            onSubmit={handleFormSubmit}
            staffList={staffList}
            onCancel={() => setIsOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlotsPage;
