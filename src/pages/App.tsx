import React from 'react';
import NavbarLandingPage from '@/components/Navbar-LandingPage';
import Hero from '@/components/Hero';
import Features from '@/components/Features';

function App() {
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

        {/* Footer / Social Proof */}
        <section className="sm:py-16 py-12 flex flex-wrap gap-x-12 gap-y-6 text-neutral-600 items-center justify-center border-t border-neutral-200 mt-20">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Trusted by vehicle owners</span>
          <div className="h-5 w-px bg-neutral-300"></div>
          {['AutoCare Pro', 'FleetWorks', 'VehicleSync', 'MaintainMe'].map((brand) => (
            <span key={brand} className="text-sm font-medium hover:text-blue-600 transition-colors cursor-default">{brand}</span>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;