import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  const [regType, setRegType] = useState<'customer' | 'owner'>('owner');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Business fields (for owner)
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('salon');
  const [city, setCity] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerOwner, registerCustomer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !phone) {
      toast.error('Validation Error', { description: 'Please fill in all user profile fields' });
      return;
    }
    if (password.length < 8) {
      toast.error('Validation Error', { description: 'Password must be at least 8 characters' });
      return;
    }
    
    if (regType === 'owner' && (!businessName || !city)) {
      toast.error('Validation Error', { description: 'Please fill in all business details' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (regType === 'owner') {
        await registerOwner({
          name,
          email,
          password,
          phone,
          businessName,
          category,
          city
        });
        toast.success('Registration successful!', { description: 'Your business is onboarded.' });
        navigate('/dashboard');
      } else {
        await registerCustomer({
          name,
          email,
          password,
          phone
        });
        toast.success('Registration successful!', { description: 'Your customer account is created.' });
        navigate('/my-bookings');
      }
    } catch (error: any) {
      toast.error('Registration Failed', { description: error.message || 'Error occurred during registration.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black -z-10" />
      
      <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl text-zinc-100 my-8">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center text-white">
            Create an Account
          </CardTitle>
          <CardDescription className="text-zinc-400 text-center">
            Register as a local business owner or a customer
          </CardDescription>
          
          {/* Registration type selector tabs */}
          <div className="grid w-full grid-cols-2 p-1 bg-zinc-950/80 rounded-md border border-zinc-800 mt-4">
            <button
              type="button"
              onClick={() => setRegType('owner')}
              className={`py-1.5 text-sm font-bold rounded transition-all ${
                regType === 'owner' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Register Business
            </button>
            <button
              type="button"
              onClick={() => setRegType('customer')}
              className={`py-1.5 text-sm font-bold rounded transition-all ${
                regType === 'customer' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Customer Sign Up
            </button>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* User details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                User Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-zinc-300 text-xs">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 text-sm focus-visible:ring-zinc-750"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-zinc-300 text-xs">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 text-sm focus-visible:ring-zinc-750"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-300 text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 text-sm focus-visible:ring-zinc-750"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-zinc-300 text-xs">Password (min. 8 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 text-sm focus-visible:ring-zinc-750"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Business details - owner specific */}
            {regType === 'owner' && (
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Business Specifications
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-zinc-300 text-xs">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Sunshine Spa & Salon"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 text-sm focus-visible:ring-zinc-750"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-zinc-300 text-xs">Category</Label>
                    <Select
                      value={category}
                      onValueChange={(val) => setCategory(val)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="border-zinc-800 bg-zinc-950/60 text-zinc-100 text-sm focus-visible:ring-zinc-750">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                        <SelectItem value="salon" className="focus:bg-zinc-800 focus:text-white">Salon & Spa</SelectItem>
                        <SelectItem value="clinic" className="focus:bg-zinc-800 focus:text-white">Clinic & Healthcare</SelectItem>
                        <SelectItem value="coaching" className="focus:bg-zinc-800 focus:text-white">Coaching & Education</SelectItem>
                        <SelectItem value="other" className="focus:bg-zinc-800 focus:text-white">Other Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-zinc-300 text-xs">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Pune"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-650 text-sm focus-visible:ring-zinc-750"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-600 transition-all font-bold py-2 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  Registering Account...
                </span>
              ) : (
                'Register Account'
              )}
            </Button>
            <div className="text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:underline font-medium">
                Login here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
