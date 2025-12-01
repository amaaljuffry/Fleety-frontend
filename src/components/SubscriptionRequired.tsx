import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Rocket, CreditCard, ArrowRight, Sparkles } from 'lucide-react';

interface SubscriptionRequiredProps {
  type: 'no_subscription' | 'upgrade_required';
  currentPlan?: string | null;
  requiredPlan?: string;
}

const planNames: Record<string, string> = {
  starter: 'Starter',
  pro: 'Professional',
  enterprise: 'Enterprise',
};

const planFeatures: Record<string, string[]> = {
  starter: [
    'Maintenance logging per vehicle',
    'Date & mileage-based reminders',
    'Cost tracking per vehicle',
    'Basic alerts (email)',
    'Up to 3 fleet managers',
  ],
  pro: [
    'Everything in Starter +',
    'Unlimited fleet managers',
    'SMS alerts (via Twilio)',
    'Advanced analytics & trends',
    'API access (read-only)',
  ],
  enterprise: [
    'Everything in Professional +',
    'Full API access (read/write)',
    'Custom integrations',
    'Dedicated account manager',
    'Priority support',
  ],
};

export const SubscriptionRequired: React.FC<SubscriptionRequiredProps> = ({
  type,
  currentPlan,
  requiredPlan,
}) => {
  if (type === 'no_subscription') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-neutral-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Subscription Required
          </h1>

          {/* Message */}
          <p className="text-neutral-600 text-lg mb-8">
            You need an active subscription to access the dashboard and fleet management features.
          </p>

          {/* Benefits Preview */}
          <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              What you get with Fleety
            </h3>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
                Complete fleet management dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
                Maintenance tracking & reminders
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
                Fuel cost tracking & analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
                Driver management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
                Real-time vehicle tracking
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link
              to="/#pricing"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              View Pricing Plans
            </Link>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Help Link */}
          <p className="mt-8 text-sm text-neutral-500">
            Have questions?{' '}
            <Link to="/contact" className="text-neutral-900 font-medium hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Upgrade Required
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mx-auto">
            <Rocket className="w-10 h-10 text-neutral-700" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Upgrade Required
        </h1>

        {/* Message */}
        <p className="text-neutral-600 text-lg mb-4">
          This feature requires the{' '}
          <span className="font-semibold text-neutral-900">
            {planNames[requiredPlan || 'pro']}
          </span>{' '}
          plan or higher.
        </p>

        {currentPlan && (
          <p className="text-sm text-neutral-500 mb-8">
            You're currently on the{' '}
            <span className="font-medium">{planNames[currentPlan]}</span> plan.
          </p>
        )}

        {/* Features Preview */}
        {requiredPlan && planFeatures[requiredPlan] && (
          <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-neutral-900 mb-4">
              Unlock with {planNames[requiredPlan]}:
            </h3>
            <ul className="space-y-2 text-neutral-600">
              {planFeatures[requiredPlan].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="space-y-4">
          <Link
            to="/#pricing"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Upgrade Now
            <ArrowRight className="w-5 h-5" />
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Help Link */}
        <p className="mt-8 text-sm text-neutral-500">
          Need help choosing a plan?{' '}
          <Link to="/contact" className="text-neutral-900 font-medium hover:underline">
            Talk to sales
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
