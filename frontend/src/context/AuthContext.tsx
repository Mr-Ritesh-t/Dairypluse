'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '@/types';
import { loginApi, syncSupabaseAuthApi } from '@/lib/api';
import {
  supabase,
  isSupabaseConfigured,
  signInWithGoogleOAuth,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signInWithPhoneOtp as sbSignInWithPhoneOtp,
  verifyPhoneOtp as sbVerifyPhoneOtp,
} from '@/lib/supabaseClient';

interface LoginResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  notFound?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    loginId: string;
    password?: string;
    role: UserRole;
    rememberMe?: boolean;
  }) => Promise<LoginResult>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  loginWithPhoneOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (phone: string, token: string, role: UserRole) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Load active user from localStorage and subscribe to Supabase Auth State
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

    // 2. Listen to real Supabase session changes (Google OAuth callback, Phone sign-in, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        try {
          const sbUser = session.user;
          const userEmail = sbUser.email || undefined;
          const userPhone = sbUser.phone || undefined;
          const meta = sbUser.user_metadata || {};
          const fullName = meta.full_name || meta.name || (userEmail ? userEmail.split('@')[0] : 'DairyPulse User');
          
          // Role stored in localStorage from OAuth initiation or defaults to CUSTOMER
          const savedRole = (localStorage.getItem('dairypulse_oauth_role') as UserRole) || 'CUSTOMER';

          // Sync with FastAPI backend
          const synced = await syncSupabaseAuthApi({
            email: userEmail,
            phone: userPhone,
            name: fullName,
            role: savedRole,
            supabase_id: sbUser.id,
            provider: sbUser.app_metadata?.provider || 'supabase',
          });

          if (synced && synced.id) {
            const authUser: AuthUser = {
              id: synced.id,
              name: synced.name,
              role: (synced.role as UserRole) || savedRole,
              loginId: synced.login_id || userEmail || userPhone || '',
              phone: synced.phone || userPhone,
              email: synced.email || userEmail,
              assignedAreaOrRoute: synced.assigned_area_or_route,
              customerId: synced.customer_id,
              dairyName: synced.dairy_name,
              token: synced.token,
            };
            setUser(authUser);
            localStorage.setItem('dairypulse_auth_user', JSON.stringify(authUser));
            localStorage.removeItem('dairypulse_oauth_role');
          }
        } catch (syncErr) {
          console.error('Failed to sync Supabase auth session with database:', syncErr);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('dairypulse_auth_user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Real credentials login against database
   */
  const login = async ({
    loginId,
    password,
    role,
    rememberMe = true,
  }: {
    loginId: string;
    password?: string;
    role: UserRole;
    rememberMe?: boolean;
  }): Promise<LoginResult> => {
    setIsLoading(true);

    try {
      // 1. Query live database backend
      const apiResponse = await loginApi({
        login_id: loginId.trim(),
        password: password?.trim(),
        role,
      });

      if (!apiResponse || !apiResponse.id) {
        throw new Error('Invalid credentials or account does not exist.');
      }

      const authenticatedUser: AuthUser = {
        id: apiResponse.id,
        name: apiResponse.name,
        role: (apiResponse.role as UserRole) || role,
        loginId: apiResponse.login_id || loginId,
        phone: apiResponse.phone,
        email: apiResponse.email,
        assignedAreaOrRoute: apiResponse.assigned_area_or_route,
        customerId: apiResponse.customer_id,
        dairyName: apiResponse.dairy_name,
        token: apiResponse.token,
      };

      setUser(authenticatedUser);
      if (rememberMe) {
        localStorage.setItem('dairypulse_auth_user', JSON.stringify(authenticatedUser));
      }

      return { success: true, user: authenticatedUser };
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please check credentials.';
      const isNotFound = err.status === 404 || errorMsg.toLowerCase().includes('no account found') || errorMsg.toLowerCase().includes('not found');

      return {
        success: false,
        error: errorMsg,
        notFound: isNotFound,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google OAuth Sign-In via Supabase Auth
   */
  const loginWithGoogle = async (role: UserRole) => {
    try {
      localStorage.setItem('dairypulse_oauth_role', role);
      await signInWithGoogleOAuth();
    } catch (err: any) {
      localStorage.removeItem('dairypulse_oauth_role');
      throw new Error(err.message || 'Google sign-in initiation failed.');
    }
  };

  /**
   * Send SMS OTP via Supabase Auth for phone authentication
   */
  const loginWithPhoneOtp = async (phone: string) => {
    try {
      await sbSignInWithPhoneOtp(phone);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP.' };
    }
  };

  /**
   * Verify Phone OTP via Supabase Auth
   */
  const verifyPhoneOtp = async (phone: string, token: string, role: UserRole): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const data = await sbVerifyPhoneOtp(phone, token);
      if (!data.user) {
        throw new Error('OTP verification failed.');
      }

      // Sync verified phone user with backend
      const synced = await syncSupabaseAuthApi({
        phone,
        name: `User ${phone.slice(-4)}`,
        role,
        supabase_id: data.user.id,
        provider: 'phone',
      });

      const authUser: AuthUser = {
        id: synced.id,
        name: synced.name,
        role: (synced.role as UserRole) || role,
        loginId: phone,
        phone,
        email: synced.email,
        assignedAreaOrRoute: synced.assigned_area_or_route,
        customerId: synced.customer_id,
        dairyName: synced.dairy_name,
        token: synced.token,
      };

      setUser(authUser);
      localStorage.setItem('dairypulse_auth_user', JSON.stringify(authUser));
      return { success: true, user: authUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid or expired OTP code.' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Real Logout
   */
  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem('dairypulse_auth_user');
        localStorage.removeItem('dairypulse_oauth_role');
      } catch (e) {
        console.error(e);
      }
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
        loginWithGoogle,
        loginWithPhoneOtp,
        verifyPhoneOtp,
        logout,
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
