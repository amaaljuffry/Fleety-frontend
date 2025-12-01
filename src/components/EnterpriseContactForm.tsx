import React, { useState } from 'react';
import { X, Building2, Users, Truck, Mail, User, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';

interface EnterpriseContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFleetSize?: number;
}

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export const EnterpriseContactForm: React.FC<EnterpriseContactFormProps> = ({
  isOpen,
  onClose,
  defaultFleetSize = 50,
}) => {
  const { submitEnterpriseContact, isSubmittingContact, contactSuccess, contactError } = useCheckout();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    companySize: '51-200',
    fleetSize: defaultFleetSize,
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (formData.fleetSize < 1) {
      newErrors.fleetSize = 'Fleet size must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await submitEnterpriseContact(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Contact Enterprise Sales</h2>
              <p className="text-neutral-300 text-sm mt-1">
                Get a customized solution for your fleet
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Success State */}
        {contactSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Thank You!
            </h3>
            <p className="text-neutral-600 mb-6">
              Our sales team will contact you within 24 hours to discuss your enterprise needs.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Smith"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-neutral-300 focus:ring-neutral-200 focus:border-neutral-400'
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@company.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-neutral-300 focus:ring-neutral-200 focus:border-neutral-400'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Acme Logistics Sdn Bhd"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.companyName 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-neutral-300 focus:ring-neutral-200 focus:border-neutral-400'
                  }`}
                />
              </div>
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>

            {/* Company Size & Fleet Size Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Company Size
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <select
                    value={formData.companySize}
                    onChange={(e) => handleChange('companySize', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 appearance-none bg-white"
                  >
                    {companySizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fleet Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Fleet Size *
                </label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={formData.fleetSize}
                    onChange={(e) => handleChange('fleetSize', parseInt(e.target.value) || 1)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.fleetSize 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-neutral-300 focus:ring-neutral-200 focus:border-neutral-400'
                    }`}
                  />
                </div>
                {errors.fleetSize && <p className="text-red-500 text-xs mt-1">{errors.fleetSize}</p>}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Message (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-neutral-400" size={18} />
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tell us about your fleet management needs..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 resize-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {contactError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {contactError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingContact}
              className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmittingContact ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Contact Sales'
              )}
            </button>

            <p className="text-xs text-neutral-500 text-center">
              By submitting, you agree to our Privacy Policy and Terms of Service.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default EnterpriseContactForm;
