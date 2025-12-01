import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  FileText,
  MessageSquare,
  Mail,
  Users,
  Fuel,
  MapPin,
  TrendingUp,
  ChevronDown,
  AlertCircle,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | 'alert' | 'new';
  comingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

const navigationSections: NavSection[] = [
  {
    title: 'Fleet Management',
    collapsible: false,
    items: [
      {
        label: 'Dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: '/dashboard',
      },
      {
        label: 'Vehicles',
        icon: <Car className="h-5 w-5" />,
        href: '/vehicles',
      },
      {
        label: 'Drivers',
        icon: <Users className="h-5 w-5" />,
        href: '/drivers',
      },
    ],
  },
  {
    title: 'Operations',
    collapsible: true,
    items: [
      {
        label: 'Fuel Tracking',
        icon: <Fuel className="h-5 w-5" />,
        href: '/fuel',
      },
      {
        label: 'Maintenance',
        icon: <Wrench className="h-5 w-5" />,
        href: '/maintenance',
        badge: 'alert',
      },
      {
        label: 'Reminders & Alerts',
        icon: <Bell className="h-5 w-5" />,
        href: '/reminders',
        badge: 2,
      },
      {
        label: 'Live Tracking',
        icon: <MapPin className="h-5 w-5" />,
        href: '/live-tracking',
        comingSoon: true,
      },
    ],
  },
  {
    title: 'Reports & Analytics',
    collapsible: true,
    items: [
      {
        label: 'Reports',
        icon: <BarChart3 className="h-5 w-5" />,
        href: '/reports',
      },
      {
        label: 'Cost Tracking',
        icon: <TrendingUp className="h-5 w-5" />,
        href: '/cost-tracking',
        badge: 'new',
      },
    ],
  },
  {
    title: 'Settings',
    collapsible: false,
    items: [
      {
        label: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        href: '/settings',
      },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(['Operations', 'Reports & Analytics'])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === href;
  };

  const toggleSection = (sectionTitle: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionTitle)) {
      newCollapsed.delete(sectionTitle);
    } else {
      newCollapsed.add(sectionTitle);
    }
    setCollapsedSections(newCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth?tab=signin');
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const handleOpenDocumentation = () => {
    window.open('https://Fleety-docs.example.com', '_blank');
  };

  const handleOpenFAQ = () => {
    navigate('/faq');
    setShowHelpMenu(false);
  };

  const handleContactSupport = () => {
    navigate('/contact');
    setShowHelpMenu(false);
  };

  const handleOpenChat = () => {
    alert('Chat support coming soon!');
  };

  // Filter items based on search query
  const filteredSections = navigationSections.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0 || searchQuery === '');

  const renderBadge = (badge?: number | 'alert' | 'new') => {
    if (!badge) return null;

    if (badge === 'alert') {
      return (
        <div className="flex items-center gap-1 ml-auto">
          <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
        </div>
      );
    }

    if (badge === 'new') {
      return (
        <span className="ml-auto inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
          New
        </span>
      );
    }

    if (typeof badge === 'number') {
      return (
        <span className="ml-auto inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs font-bold text-white">
          {badge}
        </span>
      );
    }

    return null;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/FL_Logo.svg" alt="Fleety Logo" className="h-8 w-8" />
          <span className="font-bold text-gray-900">Fleety</span>
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-[280px] bg-white shadow-sm overflow-y-auto z-40 transform transition-transform duration-300',
          'border-r border-gray-200',
          !mobileOpen && 'lg:translate-x-0 -translate-x-full'
        )}
      >
        {/* Logo Section */}
        <button
          onClick={() => navigate('/')}
          className="hidden lg:flex h-20 items-center gap-3 border-b border-gray-200 px-6 sticky top-0 bg-white z-10 w-full hover:bg-gray-50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <img src="/FL_Logo.svg" alt="Fleety Logo" className="h-10 w-10" />
          </div>
          <div className="flex-1 text-left">
            <h1 className="text-lg font-bold text-gray-900">Fleety</h1>
            <p className="text-xs text-gray-500">Fleet Management</p>
          </div>
        </button>

        {/* Search Bar */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-gray-50 border-gray-300 focus-visible:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 px-3 py-4">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-2">
              {/* Section Header */}
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {section.title}
                </p>
                {section.collapsible && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-gray-400 transition-transform duration-200',
                        collapsedSections.has(section.title) && '-rotate-90'
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Section Items */}
              <div
                className={cn(
                  'space-y-1 overflow-hidden transition-all duration-300',
                  collapsedSections.has(section.title) && 'max-h-0'
                )}
              >
                {section.items.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      if (!item.comingSoon) {
                        navigate(item.href);
                        setMobileOpen(false);
                      }
                    }}
                    disabled={item.comingSoon}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group',
                      item.comingSoon
                        ? 'opacity-50 cursor-not-allowed text-gray-400'
                        : isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-900 border-l-4 border-l-blue-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <span className={cn(
                      'transition-colors',
                      isActive(item.href) && !item.comingSoon && 'text-blue-600'
                    )}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.comingSoon && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 ml-auto">
                        Soon
                      </span>
                    )}
                    {!item.comingSoon && renderBadge(item.badge)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-gray-200 my-4" />

        {/* Empty State */}
        {filteredSections.every((section) => section.items.length === 0) && searchQuery !== '' && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No results for "{searchQuery}"</p>
          </div>
        )}
      </aside>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:fixed lg:bottom-0 lg:left-0 lg:w-[280px] border-t border-gray-200 bg-white p-3 space-y-2 z-40">
        {/* Get Help Section */}
        <div className="pb-3 border-b border-gray-200">
          <div className="relative">
            <Button
              onClick={() => setShowHelpMenu(!showHelpMenu)}
              variant="outline"
              className="w-full justify-start gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-300"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Get Help</span>
            </Button>

            {showHelpMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <button
                  onClick={handleOpenDocumentation}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-t-lg transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Documentation</span>
                </button>
                <button
                  onClick={handleOpenFAQ}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors border-t border-gray-100"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>FAQ</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/terms');
                    setShowHelpMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors border-t border-gray-100"
                >
                  <FileText className="h-4 w-4" />
                  <span>Terms of Service</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/privacy');
                    setShowHelpMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors border-t border-gray-100"
                >
                  <FileText className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </button>
                <button
                  onClick={handleOpenChat}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors border-t border-gray-100"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat Support</span>
                </button>
                <button
                  onClick={handleContactSupport}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-b-lg transition-colors border-t border-gray-100"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Support</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={() => setShowLogoutDialog(true)}
          variant="outline"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
