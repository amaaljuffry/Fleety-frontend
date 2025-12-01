import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Trash2, LogOut, Loader2, CreditCard, ChevronRight } from 'lucide-react';
import { apiRequest, authAPI } from '@/api/client';
import { capitalizeWords } from '@/lib/utils';

export function SettingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    remindersEnabled: true,
    currency: 'USD',
    distanceUnit: 'miles',
  });
  const [account, setAccount] = useState({
    email: '',
    full_name: '',
  });

  const user = localStorage.getItem('user_info')
    ? JSON.parse(localStorage.getItem('user_info') || '{}')
    : null;

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/settings/preferences', { method: 'GET' });
      
      // Handle both direct object and wrapped response
      const data = res?.data ? res.data : res;
      
      if (data && data.preferences) {
        const prefs = data.preferences;
        setPreferences({
          emailNotifications: prefs.email_notifications ?? true,
          remindersEnabled: prefs.reminders_enabled ?? true,
          currency: prefs.currency ?? 'USD',
          distanceUnit: prefs.distance_unit ?? 'miles',
        });
        setAccount({
          email: data.email,
          full_name: data.full_name,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key: string, value: unknown) => {
    const newPreferences = {
      ...preferences,
      [key]: value,
    };
    setPreferences(newPreferences);

    try {
      setSaving(true);
      const updateData: Record<string, unknown> = {};
      
      if (key === 'emailNotifications') updateData.email_notifications = value;
      if (key === 'remindersEnabled') updateData.reminders_enabled = value;
      if (key === 'currency') updateData.currency = value;
      if (key === 'distanceUnit') updateData.distance_unit = value;

      await apiRequest('/api/settings/preferences', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      toast({
        title: 'Success',
        description: 'Preference updated successfully',
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preference',
        variant: 'destructive',
      });
      // Revert change
      fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await apiRequest('/api/settings/account', { method: 'DELETE' });
      
      logout();
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted',
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordDialog(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
      ) : (
        <>
          {/* Account Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-black" />
                <CardTitle>Account Information</CardTitle>
              </div>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullname" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullname"
                    value={capitalizeWords(account.full_name)}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={account.email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Account information is read-only. Contact support to modify your details.
              </p>
            </CardContent>
          </Card>

          {/* Subscription & Billing */}
          <Card className="border-2 border-gray-100 hover:border-gray-200 transition-colors cursor-pointer" onClick={() => navigate('/billing')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-black" />
                  <CardTitle>Subscription & Billing</CardTitle>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <CardDescription>Manage your subscription, payment methods, and billing details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  View and manage your subscription plan, update payment methods, and access invoices.
                </div>
                <Button 
                  variant="outline" 
                  className="shrink-0 ml-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/billing');
                  }}
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-black" />
            <CardTitle>Preferences</CardTitle>
          </div>
          <CardDescription>Customize your application experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium text-gray-900">Email Notifications</Label>
              <p className="text-sm text-gray-500 mt-0.5">
                Receive email updates about maintenance reminders
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(value) => handlePreferenceChange('emailNotifications', value)}
            />
          </div>

          {/* Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium text-gray-900">Reminder Notifications</Label>
              <p className="text-sm text-gray-500 mt-0.5">Enable in-app reminder notifications</p>
            </div>
            <Switch
              checked={preferences.remindersEnabled}
              onCheckedChange={(value) => handlePreferenceChange('remindersEnabled', value)}
            />
          </div>

          {/* Currency */}
          <div>
            <Label className="text-base font-medium text-gray-900">Currency</Label>
            <p className="text-sm text-gray-500 mt-0.5">Default currency for cost tracking</p>
            <Select
              value={preferences.currency}
              onValueChange={(value) => handlePreferenceChange('currency', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                <SelectItem value="RM">Ringgit Malaysia (RM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance Unit */}
          <div>
            <Label className="text-base font-medium text-gray-900">Distance Unit</Label>
            <p className="text-sm text-gray-500 mt-0.5">Default unit for distance and mileage</p>
            <Select
              value={preferences.distanceUnit}
              onValueChange={(value) => handlePreferenceChange('distanceUnit', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="miles">Miles (mi)</SelectItem>
                <SelectItem value="km">Kilometers (km)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-black" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Change Password</h4>
            <p className="text-sm text-gray-500 mb-3">Update your password regularly to keep your account secure</p>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => setShowPasswordDialog(true)}
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-800">Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex-1 justify-start gap-2 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 justify-start gap-2 border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-red-700 mt-3">
            <strong>Warning:</strong> Deleting your account will permanently remove all your data,
            vehicles, and maintenance records. This action cannot be undone.
          </p>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current password and choose a new one. Password must be at least 8 characters long.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password" className="text-sm font-medium text-gray-700">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangePassword}
              disabled={saving}
              className="bg-black hover:bg-gray-900"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure? This will permanently delete your account and all associated
              data including vehicles, maintenance records, and reminders. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}
      </div>
    </div>
  );
}
