import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { StaffSelector } from '@/components/booking/StaffSelector';
import { SlotPicker } from '@/components/booking/SlotPicker';
import { CustomerForm } from '@/components/booking/CustomerForm';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { CustomerNavbar } from '@/components/layout/CustomerNavbar';

interface Business {
  _id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  description?: string;
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceINR: number;
}

interface Staff {
  _id: string;
  name: string;
  title?: string;
}

interface AvailableSlot {
  startTime: string;
  endTime: string;
  staffId: string;
}

export const BookingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  
  const [step, setStep] = useState(1);
  
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const { token, user } = useAuth();

  useEffect(() => {
    if (user) {
      setCustomerDetails(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);
  
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    const initPage = async () => {
      setIsLoadingBusiness(true);
      try {
        const busResponse = await fetch(`${API_BASE_URL}/businesses/${slug}`);
        const busResData = await busResponse.json();
        
        if (busResData.success) {
          setBusiness(busResData.data);
          
          const servResponse = await fetch(`${API_BASE_URL}/services?businessId=${busResData.data._id}`);
          const servResData = await servResponse.json();
          if (servResData.success) {
            setServices(servResData.data);
          }
        } else {
          toast.error('Business profile not found');
        }
      } catch (error) {
        console.error(error);
        toast.error('Connection error loading booking page');
      } finally {
        setIsLoadingBusiness(false);
      }
    };
    initPage();
  }, [slug]);

  const handleServiceSelect = async (id: string) => {
    setSelectedServiceId(id);
    setSelectedStaffId(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    
    try {
      const staffResponse = await fetch(`${API_BASE_URL}/staff?businessId=${business?._id}&serviceId=${id}`);
      const staffResData = await staffResponse.json();
      if (staffResData.success) {
        setStaffList(staffResData.data);
        setStep(2);
      } else {
        toast.error('Failed to load staff roster');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error loading staff members');
    }
  };

  const handleStaffSelect = (id: string) => {
    setSelectedStaffId(id);
    setSelectedDate(undefined);
    setSelectedTime('');
    setStep(3);
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (!date || !business || !selectedServiceId) return;

    setIsLoadingSlots(true);
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const staffQuery = selectedStaffId && selectedStaffId !== 'any' ? `&staffId=${selectedStaffId}` : '';
      const slotsResponse = await fetch(
        `${API_BASE_URL}/slots/available?businessId=${business._id}&serviceId=${selectedServiceId}&date=${dateStr}${staffQuery}`
      );
      const slotsResData = await slotsResponse.json();
      if (slotsResData.success) {
        setAvailableSlots(slotsResData.data);
      } else {
        toast.error('Failed to query time slots');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error fetching available slot times');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleFormChange = (field: string, val: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !selectedServiceId || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let finalStaffId = selectedStaffId;
      if (selectedStaffId === 'any' || !selectedStaffId) {
        const matchingSlot = availableSlots.find(s => s.startTime === selectedTime);
        finalStaffId = matchingSlot ? matchingSlot.staffId : (staffList[0]?._id || null);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          businessId: business._id,
          serviceId: selectedServiceId,
          staffId: finalStaffId,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          date: dateStr,
          startTime: selectedTime,
          notes: customerDetails.notes
        })
      });

      const resData = await response.json();
      if (response.status === 409) {
        toast.error('Slot No Longer Available', {
          description: 'This time slot was just booked by someone else. Please pick another slot.'
        });
        
        handleDateSelect(selectedDate);
        setSelectedTime('');
        setStep(3);
      } else if (resData.success) {
        setConfirmedBooking(resData.data);
        setStep(5);
      } else {
        toast.error(resData.error?.message || 'Failed to complete booking');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error finalizing appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (isLoadingBusiness) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent animate-pulse"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
        <p>The requested business booking page does not exist or has been deactivated.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-3xl border-zinc-800 bg-zinc-900/60 backdrop-blur-md shadow-2xl text-zinc-100 overflow-hidden">
        <div className="bg-zinc-900 border-b border-zinc-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">{business.name}</h1>
            <p className="text-xs text-zinc-400 capitalize">{business.category} • {business.city}</p>
            {business.description && (
              <p className="text-xs text-zinc-550 pt-1 font-medium">{business.description}</p>
            )}
          </div>
          <div className="flex flex-col text-xs text-zinc-400 space-y-1 md:items-end">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-zinc-600" />
              {business.city}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-zinc-600" />
              {business.phone}
            </span>
          </div>
        </div>

        <CardContent className="p-6">
          {step > 1 && step < 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStepBack}
              className="text-zinc-500 hover:text-white hover:bg-zinc-800/60 pl-0 mb-4 h-8 gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {step === 1 && (
            <ServiceSelector
              services={services}
              selectedServiceId={selectedServiceId}
              onSelect={handleServiceSelect}
            />
          )}

          {step === 2 && (
            <StaffSelector
              staffList={staffList}
              selectedStaffId={selectedStaffId}
              onSelect={handleStaffSelect}
            />
          )}

          {step === 3 && (
            <SlotPicker
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              slots={availableSlots}
              selectedTime={selectedTime}
              onSelectTime={handleTimeSelect}
              isLoadingSlots={isLoadingSlots}
            />
          )}

          {step === 4 && (
            <CustomerForm
              formData={customerDetails}
              onChange={handleFormChange}
              onSubmit={handleBookingSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 5 && confirmedBooking && (
            <BookingConfirmation
              bookingRef={confirmedBooking.bookingRef}
              businessName={business.name}
              serviceName={services.find(s => s._id === selectedServiceId)?.name || 'Service'}
              staffName={staffList.find(s => s._id === confirmedBooking.staffId)?.name || 'Practitioner'}
              date={confirmedBooking.date}
              startTime={confirmedBooking.startTime}
              endTime={confirmedBooking.endTime}
            />
          )}
        </CardContent>
      </Card>
    </main>
  </div>
  );
};

export default BookingPage;
