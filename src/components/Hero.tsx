import React from 'react';
import { BarChart3, Zap, Calendar, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden group bg-gradient-to-br from-white via-neutral-50 to-white border-neutral-200 border rounded-3xl shadow-2xl animate-fade-in mx-auto mt-8">
      <div className="relative grid grid-cols-1 gap-8 pt-8 pr-6 pb-8 pl-6 sm:p-12 lg:grid-cols-12 lg:gap-12">
        
        {/* Left Column: Copy */}
        <div className="order-2 flex flex-col justify-between lg:order-1 lg:col-span-6 animate-slide-in-left">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-100/80 px-4 py-2 text-xs font-medium text-neutral-700 backdrop-blur hover:bg-neutral-200 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-gentle-bounce">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 text-white">
                <BarChart3 className="h-3 w-3" />
              </span>
              Smart Maintenance Tracking
              <span className="mx-2 h-1 w-1 rounded-full bg-neutral-400 animate-pulse"></span>
              Save up to 40% on repairs
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 hover:bg-gradient-to-r hover:from-neutral-700 hover:to-neutral-900 hover:bg-clip-text hover:text-transparent transition-all duration-500 animate-fade-in-up leading-[1.1]">
              Keep Your Fleet Running Smoothly
            </h1>
            
            {/* Subheading */}
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-600 animate-fade-in-up delay-100">
              Fleety simplifies vehicle maintenance management with real-time reminders, cost tracking, and AI-powered assistance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-8 items-center animate-fade-in-up delay-200">
              <button 
                onClick={() => navigate('/signup')}
                className="flex gap-2 hover:from-neutral-800 hover:to-neutral-900 transition-all duration-300 hover:shadow-xl hover:scale-105 text-sm font-medium text-white bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-xl py-3.5 px-6 shadow-lg items-center justify-center hover:-translate-y-1 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>Get Started Free</span>
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="inline-flex gap-2 hover:bg-neutral-100 text-sm font-medium text-neutral-900 bg-white border-neutral-300 border rounded-xl py-3 px-6 items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5 active:scale-95 group"
              >
                <Calendar className="h-4 w-4 group-hover:animate-pulse" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex items-center gap-6 text-neutral-600 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="mt-12 grid grid-cols-3 gap-4 animate-fade-in-up delay-400">
            {[
              { label: 'Vehicles Tracked', value: '5K+' },
              { label: 'Repairs Avoided', value: '12K' },
              { label: 'Active Users', value: '2K+' }
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white/60 p-4 backdrop-blur hover:bg-white/80 hover:scale-105 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default">
                <div className="text-xs font-medium text-neutral-600">{stat.label}</div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Visual */}
        <div className="order-1 lg:order-2 lg:col-span-6 animate-slide-in-right delay-200 relative">
          <div className="relative">
            {/* Main Dashboard Preview Card */}
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 opacity-50" />
              <div className="relative p-6 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900">Dashboard</h3>
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-neutral-500">Upcoming Maintenance</div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-100 border border-neutral-200">
                    <div className="h-8 w-8 rounded bg-neutral-300 animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-24 bg-neutral-300 rounded animate-pulse"></div>
                        <div className="h-2 w-16 bg-neutral-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-neutral-500">Cost Overview</div>
                    <div className="flex items-end gap-2 h-16 p-2 bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-lg border border-neutral-200">
                      {[60, 75, 50, 85, 70].map((h, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-gradient-to-t from-neutral-400 to-neutral-300 rounded hover:from-neutral-500 hover:to-neutral-400 transition-all duration-300 hover:scale-105 group-hover:animate-gentle-bounce"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-xs text-neutral-500 text-center">
                  Real-time vehicle insights
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-neutral-400/20 via-transparent to-neutral-300/20 mix-blend-overlay animate-glow-pulse pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Float Card: Upcoming Reminder */}
            <div className="absolute -left-4 top-12 animate-float w-48 z-10">
              <div className="group bg-white border border-neutral-200 rounded-xl p-4 shadow-lg backdrop-blur hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-700 group-hover:text-neutral-900">Next Service</span>
                  <span className="text-xs font-bold text-orange-600 group-hover:text-orange-700">5 days</span>
                </div>
                <p className="text-sm font-medium text-neutral-900">Oil Change</p>
                <p className="text-xs text-neutral-500 mt-1">2024 Honda Civic</p>
              </div>
            </div>

            {/* Float Card: Savings */}
            <div className="absolute -right-6 bottom-8 animate-float-delayed w-44 z-10">
              <div className="group bg-white border border-neutral-200 rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 group-hover:text-neutral-900">Saved This Month</span>
                  <Zap className="h-4 w-4 text-neutral-600 group-hover:animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 mt-2 group-hover:text-neutral-700 transition-colors">$287</div>
                <p className="text-xs text-neutral-500 mt-1">vs. shop costs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;