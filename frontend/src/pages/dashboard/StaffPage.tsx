import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StaffCard } from '@/components/staff/StaffCard';
import { StaffForm } from '@/components/staff/StaffForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Staff {
  _id: string;
  name: string;
  title?: string;
  serviceIds: string[];
  workingHours: Array<{ day: string; start: string; end: string }>;
  isActive: boolean;
}

interface Service {
  _id: string;
  name: string;
}

export const StaffPage: React.FC = () => {
  const { token } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const staffResponse = await fetch(`${API_BASE_URL}/staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const staffResData = await staffResponse.json();

      const servicesResponse = await fetch(`${API_BASE_URL}/services`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const servicesResData = await servicesResponse.json();

      if (staffResData.success && servicesResData.success) {
        setStaffList(staffResData.data);
        setServices(servicesResData.data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error loading staff profiles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateClick = () => {
    setEditingStaff(null);
    setIsOpen(true);
  };

  const handleEditClick = (staff: Staff) => {
    setEditingStaff(staff);
    setIsOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = editingStaff
        ? `${API_BASE_URL}/staff/${editingStaff._id}`
        : `${API_BASE_URL}/staff`;
      const method = editingStaff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const resData = await response.json();
      if (resData.success) {
        toast.success(editingStaff ? 'Staff profile updated' : 'Staff member registered');
        setIsOpen(false);
        fetchData();
      } else {
        toast.error(resData.error?.message || 'Failed to save staff profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save staff profile due to connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    setIsDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success('Staff member deleted successfully');
        fetchData();
      } else {
        toast.error(resData.error?.message || 'Failed to delete staff member');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error deleting staff member');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Staff Roster</h1>
          <p className="text-zinc-400 text-sm">
            Manage your service staff profiles and customized schedules.
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="bg-white text-zinc-950 hover:bg-zinc-200 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20 text-zinc-500 text-sm">
          No staff members onboarded yet. Click "Add Staff" to start.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffList.map((staff) => (
            <StaffCard
              key={staff._id}
              staff={staff}
              services={services}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              isDeletingId={isDeletingId}
            />
          ))}
        </div>
      )}

      {/* dialog view for adding/editing staff */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingStaff ? 'Edit Staff Profile' : 'Onboard New Staff'}
            </DialogTitle>
          </DialogHeader>
          <StaffForm
            onSubmit={handleFormSubmit}
            services={services}
            initialData={editingStaff}
            onCancel={() => setIsOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPage;
