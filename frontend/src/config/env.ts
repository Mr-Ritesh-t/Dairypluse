/**
 * DairyPulse Environment Configuration
 * Centralized, type-safe environment variable management.
 */

const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZncGZsYXl5b2NzcHNyYWt1dnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjE3MDEsImV4cCI6MjEwODg5NzcwMX0.PK5a0B2dLvTfPcMQq3jZUqGrQAPYnAz8v6Q8H4OJqiw';

const DEFAULT_SUPABASE_URL = 'https://vgpflayyocspsrakuvvs.supabase.co';

function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (isLocalhost && (envUrl.includes('dairypulse-backend.onrender.com') || !envUrl)) {
      return 'http://localhost:8000/api/v1';
    }
  }
  const raw = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').trim().replace(/\/+$/, '');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
}

const apiBase = resolveApiBaseUrl();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  API_BASE_URL: apiBase,
  BACKEND_ROOT_URL: apiBase.replace(/\/api\/v1$/, ''),
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  SUPABASE_ANON_KEY: supabaseKey,
  IS_SUPABASE_CONFIGURED: Boolean(
    supabaseKey &&
    supabaseKey !== 'your-supabase-anon-key-here' &&
    supabaseKey.length > 20
  ),
} as const;

export default ENV;

