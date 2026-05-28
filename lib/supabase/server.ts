import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { getSupabaseEnv, isSupabaseConfigured, supabaseConfigErrorMessage } from './env';

export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(supabaseConfigErrorMessage());
  }

  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — cookies are set in middleware
        }
      },
    },
  });
}

export { isSupabaseConfigured };
