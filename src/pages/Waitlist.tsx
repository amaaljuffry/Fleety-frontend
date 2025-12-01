import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarLandingPage from '@/components/Navbar-LandingPage';
import FooterLandingPage from '@/components/Footer-LandingPage';
import { Mail, User, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { apiRequest } from '@/api/client';
import { useToast } from '@/components/ui/use-toast';

interface WaitlistFormData {
  name: string;
  email: string;
}

const Waitlist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<WaitlistFormData>({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<WaitlistFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<WaitlistFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof WaitlistFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('/api/waitlist/join', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
        }),
      });

      if (response.success) {
        setSubmitted(true);
        toast({
          title: 'Success!',
          description: 'You\'ve been added to the waitlist. Check your email for confirmation!',
          variant: 'default',
        });

        // Reset form
        setFormData({ name: '', email: '' });

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to join waitlist');
      }
    } catch (err) {
      const error = err as any;
      const message = error?.message || 'Failed to join waitlist. Please try again.';
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      console.error('Waitlist signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased font-inter flex flex-col">
      {/* Background Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/20 via-neutral-100/20 to-neutral-100/20 blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-50/20 via-neutral-50/20 to-neutral-50/20 blur-3xl opacity-30"></div>
      </div>

      <NavbarLandingPage />

      <main className="flex-1 flex items-center justify-center sm:px-6 lg:px-8 px-4 py-16">
        <div className="w-full max-w-md">
          {submitted ? (
            // Success State
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <CheckCircle2 className="h-20 w-20 text-green-500 relative" />
                </div>
              </div>

              <h1 className="text-4xl font-bold text-neutral-900 mb-3">
                You're In! 🎉
              </h1>

              <p className="text-lg text-neutral-600 mb-2">
                Welcome to the Fleety waitlist!
              </p>

              <p className="text-neutral-500 mb-8">
                We'll send you updates about our progress and notify you as soon as we launch. Thank you for your interest!
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-900">
                  📧 Check your email for confirmation and early updates.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-3 rounded-lg font-semibold hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Home
              </button>
            </div>
          ) : (
            // Form State
            <>
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <img src="/FL_Logo.svg" alt="Fleety Logo" className="h-14 w-14" />
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 mb-4 flex items-center justify-center gap-2">
                  Coming Soon
                  
                </h1>

                <p className="text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Join the waitlist to get early access to Fleety and receive progress updates!
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-neutral-900 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.name
                            ? 'border-red-300 bg-red-50 focus:ring-red-500'
                            : 'border-neutral-300 bg-neutral-50 focus:ring-offset-0'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.email
                            ? 'border-red-300 bg-red-50 focus:ring-red-500'
                            : 'border-neutral-300 bg-neutral-50 focus:ring-offset-0'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95 disabled:bg-neutral-400 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <span>Join Waitlist</span>
                       
                      </>
                    )}
                  </button>

                  {/* Privacy Notice */}
                  <p className="text-xs text-neutral-500 text-center mt-4">
                    We'll never share your email. Unsubscribe anytime.
                  </p>
                </form>
              </div>

              {/* Additional Info */}
            
            </>
          )}
        </div>
      </main>

      <FooterLandingPage />
    </div>
  );
};

export default Waitlist;
