import React from 'react';
import { Wrench, Clock, DollarSign, AlertCircle, FileText } from 'lucide-react';

const Features = () => {
  return (
    <section id="features" className="relative sm:p-8 bg-white max-w-7xl mx-auto border-neutral-200 border rounded-3xl mt-20 p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
      
      {/* Background Shimmer Lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-shimmer"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-shimmer delay-1500"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 relative z-10 items-start">
        {/* Left Content */}
        <div className="flex flex-col justify-between min-h-full animate-slide-in-left">
          <div>
            <span className="text-sm font-normal text-neutral-600 font-inter hover:text-neutral-700 transition-colors">Core Features</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-neutral-900 mt-3 tracking-tight font-bold hover:text-neutral-700 transition-all duration-500 cursor-pointer">
              Everything you need to manage vehicles.
            </h2>

            <div className="mt-8 space-y-4">
              {[
                { icon: Wrench, title: 'Maintenance Tracking', desc: 'Keep detailed records of all vehicle maintenance' },
                { icon: Clock, title: 'Smart Reminders', desc: 'Get timely alerts for upcoming maintenance' },
                { icon: DollarSign, title: 'Cost Analytics', desc: 'Track and analyze maintenance expenses' }
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div key={i} className={`flex gap-4 p-4 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 hover:border-neutral-300 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group cursor-pointer animate-fade-in-up`} style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-neutral-700 group-hover:animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">{feat.title}</h3>
                      <p className="text-sm text-neutral-600 group-hover:text-neutral-700">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <a href="#pricing" className="mt-8 w-full inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-gradient-to-r from-neutral-700 to-neutral-900 text-white text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 group font-inter animate-fade-in-up">
              <span>Explore All Features</span>
              <span className="inline-flex h-2 w-2 rounded-full bg-white group-hover:animate-bounce"></span>
            </a>
          </div>
        </div>

        {/* Right Grid - Feature Cards */}
        <div className="grid grid-cols-2 gap-3 animate-slide-in-right delay-300">
          <FeatureCard 
            title="Real-time Reminders" 
            icon={Clock}
            colorClass="blue"
            aspect="aspect-square"
          />
          <FeatureCard 
            title="Cost Tracking" 
            icon={DollarSign}
            colorClass="green"
            aspect="aspect-square"
          />
          <FeatureCard 
            title="AI FAQ Assistance" 
            icon={AlertCircle}
            colorClass="purple"
            aspect="aspect-square"
          />
          <FeatureCard 
            title="Service History" 
            icon={FileText}
            colorClass="orange"
            aspect="aspect-square"
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ title, icon: Icon, colorClass, aspect }) => {
  const colors = {
    blue: 'from-neutral-700 to-neutral-900',
    green: 'from-neutral-600 to-neutral-800',
    purple: 'from-neutral-700 to-neutral-900',
    orange: 'from-neutral-600 to-neutral-800'
  };

  const lightColors = {
    blue: 'bg-neutral-50 border-neutral-200',
    green: 'bg-neutral-100 border-neutral-300',
    purple: 'bg-neutral-50 border-neutral-200',
    orange: 'bg-neutral-100 border-neutral-300'
  };

  // Free stock photo backgrounds from Unsplash
  const backgroundImages = {
    'Real-time Reminders': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'Cost Tracking': 'https://images.unsplash.com/photo-1645445522156-9ac06bc7a767?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'AI FAQ Assistance': 'https://images.unsplash.com/photo-1587813369290-091c9d432daf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'Service History': 'https://images.unsplash.com/photo-1650569663338-f6921d483868?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  };

  const bgImage = backgroundImages[title];

  return (
    <article className={`relative overflow-hidden ${aspect} ${lightColors[colorClass]} border border-neutral-200 rounded-3xl hover:scale-105 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group cursor-pointer flex flex-col items-center justify-center`}>
      {/* Background Image */}
      {bgImage && (
        <div 
          className="absolute inset-0 opacity-95 group-hover:opacity-10 transition-opacity duration-300"
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40" />
      
      {/* Content */}
      <div className="relative text-center space-y-2 z-10 p-2">
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${colors[colorClass]} text-white shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-xl`}>
          <Icon className="h-7 w-7 group-hover:animate-pulse" />
        </div>
        <p className="text-neutral-900 font-bold text-center text-sm px-2 group-hover:text-neutral-700 transition-all duration-300">
          {title}
        </p>
      </div>
    </article>
  );
};

export default Features;