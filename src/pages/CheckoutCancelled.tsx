import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard, HelpCircle } from 'lucide-react';
import NavbarLandingPage from '@/components/Navbar-LandingPage';
import FooterLandingPage from '@/components/Footer-LandingPage';

const CheckoutCancelled = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased font-inter flex flex-col">
      {/* Background Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-neutral-100/30 via-neutral-100/20 to-neutral-100/20 blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-neutral-50/20 via-neutral-50/20 to-neutral-50/20 blur-3xl opacity-30"></div>
      </div>

      <NavbarLandingPage />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-neutral-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Purchase Cancelled
          </h1>

          {/* Message */}
          <p className="text-neutral-600 text-lg mb-8">
            No worries! Your purchase was cancelled and you haven't been charged. 
            You can try again whenever you're ready.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/#pricing"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Try Again
            </Link>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-neutral-50 rounded-xl">
            <div className="flex items-center justify-center gap-2 text-neutral-700 mb-2">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Need Help?</span>
            </div>
            <p className="text-neutral-600 text-sm mb-3">
              If you encountered any issues or have questions about our plans, we're here to help.
            </p>
            <Link
              to="/contact"
              className="text-neutral-900 font-medium hover:underline"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </main>

      <FooterLandingPage />
    </div>
  );
};

export default CheckoutCancelled;
