import { useLocation, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number | 'alert' | 'new';
  comingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: 'Fleet Management',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
      {
        label: 'Vehicles',
        icon: Car,
        href: '/vehicles',
      },
      {
        label: 'Drivers',
        icon: Users,
        href: '/drivers',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Fuel Tracking',
        icon: Fuel,
        href: '/fuel',
      },
      {
        label: 'Maintenance',
        icon: Wrench,
        href: '/maintenance',
        badge: 'alert',
      },
      {
        label: 'Reminders & Alerts',
        icon: Bell,
        href: '/reminders',
        badge: 2,
      },
      {
        label: 'Live Tracking',
        icon: MapPin,
        href: '/live-tracking',
        comingSoon: true,
      },
    ],
  },
  {
    title: 'Reports & Analytics',
    items: [
      {
        label: 'Reports',
        icon: BarChart3,
        href: '/reports',
      },
      {
        label: 'Cost Tracking',
        icon: TrendingUp,
        href: '/cost-tracking',
        badge: 'new',
      },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === href;
  };

  const handleLogout = () => {
    logout();
    navigate('/auth?tab=signin');
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const renderBadge = (badge?: number | 'alert' | 'new') => {
    if (!badge) return null;

    if (badge === 'alert') {
      return (
        <AlertCircle className="h-4 w-4 text-red-600 animate-pulse ml-auto" />
      );
    }

    if (badge === 'new') {
      return (
        <Badge className="ml-auto bg-blue-500 hover:bg-blue-600">
          New
        </Badge>
      );
    }

    if (typeof badge === 'number') {
      return (
        <Badge className="ml-auto bg-red-600 hover:bg-red-700">
          {badge}
        </Badge>
      );
    }

    return null;
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => navigate('/')}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br  text-sidebar-primary-foreground">
                  <img src="/FL_Logo.svg" alt="Fleety" className="size-7" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Fleety</span>
                  <span className="truncate text-xs text-muted-foreground">Fleet Management</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {navigationSections.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        disabled={item.comingSoon}
                        tooltip={item.label}
                      >
                        <button
                          onClick={() => !item.comingSoon && navigate(item.href)}
                          className="w-full"
                          disabled={item.comingSoon}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          {item.comingSoon && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Soon
                            </Badge>
                          )}
                          {!item.comingSoon && renderBadge(item.badge)}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}

          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/settings')}
                    tooltip="Settings"
                  >
                    <button onClick={() => navigate('/settings')} className="w-full">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Get Help</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={() => window.open('https://Fleety-docs.example.com', '_blank')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Documentation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/faq')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    FAQ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/terms')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Terms of Service
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/privacy')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Privacy Policy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert('Chat support coming soon!')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat Support
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/contact')}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => setShowLogoutDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

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
    </>
  );
}
