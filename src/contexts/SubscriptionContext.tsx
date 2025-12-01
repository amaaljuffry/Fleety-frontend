import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiRequest, getAuthToken } from '@/api/client';

// Types
export interface SubscriptionInfo {
  plan_id: string | null;
  status: string | null;
  vehicle_count: number | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  is_active: boolean;
}

interface SubscriptionContextValue {
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  error: string | null;
  isActive: boolean;
  planId: string | null;
  
  // Methods
  refreshSubscription: () => Promise<void>;
  setSubscriptionData: (data: SubscriptionInfo | null) => void;
  hasAccess: (requiredPlan?: string) => boolean;
  clearSubscription: () => void;
}

// Plan hierarchy for access control
const PLAN_HIERARCHY: Record<string, number> = {
  starter: 1,
  pro: 2,
  enterprise: 3,
};

// Context
const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

// Provider Props
interface SubscriptionProviderProps {
  children: ReactNode;
}

// Helper to get subscription from localStorage
const getStoredSubscription = (): SubscriptionInfo | null => {
  try {
    const stored = localStorage.getItem('subscription_info');
    console.log('📦 SubscriptionContext - getStoredSubscription:', stored);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('📦 SubscriptionContext - Error parsing stored subscription:', e);
    return null;
  }
};

// Provider Component
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  // Initialize from localStorage for immediate access
  const storedSub = getStoredSubscription();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(storedSub);
  // Don't show loading if we have valid stored subscription
  const [isLoading, setIsLoading] = useState(storedSub?.is_active !== true);
  const [error, setError] = useState<string | null>(null);

  console.log('📦 SubscriptionContext - Initial state:', { 
    storedSub, 
    isLoading: storedSub?.is_active !== true,
    isActive: storedSub?.is_active 
  });

  // Fetch subscription status from /api/auth/me
  const refreshSubscription = useCallback(async () => {
    const token = getAuthToken();
    console.log('📦 SubscriptionContext - refreshSubscription called, token:', !!token);
    
    if (!token) {
      setSubscription(null);
      setIsLoading(false);
      localStorage.removeItem('subscription_info');
      return;
    }

    try {
      // Only show loading if we don't already have a valid subscription
      const currentSub = getStoredSubscription();
      if (!currentSub?.is_active) {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await apiRequest('/api/auth/me');
      console.log('📦 SubscriptionContext - API response:', response);
      
      if (response.subscription) {
        console.log('📦 SubscriptionContext - Setting subscription:', response.subscription);
        setSubscription(response.subscription);
        localStorage.setItem('subscription_info', JSON.stringify(response.subscription));
      } else {
        console.log('📦 SubscriptionContext - No subscription in response');
        setSubscription(null);
        localStorage.removeItem('subscription_info');
      }
    } catch (err) {
      console.error('📦 SubscriptionContext - Failed to fetch subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      // Don't clear subscription on API error if we have a valid stored one
      const storedSub = getStoredSubscription();
      if (!storedSub?.is_active) {
        setSubscription(null);
        localStorage.removeItem('subscription_info');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set subscription data directly (from login response)
  const setSubscriptionData = useCallback((data: SubscriptionInfo | null) => {
    setSubscription(data);
    // Persist to localStorage for immediate access on page reload/navigation
    if (data) {
      localStorage.setItem('subscription_info', JSON.stringify(data));
    } else {
      localStorage.removeItem('subscription_info');
    }
    setIsLoading(false);
    setError(null);
  }, []);

  // Clear subscription (on logout)
  const clearSubscription = useCallback(() => {
    setSubscription(null);
    localStorage.removeItem('subscription_info');
    setError(null);
  }, []);

  // Check if user has access to a specific plan level
  const hasAccess = useCallback((requiredPlan?: string): boolean => {
    if (!subscription?.is_active) {
      return false;
    }

    if (!requiredPlan) {
      return true; // Any active subscription is enough
    }

    const userLevel = PLAN_HIERARCHY[subscription.plan_id || ''] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;

    return userLevel >= requiredLevel;
  }, [subscription]);

  // Computed values
  const isActive = subscription?.is_active ?? false;
  const planId = subscription?.plan_id ?? null;

  // Load subscription on mount
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Listen for storage events (login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        refreshSubscription();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshSubscription]);

  const value: SubscriptionContextValue = {
    subscription,
    isLoading,
    error,
    isActive,
    planId,
    refreshSubscription,
    setSubscriptionData,
    hasAccess,
    clearSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Hook to use subscription context
export const useSubscription = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
