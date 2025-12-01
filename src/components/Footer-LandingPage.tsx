import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

const FooterLandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to subscribe');
      }

      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
      console.error('Newsletter subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white/80 backdrop-blur-md">
      <div className="sm:px-6 lg:px-8 max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/FL_Logo.svg" alt="Fleety Logo" className="h-8 w-8" />
              <span className="text-lg font-bold text-neutral-900">Fleety</span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              The smartest way to manage your fleet. Track, analyze, and optimize your operations from a single dashboard.
            </p>
            
            {/* Newsletter Subscription */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-900">Subscribe to our newsletter</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {subscribed && (
                <p className="text-xs text-green-600">✓ Thanks for subscribing!</p>
              )}
              {error && (
                <p className="text-xs text-red-600">✗ {error}</p>
              )}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Product</h3>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'API', 'Integrations'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Company</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' }
              ].map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    onClick={(e) => {
                      if (link.href !== '#') {
                        e.preventDefault();
                        navigate(link.href);
                      }
                    }}
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Support</h3>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', href: '#' },
                { label: 'Status', href: '#' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' }
              ].map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    onClick={(e) => {
                      if (link.href !== '#') {
                        e.preventDefault();
                        navigate(link.href);
                      }
                    }}
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-600">
            © 2025 Fleety Inc. All rights reserved.
          </p>
          <p className="text-sm text-neutral-600 flex items-center gap-1">
            Made with Trust for fleets everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterLandingPage;
