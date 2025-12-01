import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { applyTheme } from '@/utils/themeManager';
import { apiRequest } from '@/api/client';
import { Separator } from '@/components/ui/separator';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Load user's theme preference on mount
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        console.log('Loading user theme from API');
        const res = await apiRequest('/api/settings/preferences', { method: 'GET' });
        const data = res?.data ? res.data : res;
        if (data?.preferences?.theme) {
          console.log('Found user theme:', data.preferences.theme);
          applyTheme(data.preferences.theme as 'light' | 'dark' | 'auto');
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
        // Silently fail - will use default theme
      }
    };
    
    loadUserTheme();
  }, []);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
