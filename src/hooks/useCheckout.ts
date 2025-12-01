import { useState } from 'react';
import { apiRequest } from '@/api/client';

export type PlanId = 'starter' | 'pro' | 'enterprise';

interface CheckoutRequest {
  planId: PlanId;
  vehicleCount: number;
  userEmail?: string;
  userId?: string;
}

interface CheckoutResponse {
  url: string;
  session_id: string;
}

interface EnterpriseContactRequest {
  name: string;
  email: string;
  companyName: string;
  companySize: string;
  fleetSize: number;
  message?: string;
}

interface SubscriptionStatus {
  has_subscription: boolean;
  plan_id?: PlanId;
  vehicle_count?: number;
  status?: string;
  current_period_end?: string;
}

interface UseCheckoutReturn {
  // Checkout
  createCheckoutSession: (data: CheckoutRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  
  // Enterprise contact
  submitEnterpriseContact: (data: EnterpriseContactRequest) => Promise<boolean>;
  isSubmittingContact: boolean;
  contactError: string | null;
  contactSuccess: boolean;
  
  // Subscription status
  getSubscriptionStatus: (userId: string) => Promise<SubscriptionStatus | null>;
  subscriptionStatus: SubscriptionStatus | null;
  isLoadingStatus: boolean;
  
  // Actions
  cancelSubscription: (userId: string) => Promise<boolean>;
  updateVehicleCount: (userId: string, vehicleCount: number) => Promise<boolean>;
}

export function useCheckout(): UseCheckoutReturn {
  // Checkout state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Enterprise contact state
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  
  // Subscription status state
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  /**
   * Create Stripe Checkout Session and redirect to Stripe
   */
  const createCheckoutSession = async (data: CheckoutRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: data.planId,
          vehicle_count: data.vehicleCount,
          user_email: data.userEmail,
          user_id: data.userId,
        }),
      }) as CheckoutResponse;

      if (response.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session';
      setError(message);
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Submit enterprise contact form
   */
  const submitEnterpriseContact = async (data: EnterpriseContactRequest): Promise<boolean> => {
    setIsSubmittingContact(true);
    setContactError(null);
    setContactSuccess(false);

    try {
      await apiRequest('/api/stripe/enterprise-contact', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company_name: data.companyName,
          company_size: data.companySize,
          fleet_size: data.fleetSize,
          message: data.message,
        }),
      });

      setContactSuccess(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit contact form';
      setContactError(message);
      console.error('Enterprise contact error:', err);
      return false;
    } finally {
      setIsSubmittingContact(false);
    }
  };

  /**
   * Get subscription status for a user
   */
  const getSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus | null> => {
    setIsLoadingStatus(true);

    try {
      const response = await apiRequest(
        `/api/stripe/subscription-status/${userId}`
      ) as SubscriptionStatus;
      setSubscriptionStatus(response);
      return response;
    } catch (err) {
      console.error('Subscription status error:', err);
      return null;
    } finally {
      setIsLoadingStatus(false);
    }
  };

  /**
   * Cancel subscription at period end
   */
  const cancelSubscription = async (userId: string): Promise<boolean> => {
    try {
      await apiRequest(`/api/stripe/cancel-subscription/${userId}`, {
        method: 'POST',
      });
      return true;
    } catch (err) {
      console.error('Cancel subscription error:', err);
      return false;
    }
  };

  /**
   * Update vehicle count (with proration)
   */
  const updateVehicleCount = async (userId: string, vehicleCount: number): Promise<boolean> => {
    try {
      await apiRequest(`/api/stripe/update-vehicle-count/${userId}?vehicle_count=${vehicleCount}`, {
        method: 'POST',
      });
      return true;
    } catch (err) {
      console.error('Update vehicle count error:', err);
      return false;
    }
  };

  return {
    // Checkout
    createCheckoutSession,
    isLoading,
    error,
    
    // Enterprise contact
    submitEnterpriseContact,
    isSubmittingContact,
    contactError,
    contactSuccess,
    
    // Subscription status
    getSubscriptionStatus,
    subscriptionStatus,
    isLoadingStatus,
    
    // Actions
    cancelSubscription,
    updateVehicleCount,
  };
}

export default useCheckout;
