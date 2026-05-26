'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User, Organization } from './types';
import {
  MOCK_AUTH_ENABLED,
} from './mock-auth';
import {
  tryCreateClient,
  isSupabaseConfigured,
  supabaseConfigErrorMessage,
} from '@/lib/supabase/client';
import { getAppOrigin, mapAuthErrorMessage } from '@/lib/auth-errors';
import { useRouter } from 'next/navigation';

export interface RegisterResult {
  /** User must confirm email before sign-in (Supabase default). */
  needsEmailConfirmation: boolean;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  configError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function organizationFromPlan(plan: User['plan'] = 'free'): Organization {
  let orgPlan: Organization['plan'] = 'free';
  if (plan === 'pro') orgPlan = 'pro';
  else if (plan === 'startup') orgPlan = 'startup';
  else if (plan === 'enterprise') orgPlan = 'enterprise';
  else if (plan === 'team') orgPlan = 'pro'; // Map team to pro if needed
  
  return {
    id: 'org_personal',
    name: 'Personal',
    slug: 'personal',
    plan: orgPlan,
  };
}

async function loadProfile(
  supabase: NonNullable<ReturnType<typeof tryCreateClient>>,
  supabaseUser: SupabaseUser
): Promise<User> {
  const { data: profile } = await supabase
    .from('users')
    .select('name, avatar_url')
    .eq('id', supabaseUser.id)
    .maybeSingle() as any;

  // Plan is not currently in the users table, defaulting to 'free'
  const plan: User['plan'] = 'free';

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    username:
      profile?.name ??
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.email?.split('@')[0] ??
      'user',
    avatar: profile?.avatar_url ?? supabaseUser.user_metadata?.avatar_url,
    plan,
    createdAt: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const applyUser = useCallback((mapped: User | null) => {
    setUser(mapped);
    setOrganization(mapped ? organizationFromPlan(mapped.plan) : null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = tryCreateClient();
    if (!supabase) return;
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    if (supabaseUser) {
      const mapped = await loadProfile(supabase, supabaseUser);
      applyUser(mapped);
    }
  }, [applyUser]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigError(supabaseConfigErrorMessage());
      setIsLoading(false);
      return;
    }

    const supabase = tryCreateClient();
    if (!supabase) {
      setConfigError(supabaseConfigErrorMessage());
      setIsLoading(false);
      return;
    }

    setConfigError(null);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const mapped = await loadProfile(supabase, session.user);
        applyUser(mapped);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const mapped = await loadProfile(supabase, session.user);
        applyUser(mapped);
      } else {
        applyUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [applyUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const supabase = tryCreateClient();
        if (!supabase) throw new Error(supabaseConfigErrorMessage());

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) {
          throw new Error('Sign-in failed. Confirm your email if you recently registered.');
        }
        if (data.user) {
          const mapped = await loadProfile(supabase, data.user);
          applyUser(mapped);
        }
      } catch (err) {
        throw new Error(mapAuthErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [applyUser]
  );

  const register = useCallback(
    async (email: string, username: string, password: string): Promise<RegisterResult> => {
      setIsLoading(true);
      try {
        const supabase = tryCreateClient();
        if (!supabase) throw new Error(supabaseConfigErrorMessage());

        const appOrigin = getAppOrigin();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: username },
            emailRedirectTo: `${appOrigin}/auth/callback?next=/dashboard`,
          },
        });
        if (error) throw error;

        // Email confirmation ON: session is null until user clicks email link
        if (!data.session) {
          return { needsEmailConfirmation: true };
        }

        if (data.user) {
          const mapped = await loadProfile(supabase, data.user);
          applyUser(mapped);
        }
        return { needsEmailConfirmation: false };
      } catch (err) {
        throw new Error(mapAuthErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [applyUser]
  );

  const logout = useCallback(async () => {
    const supabase = tryCreateClient();
    if (supabase) await supabase.auth.signOut();
    applyUser(null);
    router.push('/');
  }, [applyUser, router]);

  const switchOrganization = useCallback(
    (_orgId: string) => {
      if (user) setOrganization(organizationFromPlan(user.plan));
    },
    [user]
  );

  const organizations: Organization[] = user ? [organizationFromPlan(user.plan)] : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        organizations,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode: false,
        configError,
        login,
        register,
        logout,
        switchOrganization,
        refreshProfile,
      }}
    >
      {configError && (
        <div
          role="alert"
          className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100"
        >
          {configError}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
