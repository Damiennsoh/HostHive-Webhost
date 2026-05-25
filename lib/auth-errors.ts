import type { AuthError } from '@supabase/supabase-js';

export function mapAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Something went wrong. Please try again.';
  }

  const authError = error as AuthError;
  const message = authError.message ?? '';
  const code = authError.code ?? '';

  if (
    code === 'email_not_confirmed' ||
    message.toLowerCase().includes('email not confirmed')
  ) {
    return 'Please confirm your email using the link we sent, then sign in again.';
  }

  if (
    code === 'invalid_credentials' ||
    message.toLowerCase().includes('invalid login credentials')
  ) {
    return 'Invalid email or password. If you just registered, confirm your email first (check spam).';
  }

  if (message.toLowerCase().includes('user already registered')) {
    return 'This email is already registered. Try signing in instead.';
  }

  if (message.toLowerCase().includes('password')) {
    return message;
  }

  return message || 'Authentication failed. Please try again.';
}

export function getAppOrigin(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';
}
