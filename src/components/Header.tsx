import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { capitalizeWords } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'No data',
        description: 'Nothing to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exported',
      description: `${filename} exported successfully`,
    });
  };

  const exportToJSON = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'No data',
        description: 'Nothing to export',
        variant: 'destructive',
      });
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exported',
      description: `${filename} exported successfully`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    navigate('/');
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between h-20 px-6 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome{user ? `, ${capitalizeWords(user.full_name)}` : ''}
            </h2>
            <p className="text-xs text-gray-500">Manage your vehicle maintenance</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Export Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    exportToCSV([], 'data');
                    setShowExportMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 text-sm"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => {
                    exportToJSON([], 'data');
                    setShowExportMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{capitalizeWords(user.full_name)}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogoutDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>

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
