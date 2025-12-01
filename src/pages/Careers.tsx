import React from 'react';
import NavbarLandingPage from '@/components/Navbar-LandingPage';
import FooterLandingPage from '@/components/Footer-LandingPage';
import { Briefcase, Users, Heart, Award, ArrowRight, MapPin, Clock } from 'lucide-react';

const Careers = () => {
  const openPositions = [
    {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Join our engineering team to build the next generation of fleet management solutions using React, Python, and cloud technologies.'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Lead product vision and strategy for our flagship fleet management platform. Drive feature development and customer success.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Sales & Success',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build lasting relationships with our customers and ensure they get maximum value from Fleety. Support fleet operators in achieving their goals.'
    },
    {
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Kuala Lumpur, Malaysia',
      type: 'Full-time',
      description: 'Design beautiful, intuitive interfaces that make fleet management effortless. Shape the visual and user experience of Fleety.'
    },
    {
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Remote',
      type: 'Full-time',
      description: 'Analyze fleet data patterns and provide insights to drive business decisions. Work with cutting-edge analytics tools and large datasets.'
    },
    {
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'Remote',
      type: 'Full-time',
      description: 'Maintain and improve our cloud infrastructure. Ensure reliability, security, and scalability of Fleety\'s platform.'
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, dental, vision, gym stipends, and mental health support'
    },
    {
      icon: Award,
      title: 'Professional Growth',
      description: 'Unlimited learning budget, conference attendance, mentorship programs, and career development'
    },
    {
      icon: Briefcase,
      title: 'Flexible Work',
      description: 'Remote-first culture with flexible hours and unlimited PTO to maintain work-life balance'
    },
    {
      icon: Users,
      title: 'Great Team',
      description: 'Work with passionate, talented individuals from diverse backgrounds in a collaborative environment'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased font-inter">
      {/* Background Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-neutral-100/30 via-neutral-100/20 to-neutral-100/20 blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-neutral-50/20 via-neutral-50/20 to-neutral-50/20 blur-3xl opacity-30"></div>
      </div>

      <NavbarLandingPage />

      <main className="sm:px-6 lg:px-8 max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <section className="py-16 text-center">
          <div className="flex justify-center mb-8">
            <Briefcase className="h-16 w-16 text-neutral-900" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 mb-4 leading-[1.1]">
            Join Our Team
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Help us revolutionize fleet management and build the future of logistics technology.
          </p>
        </section>

        {/* Why Join Section */}
        <section className="py-16 border-t border-neutral-200">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12 text-center">Why Join Fleety?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:-translate-y-1">
                  <Icon className="h-10 w-10 text-neutral-900 mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{benefit.title}</h3>
                  <p className="text-neutral-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Open Positions Section */}
        <section className="py-16 border-t border-neutral-200">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12 text-center">Open Positions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {openPositions.map((position, i) => (
              <div 
                key={i} 
                className="bg-white border border-neutral-200 rounded-2xl p-8 hover:shadow-lg hover:scale-102 transition-all duration-300 hover:border-neutral-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">{position.title}</h3>
                    <p className="text-sm text-neutral-500">{position.department}</p>
                  </div>
                </div>
                
                <p className="text-neutral-600 text-sm mb-6">{position.description}</p>
                
                <div className="flex flex-wrap gap-4 items-center mb-6">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin className="h-4 w-4" />
                    {position.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Clock className="h-4 w-4" />
                    {position.type}
                  </div>
                </div>

                <button className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors duration-300 group-hover:translate-x-1">
                  <span>Apply Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Culture Section */}
        <section className="py-16 border-t border-neutral-200 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-6">Our Culture</h2>
              <p className="text-lg text-neutral-600 mb-4">
                At Fleety, we believe that the best ideas come from diverse perspectives and collaborative teams. We foster an environment where innovation thrives, mistakes are learning opportunities, and every team member's voice matters.
              </p>
              <p className="text-lg text-neutral-600 mb-4">
                We're committed to creating an inclusive workplace where everyone can do their best work. Whether you're working remotely from your home or collaborating in one of our offices, you'll find a supportive community ready to help you succeed.
              </p>
              <p className="text-lg text-neutral-600">
                Our team comes from various backgrounds and brings unique experiences that fuel our growth. We celebrate diversity and believe it makes us stronger.
              </p>
            </div>
            <div className="bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-3xl p-12 h-96 flex items-center justify-center border border-neutral-200 shadow-lg">
              <div className="text-center">
                <Users className="h-24 w-24 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-600 font-semibold">Growing Team of 50+</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-t border-neutral-200 mb-16">
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Don't see your position?</h2>
            <p className="text-lg text-neutral-100 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals. Send us your resume and tell us what you're passionate about.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-lg font-medium hover:bg-neutral-100 transition-colors duration-300 hover:scale-105">
              <span>Send Your Resume</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <FooterLandingPage />
    </div>
  );
};

export default Careers;
