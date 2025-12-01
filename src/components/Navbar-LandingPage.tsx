import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { capitalizeWords } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const NavbarLandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get user name for display
  const userName = user?.full_name || user?.email || 'User';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 animate-fade-in">
      <div className="sm:px-6 lg:px-8 max-w-7xl mx-auto px-4">
        <div className="flex bg-white/80 backdrop-blur-md border-neutral-200 border rounded-2xl mt-5 py-3 px-6 shadow-lg items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <img src="/FL_Logo.svg" alt="Fleety Logo" className="h-8 w-8" />
            <span className="text-lg font-bold text-neutral-900">Fleety</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            {[
              { label: 'Features', href: '#features', isHash: true },
              { label: 'Pricing', href: '#pricing', isHash: true },
              { label: 'About', href: '/about', isHash: false }
            ].map((item) => (
              <a 
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (!item.isHash) {
                    e.preventDefault();
                    navigate(item.href);
                  } else {
                    // For hash links, navigate to home first if not on landing page
                    const currentPath = window.location.pathname;
                    if (currentPath !== '/') {
                      e.preventDefault();
                      navigate('/', { state: { scrollTo: item.href } });
                    }
                  }
                }}
                className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons - Conditional based on auth state */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Dashboard Button */}
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="hidden rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 md:flex items-center gap-2 transition-colors duration-300 hover:scale-105"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                
                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-all duration-300 hover:scale-105"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{capitalizeWords(userName)}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-neutral-200"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 md:block transition-colors duration-300 hover:scale-105"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarLandingPage;