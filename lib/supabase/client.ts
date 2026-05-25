'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { getSupabaseEnv, isSupabaseConfigured, supabaseConfigErrorMessage } from './env';

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(supabaseConfigErrorMessage());
  }

  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}

/** Safe client for optional use — returns null instead of throwing. */
export function tryCreateClient() {
  if (!isSupabaseConfigured()) return null;
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}

export { isSupabaseConfigured, supabaseConfigErrorMessage };
