import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  Car, 
  Crown, 
  Loader2, 
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Settings,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/api/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SubscriptionData {
  has_subscription: boolean;
  plan_id?: string;
  vehicle_count?: number;
  status?: string;
  current_period_end?: string;
  stripe_customer_id?: string;
  cancel_at_period_end?: boolean;
}

const PLAN_DETAILS: Record<string, { name: string; description: string; price: number; color: string }> = {
  starter: {
    name: 'Starter',
    description: 'Perfect for small local fleets',
    price: 19.90,
    color: 'bg-black',
  },
  pro: {
    name: 'Professional',
    description: 'For growing fleets needing advanced features',
    price: 34.90,
    color: 'bg-black',
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Full control for large organizations',
    price: 49.90,
    color: 'bg-black',
  },
};

export function BillingPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Get user info from localStorage
  const userInfo = localStorage.getItem('user_info')
    ? JSON.parse(localStorage.getItem('user_info') || '{}')
    : null;

  useEffect(() => {
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const userId = userInfo?.id;
      if (!userId) {
        toast({
          title: 'Error',
          description: 'User not found. Please log in again.',
          variant: 'destructive',
        });
        return;
      }

      const res = await apiRequest(`/api/stripe/subscription-status/${userId}`, { method: 'GET' });
      setSubscription(res);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading('billing');
      const userId = userInfo?.id;
      const res = await apiRequest(`/api/stripe/create-billing-portal/${userId}`, { method: 'POST' });
      
      if (res.url) {
        window.open(res.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading('cancel');
      const userId = userInfo?.id;
      await apiRequest(`/api/stripe/cancel-subscription/${userId}`, { method: 'POST' });
      
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will remain active until the end of the current billing period.',
      });
      
      fetchSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setShowCancelDialog(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status?: string, cancelAtPeriodEnd?: boolean) => {
    if (cancelAtPeriodEnd) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
          <Clock className="h-3 w-3 mr-1" />
          Cancelling
        </Badge>
      );
    }

    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'trialing':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            <Zap className="h-3 w-3 mr-1" />
            Trial
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Past Due
          </Badge>
        );
      case 'cancelled':
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
            {status || 'Unknown'}
          </Badge>
        );
    }
  };

  const planInfo = subscription?.plan_id ? PLAN_DETAILS[subscription.plan_id] : null;
  const monthlyTotal = planInfo && subscription?.vehicle_count 
    ? (planInfo.price * subscription.vehicle_count).toFixed(2) 
    : '0.00';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-gray-500 mt-1">Manage your subscription and payment details</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
      ) : !subscription?.has_subscription ? (
        /* No Subscription State */
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              You don't have an active subscription yet. Choose a plan to unlock all features and start managing your fleet.
            </p>
            <Button onClick={handleUpgrade} className="bg-black hover:bg-gray-800">
              <Crown className="h-4 w-4 mr-2" />
              View Plans & Subscribe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${planInfo?.color || 'bg-gray-500'} flex items-center justify-center`}>
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {planInfo?.name || subscription.plan_id} Plan
                    </CardTitle>
                    <CardDescription>{planInfo?.description}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vehicle Count */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Car className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicles</p>
                    <p className="text-2xl font-bold text-gray-900">{subscription.vehicle_count || 0}</p>
                  </div>
                </div>

                {/* Monthly Cost */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Total</p>
                    <p className="text-2xl font-bold text-gray-900">RM {monthlyTotal}</p>
                  </div>
                </div>

                {/* Renewal Date */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {subscription.cancel_at_period_end ? 'Ends On' : 'Renews On'}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Warning */}
              {subscription.cancel_at_period_end && (
                <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Subscription Ending</p>
                    <p className="text-sm text-gray-600">
                      Your subscription will end on {formatDate(subscription.current_period_end)}. 
                      You'll lose access to premium features after this date.
                    </p>
                  </div>
                </div>
              )}

              {/* Past Due Warning */}
              {subscription.status === 'past_due' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Payment Failed</p>
                    <p className="text-sm text-red-700">
                      Your last payment failed. Please update your payment method to avoid service interruption.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage Subscription
              </CardTitle>
              <CardDescription>Update your plan, payment method, or billing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stripe Billing Portal */}
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'billing'}
                >
                  <div className="flex items-center gap-2 w-full">
                    {actionLoading === 'billing' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                    <span className="font-medium">Manage Payment</span>
                    <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Update payment method, view invoices, and download receipts
                  </p>
                </Button>

                {/* Upgrade Plan */}
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={handleUpgrade}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Crown className="h-5 w-5" />
                    <span className="font-medium">Change Plan</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Upgrade or downgrade your subscription plan
                  </p>
                </Button>

                {/* Update Vehicle Count */}
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'billing'}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Car className="h-5 w-5" />
                    <span className="font-medium">Update Vehicles</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Add or remove vehicles from your subscription
                  </p>
                </Button>

                {/* Refresh Status */}
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={fetchSubscription}
                  disabled={loading}
                >
                  <div className="flex items-center gap-2 w-full">
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="font-medium">Refresh Status</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Sync your subscription status with Stripe
                  </p>
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Cancel Subscription */}
              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Cancel Subscription</p>
                    <p className="text-sm text-gray-500">
                      You'll continue to have access until the end of your billing period
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={actionLoading === 'cancel'}
                  >
                    {actionLoading === 'cancel' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Details</CardTitle>
              <CardDescription>Your subscription and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{planInfo?.name || subscription.plan_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{subscription.status}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Price per Vehicle</p>
                  <p className="font-medium">RM {planInfo?.price.toFixed(2) || '0.00'} / month</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Vehicle Count</p>
                  <p className="font-medium">{subscription.vehicle_count} vehicles</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Billing Period End</p>
                  <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Billing Email</p>
                  <p className="font-medium">{userInfo?.email || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access 
              to all features until {formatDate(subscription?.current_period_end)}, after which 
              your account will be downgraded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={actionLoading === 'cancel'}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={actionLoading === 'cancel'}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === 'cancel' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
