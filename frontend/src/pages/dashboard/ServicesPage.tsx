import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ServiceTable } from '@/components/services/ServiceTable';
import type { Service } from '@/components/services/ServiceTable';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const ServicesPage: React.FC = () => {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchServices = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setServices(resData.data);
      } else {
        toast.error(resData.error?.message || 'Failed to fetch services');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error loading services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleCreateClick = () => {
    setEditingService(null);
    setIsOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setIsOpen(true);
  };

  const handleFormSubmit = async (data: { name: string; description: string; durationMinutes: number; priceINR: number }) => {
    setIsSubmitting(true);
    try {
      const url = editingService
        ? `${API_BASE_URL}/services/${editingService._id}`
        : `${API_BASE_URL}/services`;
      const method = editingService ? 'PUT' : 'POST';

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
        toast.success(editingService ? 'Service updated successfully' : 'Service created successfully');
        setIsOpen(false);
        fetchServices();
      } else {
        toast.error(resData.error?.message || 'Failed to save service');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save service due to connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setIsDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success('Service deleted successfully');
        fetchServices();
      } else {
        toast.error(resData.error?.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error deleting service');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Services Catalog</h1>
          <p className="text-zinc-400 text-sm">
            Manage the appointment services offered by your business.
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="bg-white text-zinc-950 hover:bg-zinc-200 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <ServiceTable
          services={services}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isDeletingId={isDeletingId}
        />
      )}

      {/* dialog view for adding/editing services */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm
            onSubmit={handleFormSubmit}
            initialData={editingService}
            onCancel={() => setIsOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
