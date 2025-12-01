import React from "react";
import NavbarLandingPage from "@/components/Navbar-LandingPage";
import FooterLandingPage from "@/components/Footer-LandingPage";
import { Users, Target, Zap, TrendingUp } from "lucide-react";

const About = () => {
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
            <img src="/FL_Logo.svg" alt="Fleety Logo" className="h-16 w-16" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 mb-4 leading-[1.1]">
            About Fleety
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            The smartest fleet management platform designed to save you time,
            money, and headaches.
          </p>
        </section>

        {/* Mission Section */}
        <section className="py-16 border-t border-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-600 mb-4">
                At Fleety, we believe fleet management shouldn't be complicated.
                Our mission is to empower logistics teams, fleet operators, and
                vehicle owners with intelligent tools that make maintenance
                tracking, cost analysis, and vehicle management effortless.
              </p>
              <p className="text-lg text-neutral-600">
                We're committed to reducing operational costs, preventing
                breakdowns, and helping our users build more efficient,
                sustainable fleets through technology.
              </p>
            </div>
            <div className="bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-3xl p-12 h-80 flex items-center justify-center border border-neutral-200 shadow-lg relative overflow-hidden">
              {/* Subtle background image */}
              <img
                src="/Fleety_(8).png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-90 blur-none rounded-3xl"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 border-t border-neutral-200">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12 text-center">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Innovation",
                description:
                  "Constantly improving with cutting-edge technology and AI-powered insights",
              },
              {
                icon: Users,
                title: "User-Centric",
                description:
                  "Building with our users in mind, prioritizing simplicity and usability",
              },
              {
                icon: TrendingUp,
                title: "Growth",
                description:
                  "Helping businesses grow by reducing costs and improving efficiency",
              },
              {
                icon: Target,
                title: "Reliability",
                description:
                  "99.9% uptime guarantee with enterprise-grade security and support",
              },
            ].map((value, i) => {
              const Icon = value.icon;
              return (
                <div
                  key={i}
                  className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="h-10 w-10 text-neutral-900 mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 border-t border-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-3xl p-12 h-80 flex items-center justify-center border border-neutral-200 shadow-lg order-2 lg:order-1 relative overflow-hidden">
              {/* Subtle background image */}
              <img
                src="/Fleety_(6).png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover  rounded-3xl"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-neutral-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-neutral-600 mb-4">
                Fleety was founded by a team of fleet management professionals
                and software engineers who experienced firsthand the pain points
                of traditional vehicle maintenance tracking. We saw businesses
                struggling with spreadsheets, missed reminders, and unexpected
                repairs.
              </p>
              <p className="text-lg text-neutral-600 mb-4">
                That's when we decided to build a solution. After years of
                development and refinement with real fleet operators, Fleety was
                born – a comprehensive platform that combines intelligent
                scheduling, cost analytics, and predictive maintenance.
              </p>
              <p className="text-lg text-neutral-600">
                Today, we serve thousands of fleets worldwide, helping them save
                millions in maintenance costs and operational downtime.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-t border-neutral-200">
          <div className="bg-neutral-900 text-white rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-12 text-center">
              By The Numbers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { stat: "500+", label: "Logistics Teams" },
                { stat: "50K+", label: "Vehicles Tracked" },
                { stat: "$10M+", label: "Saved in Repairs" },
                { stat: "99.9%", label: "Uptime Guarantee" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="text-4xl font-bold mb-2">{item.stat}</div>
                  <p className="text-neutral-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 border-t border-neutral-200">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12 text-center">
            Why Choose Fleety?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Technology",
                description:
                  "AI-powered predictive maintenance and intelligent scheduling that learns your fleet.",
              },
              {
                title: "Real-Time Insights",
                description:
                  "Get instant notifications, live GPS tracking, and detailed analytics at your fingertips.",
              },
              {
                title: "24/7 Support",
                description:
                  "Our dedicated support team is always ready to help you succeed with Fleety.",
              },
              {
                title: "Easy Integration",
                description:
                  "Seamlessly integrate with your existing systems and workflows without disruption.",
              },
              {
                title: "Scalable Solution",
                description:
                  "From small fleets to enterprise operations, Fleety scales with your business.",
              },
              {
                title: "Data Security",
                description:
                  "Enterprise-grade security with 256-bit encryption and compliance certifications.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-t border-neutral-200">
          <div className="bg-neutral-900 text-white rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Join Thousands of Satisfied Users?
            </h2>
            <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
              Start your 14-day free trial today and see how Fleety can
              transform your fleet management.
            </p>
            <button className="inline-flex items-center gap-2 rounded-lg bg-white text-neutral-900 px-6 py-3 text-base font-semibold hover:bg-neutral-100 transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95">
              <span>Get Started Free</span>
              <Zap className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>

      <FooterLandingPage />
    </div>
  );
};

export default About;
