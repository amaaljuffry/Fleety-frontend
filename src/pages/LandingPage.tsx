import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavbarLandingPage from '@/components/Navbar-LandingPage';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import CTASection from '@/components/CTASection';
import FooterLandingPage from '@/components/Footer-LandingPage';

function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    // Handle scroll to section if coming from another page
    if (location.state?.scrollTo) {
      const element = document.querySelector(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased font-inter">
      {/* Background Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-cyan-100/20 blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-50/20 via-purple-50/20 to-sky-50/20 blur-3xl opacity-30"></div>
      </div>

      <NavbarLandingPage />

      <main className="sm:px-6 lg:px-8 max-w-7xl mx-auto px-4">
        <Hero />
        <Features />
        <Pricing />
        <CTASection />
      </main>

      <FooterLandingPage />
    </div>
  );
}

export default LandingPage;