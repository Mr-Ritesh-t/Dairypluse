import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';

export const isSupabaseConfigured = ENV.IS_SUPABASE_CONFIGURED;

export const supabase: SupabaseClient = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Sign in with Google OAuth using Supabase Auth
 */
export async function signInWithGoogleOAuth(redirectTo?: string) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase Anon Key is not yet configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel or local .env file.'
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUrl = redirectTo || `${origin}/login`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmailPassword(email: string, pass: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase Anon Key is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmailPassword(email: string, pass: string, metadata?: Record<string, any>) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase Anon Key is not configured.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: metadata || {},
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in / Send OTP with Phone number
 */
export async function signInWithPhoneOtp(phone: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase Anon Key is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) throw error;
  return data;
}

/**
 * Verify OTP for Phone
 */
export async function verifyPhoneOtp(phone: string, token: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase Anon Key is not configured.');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) throw error;
  return data;
}

