import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "@/api/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SubscriptionRequired } from "./SubscriptionRequired";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
  requiredPlan?: 'starter' | 'pro' | 'enterprise';
}

export default function ProtectedRoute({ 
  children, 
  requireSubscription = false,
  requiredPlan 
}: ProtectedRouteProps) {
  const token = getAuthToken();
  const { isActive, hasAccess, isLoading, planId } = useSubscription();

  // Check authentication first
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If subscription check is required
  if (requireSubscription) {
    // Show loading while checking subscription
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      );
    }

    // Check if user has active subscription
    if (!isActive) {
      return <SubscriptionRequired type="no_subscription" />;
    }

    // Check if user has required plan level
    if (requiredPlan && !hasAccess(requiredPlan)) {
      return (
        <SubscriptionRequired 
          type="upgrade_required" 
          currentPlan={planId} 
          requiredPlan={requiredPlan} 
        />
      );
    }
  }

  return <>{children}</>;
}

// Named export for compatibility
export { ProtectedRoute };
