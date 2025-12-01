import React, { useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Rocket, Mail } from 'lucide-react';
import NavbarLandingPage from '@/components/Navbar-LandingPage';
import FooterLandingPage from '@/components/Footer-LandingPage';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Optionally verify the session with backend
    // You could call an API to confirm the subscription
    if (sessionId) {
      console.log('Checkout session completed:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased font-inter flex flex-col">
      {/* Background Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-green-100/30 via-emerald-100/20 to-teal-100/20 blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-green-50/20 via-emerald-50/20 to-green-50/20 blur-3xl opacity-30"></div>
      </div>

      <NavbarLandingPage />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Welcome to Fleety! 🎉
          </h1>

          {/* Message */}
          <p className="text-neutral-600 text-lg mb-8">
            Your subscription is now active. Thank you for choosing Fleety for your fleet management needs!
          </p>

          {/* What's Next Section */}
          <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              What&apos;s Next?
            </h3>
            <ul className="space-y-3 text-neutral-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span>Add your vehicles to start tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span>Set up maintenance reminders</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span>Invite your team members</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/vehicles/new"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              Add Your First Vehicle
            </Link>
          </div>

          {/* Confirmation Email Note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-neutral-500 text-sm">
            <Mail className="w-4 h-4" />
            <span>A confirmation email has been sent to your inbox</span>
          </div>
        </div>
      </main>

      <FooterLandingPage />
    </div>
  );
};

export default CheckoutSuccess;
