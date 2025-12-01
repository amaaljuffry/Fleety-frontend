import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAuthToken, setAuthToken as saveAuthToken, clearAuthToken, authAPI } from '@/api/client';

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active?: boolean;
  subscription?: {
    plan_id: string | null;
    status: string | null;
    is_active: boolean;
  };
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Helper to get user from localStorage
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user_info');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('🔐 AuthContext - Error parsing stored user:', e);
    return null;
  }
};

// Helper to save user to localStorage
const saveUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('user_info', JSON.stringify(user));
  } else {
    localStorage.removeItem('user_info');
  }
};

// Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize from localStorage for immediate access
  const storedUser = getStoredUser();
  const storedToken = getAuthToken();
  
  const [user, setUser] = useState<User | null>(storedUser);
  const [isLoading, setIsLoading] = useState<boolean>(!!storedToken && !storedUser);
  const [error, setError] = useState<string | null>(null);

  console.log('🔐 AuthContext - Initial state:', { 
    storedUser: !!storedUser, 
    storedToken: !!storedToken,
    isLoading 
  });

  // Fetch user data from /api/auth/me
  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    console.log('🔐 AuthContext - refreshUser called, token:', !!token);
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      saveUser(null);
      localStorage.removeItem('subscription_info');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.me();
      console.log('🔐 AuthContext - API response:', response);
      
      if (response) {
        const userData: User = {
          id: response.id,
          email: response.email,
          full_name: response.full_name,
          is_active: response.is_active,
          subscription: response.subscription
        };
        
        setUser(userData);
        saveUser(userData);
        
        // Also update subscription in localStorage for SubscriptionContext
        if (response.subscription) {
          localStorage.setItem('subscription_info', JSON.stringify(response.subscription));
        }
      } else {
        console.log('🔐 AuthContext - No user in response');
        setUser(null);
        saveUser(null);
      }
    } catch (err) {
      console.error('🔐 AuthContext - Failed to fetch user:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      
      // Only clear user if we get a clear auth error
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('Not authenticated') || 
          errorMessage.includes('Invalid token') ||
          errorMessage.includes('Token has expired')) {
        setUser(null);
        saveUser(null);
        clearAuthToken();
        localStorage.removeItem('subscription_info');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login method
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      console.log('🔐 AuthContext - Login response:', response);
      
      // Store token
      saveAuthToken(response.access_token);
      
      // Store user info
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name,
        is_active: response.user.is_active,
        subscription: response.user.subscription
      };
      
      setUser(userData);
      saveUser(userData);
      
      // Store subscription info
      if (response.user.subscription) {
        localStorage.setItem('subscription_info', JSON.stringify(response.user.subscription));
      }
      
      console.log('🔐 AuthContext - Login successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err; // Re-throw to let calling component handle it
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout method
  const logout = useCallback(() => {
    console.log('🔐 AuthContext - Logging out');
    setUser(null);
    saveUser(null);
    clearAuthToken();
    localStorage.removeItem('subscription_info');
    setError(null);
  }, []);

  // Update user data (for settings changes, etc.)
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      saveUser(updated);
      return updated;
    });
  }, []);

  // Computed values
  const isAuthenticated = !!user && !!getAuthToken();

  // Load user on mount if token exists
  useEffect(() => {
    const token = getAuthToken();
    if (token && !user) {
      console.log('🔐 AuthContext - Token exists but no user, fetching...');
      refreshUser();
    }
  }, [user, refreshUser]);

  // Listen for storage events (login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        console.log('🔐 AuthContext - Token changed in another tab');
        refreshUser();
      } else if (e.key === 'user_info') {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        console.log('🔐 AuthContext - User info changed in another tab');
        setUser(newUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUser]);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
