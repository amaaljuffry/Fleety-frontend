import React, { useState } from 'react';
import NavbarLandingPage from '@/components/Navbar-LandingPage';
import FooterLandingPage from '@/components/Footer-LandingPage';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and privacy policy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          agreeToTermsAndPrivacy: formData.agreeToTerms,
          agreeToPDPA: formData.agreeToTerms
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '', agreeToTerms: false });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@fleety.ama24.my',
      description: 'We\'ll respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+1 (555) 678 999 8212',
      description: 'Monday - Friday, 9 AM - 6 PM KUL'
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Kuala Lumpur, MY',
      description: '123 Jalan Penang,50088 Kuala Lumpur, MY'
    },
    {
      icon: Clock,
      title: 'Response Time',
      value: 'Fast Support',
      description: 'Average response time: 2-4 hours'
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
            <MessageSquare className="h-16 w-16 text-neutral-900" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 mb-4 leading-[1.1]">
            Get in Touch
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and our team will respond as soon as possible.
          </p>
        </section>

        {/* Contact Information Cards */}
        <section className="py-16 border-t border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, i) => {
              const Icon = info.icon;
              return (
                <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <Icon className="h-10 w-10 text-neutral-900 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{info.title}</h3>
                  <p className="text-sm font-semibold text-neutral-700 mb-2">{info.value}</p>
                  <p className="text-sm text-neutral-600">{info.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 border-t border-neutral-200">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-neutral-200 rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Send us a Message</h2>
              <p className="text-neutral-600 mb-8">Fill in the form below and we'll get back to you soon.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your inquiry..."
                    rows={6}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-300 resize-none"
                    required
                  ></textarea>
                </div>

                {/* Consent Checkbox */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 border border-neutral-300 rounded cursor-pointer"
                      required
                    />
                    <label className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <a href="/terms" className="text-gray-900 font-semibold hover:underline">
                        Terms of Service
                      </a>
                      ,{' '}
                      <a href="/privacy" className="text-gray-900 font-semibold hover:underline">
                        Privacy Policy
                      </a>
                      , and consent to Fleety processing my personal data in accordance with the{' '}
                      <a href="/pdpa" className="text-gray-900 font-semibold hover:underline">
                        PDPA
                      </a>
                      <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>

                {/* Status Messages */}
                {submitted && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">✓ Message sent successfully! We'll get back to you soon.</p>
                  </div>
                )}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">✗ {error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-neutral-200 mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'What is your typical response time?',
                a: 'We aim to respond to all inquiries within 24 hours during business hours. Most responses come within 2-4 hours.'
              },
              {
                q: 'Do you offer phone support?',
                a: 'Yes, our support team is available by phone Monday to Friday, 9 AM - 6 PM EST. Call us at +1 (555) 123-4567.'
              },
              {
                q: 'How can I request a demo?',
                a: 'You can request a demo through our contact form or email support@fleety.com. Our team will schedule a convenient time with you.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, wire transfers, and ACH payments. Contact our billing team for enterprise options.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <h3 className="font-bold text-neutral-900 mb-3">{item.q}</h3>
                <p className="text-neutral-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <FooterLandingPage />
    </div>
  );
};

export default Contact;
