import React, { useState } from 'react';
import { Check, Minus, Plus, Loader2, Truck } from 'lucide-react';
import { useCheckout, PlanId } from '@/hooks/useCheckout';
import { EnterpriseContactForm } from './EnterpriseContactForm';

interface Plan {
  id: PlanId;
  name: string;
  pricePerVehicle: number;
  description: string;
  features: string[];
  cta: string;
  ctaVariant: 'primary' | 'outline';
  popular: boolean;
}

const Pricing = () => {
  const { createCheckoutSession, isLoading, error } = useCheckout();

  // Vehicle count state
  const [vehicleCount, setVehicleCount] = useState(5);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      pricePerVehicle: 19.90,
      description: 'Perfect for small local fleets.',
      features: [
        'Maintenance logging per vehicle',
        'Date & mileage-based reminders',
        'Cost tracking per vehicle',
        'Basic alerts (email)',
        'Up to 3 fleet managers',
        'Monthly cost reports',
        'Export to CSV'
      ],
      cta: 'Start Free Trial',
      ctaVariant: 'outline',
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      pricePerVehicle: 34.90,
      description: 'For growing fleets needing advanced features.',
      features: [
        'Everything in Starter +',
        'Unlimited fleet managers',
        'SMS alerts (via Twilio)',
        'Receipt photo storage (10GB)',
        'Driver assignment tracking',
        'Fuel cost tracking',
        'Advanced analytics & trends',
        'Monthly maintenance forecasting',
        'Preventive maintenance scheduling',
        'API access (read-only)'
      ],
      cta: 'Get Started',
      ctaVariant: 'primary',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      pricePerVehicle: 49.90,
      description: 'Full control for large organizations.',
      features: [
        'Everything in Professional +',
        'Unlimited receipt storage (100GB)',
        'Custom workshop integrations',
        'Multi-location support',
        'Full API access (read/write)',
        'Webhook integrations',
        'Custom reports & dashboards',
        'Dedicated account manager',
        'Priority phone support (24/5)',
        'Service history exports for resale',
        'Insurance claim integration'
      ],
      cta: 'Contact Sales',
      ctaVariant: 'outline',
      popular: false
    }
  ];

  const handleVehicleCountChange = (value: number) => {
    const clampedValue = Math.max(1, Math.min(500, value));
    setVehicleCount(clampedValue);
  };

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.id === 'enterprise') {
      setShowEnterpriseModal(true);
      return;
    }

    await createCheckoutSession({
      planId: plan.id,
      vehicleCount,
    });
  };

  const calculateTotal = (pricePerVehicle: number) => {
    return (pricePerVehicle * vehicleCount).toFixed(2);
  };

  return (
    <section id="pricing" className="relative sm:p-8 bg-white max-w-7xl mx-auto mt-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-neutral-900 tracking-tight font-bold mb-4">
          B2B Fleet Management Pricing
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Per-vehicle pricing scales with your fleet. No hidden fees, transparent costs.
        </p>
      </div>

      {/* Vehicle Count Selector */}
      <div className="max-w-md mx-auto mb-16">
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-neutral-700" />
            <h3 className="text-lg font-semibold text-neutral-900">How many vehicles?</h3>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleVehicleCountChange(vehicleCount - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={vehicleCount <= 1}
            >
              <Minus size={18} />
            </button>
            
            <div className="relative">
              <input
                type="number"
                min={1}
                max={500}
                value={vehicleCount}
                onChange={(e) => handleVehicleCountChange(parseInt(e.target.value) || 1)}
                className="w-24 text-center text-2xl font-bold text-neutral-900 border border-neutral-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400"
              />
            </div>
            
            <button
              onClick={() => handleVehicleCountChange(vehicleCount + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={vehicleCount >= 500}
            >
              <Plus size={18} />
            </button>
          </div>

          <p className="text-sm text-neutral-500 text-center mt-3">
            Select 1-500 vehicles
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl border transition-all duration-500 overflow-hidden hover:scale-105 hover:shadow-xl ${
              plan.popular
                ? 'border-neutral-900 bg-neutral-50 shadow-xl scale-100 md:scale-105 z-10'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-neutral-900 text-white text-xs font-semibold py-2 text-center">
                Most Popular
              </div>
            )}

            <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-neutral-600 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold text-neutral-900">MYR {plan.pricePerVehicle.toFixed(2)}</span>
                  <span className="text-neutral-600 text-sm">per vehicle/month</span>
                </div>
              </div>

              {/* Calculated Total */}
              <div className="mb-8 py-3 px-4 bg-neutral-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">{vehicleCount} vehicle{vehicleCount > 1 ? 's' : ''}</span>
                  <span className="text-lg font-bold text-neutral-900">MYR {calculateTotal(plan.pricePerVehicle)}/mo</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanSelect(plan)}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 mb-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  plan.ctaVariant === 'primary'
                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                    : 'border border-neutral-300 text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {isLoading && plan.id !== 'enterprise' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.cta
                )}
              </button>

              {/* Features List */}
              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-neutral-900 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700 leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center mt-16">
        <p className="text-neutral-600 text-sm">
          All plans include a 14-day free trial. No credit card required. Custom pricing available for 50+ vehicles.
        </p>
      </div>

      {/* Enterprise Contact Modal */}
      <EnterpriseContactForm
        isOpen={showEnterpriseModal}
        onClose={() => setShowEnterpriseModal(false)}
        defaultFleetSize={vehicleCount}
      />
    </section>
  );
};

export default Pricing;
