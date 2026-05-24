import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { MOCK_AUTH_ENABLED } from '@/lib/mock-auth';

export type AuthResult = {
  user: User;
  isDemo: boolean;
  supabase: Awaited<ReturnType<typeof createClient>> | null;
};

export async function requireAuth(): Promise<AuthResult | NextResponse> {
  if (MOCK_AUTH_ENABLED) {
    const cookieStore = await cookies();
    if (cookieStore.get('hosthive_mock')?.value === '1') {
      return {
        user: {
          id: 'mock_user',
          email: 'demo@hosthive.app',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User', plan: 'startup' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User,
        isDemo: true,
        supabase: null,
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user, isDemo: false, supabase };
}

export function isAuthError(
  result: AuthResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
