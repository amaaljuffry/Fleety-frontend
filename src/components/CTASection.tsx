import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative sm:p-8 bg-neutral-900 max-w-7xl mx-auto border-neutral-200 border rounded-3xl mt-20 p-6 shadow-xl overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-white tracking-tight font-bold mb-4 break-words">
          Ready to modernize your fleet?
        </h2>

        {/* Description */}
        <p className="text-lg text-neutral-300 mb-8">
          Join over 500+ logistics teams who are saving costs and improving efficiency with Fleety. Start your 14-day free trial today.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 rounded-lg bg-white text-neutral-900 px-6 py-3 text-base font-semibold hover:bg-neutral-100 transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
          >
            <span>Get Started Now</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              // You can add contact form or email link here
              window.location.href = 'mailto:sales@fleety.com';
            }}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-white text-white px-6 py-3 text-base font-semibold hover:bg-white hover:text-neutral-900 transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
          >
            <span>Contact Sales</span>
          </button>
        </div>

        {/* Footer Text */}
        <p className="text-sm text-neutral-400">
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default CTASection;
