'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '@/types';
import { loginApi } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    loginId: string;
    password?: string;
    role: UserRole;
    otp?: string;
    rememberMe?: boolean;
  }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  quickSwitchUser: (role: UserRole) => void;
  updateUser: (fields: Partial<AuthUser>) => void;
}

const defaultAdminUser: AuthUser = {
  id: 'usr-owner-001',
  name: 'Ritesh Tayade',
  role: 'OWNER',
  loginId: 'admin@dairypulse.farm',
  phone: '+91 98765 43210',
  email: 'admin@dairypulse.farm',
  assignedAreaOrRoute: 'HQ Farm & Chilling Center',
  token: 'dp_owner_token_default',
};

const demoPersonas: Record<UserRole, AuthUser> = {
  OWNER: {
    id: 'usr-owner-001',
    name: 'Ritesh Tayade',
    role: 'OWNER',
    loginId: 'admin@dairypulse.farm',
    phone: '+91 98765 43210',
    email: 'admin@dairypulse.farm',
    assignedAreaOrRoute: 'HQ Farm & Chilling Center',
    token: 'dp_owner_active_token',
  },
  DELIVERY: {
    id: 'st-001',
    name: 'Rahul Deshmukh',
    role: 'DELIVERY',
    loginId: '+91 98220 11984',
    phone: '+91 98220 11984',
    email: 'rahul.deshmukh@dairypulse.farm',
    assignedAreaOrRoute: 'Baner & Central Market (Route R-04)',
    token: 'dp_rider_active_token',
  },
  CUSTOMER: {
    id: 'c2',
    name: 'Priya Kulkarni',
    role: 'CUSTOMER',
    loginId: '+91 98200 44551',
    phone: '+91 98200 44551',
    email: 'priya.k@example.com',
    assignedAreaOrRoute: 'Aundh Morning Route A-1',
    customerId: 'c2',
    token: 'dp_cust_active_token',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dairypulse_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async ({
    loginId,
    password,
    role,
    otp,
    rememberMe = true,
  }: {
    loginId: string;
    password?: string;
    role: UserRole;
    otp?: string;
    rememberMe?: boolean;
  }): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    setIsLoading(true);

    try {
      // 1. Try backend API login
      const apiResponse = await loginApi({
        login_id: loginId,
        password: password || otp,
        role,
      });

      let authenticatedUser: AuthUser;

      if (apiResponse && apiResponse.id) {
        authenticatedUser = {
          id: apiResponse.id,
          name: apiResponse.name,
          role: (apiResponse.role as UserRole) || role,
          loginId: apiResponse.login_id || loginId,
          phone: apiResponse.phone,
          email: apiResponse.email,
          assignedAreaOrRoute: apiResponse.assigned_area_or_route,
          customerId: apiResponse.customer_id,
          token: apiResponse.token,
        };
      } else {
        // 2. Offline / local fallback authentication
        const persona = demoPersonas[role];
        authenticatedUser = {
          ...persona,
          loginId: loginId || persona.loginId,
          name: role === 'OWNER' && loginId && !loginId.includes('admin') ? loginId.split('@')[0] : persona.name,
        };
      }

      setUser(authenticatedUser);
      if (rememberMe) {
        localStorage.setItem('dairypulse_auth_user', JSON.stringify(authenticatedUser));
      }

      return { success: true, user: authenticatedUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check credentials.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('dairypulse_auth_user');
    } catch (e) {
      console.error(e);
    }
  };

  const quickSwitchUser = (role: UserRole) => {
    const nextUser = demoPersonas[role];
    setUser(nextUser);
    try {
      localStorage.setItem('dairypulse_auth_user', JSON.stringify(nextUser));
    } catch (e) {
      console.error(e);
    }
  };

  const updateUser = (fields: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      try {
        localStorage.setItem('dairypulse_auth_user', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        quickSwitchUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
