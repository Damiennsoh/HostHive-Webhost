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
import { MOCK_AUTH_ENABLED, getMockUser, setMockUser, clearMockUser, createMockUser } from './mock-auth';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function organizationFromPlan(plan: User['plan'] = 'free'): Organization {
  return {
    id: 'org_personal',
    name: 'Personal',
    slug: 'personal',
    plan: plan === 'startup' || plan === 'team' ? plan : plan === 'pro' ? 'pro' : 'free',
  };
}

async function loadProfile(supabaseUser: SupabaseUser): Promise<User> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, plan')
    .eq('id', supabaseUser.id)
    .single();

  const plan = (profile?.plan as User['plan']) ?? 'free';

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    username:
      profile?.full_name ??
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.email?.split('@')[0] ??
      'user',
    avatar: profile?.avatar_url ?? supabaseUser.user_metadata?.avatar_url,
    plan,
    createdAt: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const useMockAuth = MOCK_AUTH_ENABLED;

  const applyUser = useCallback((mapped: User | null) => {
    setUser(mapped);
    setOrganization(mapped ? organizationFromPlan(mapped.plan) : null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (useMockAuth) return;
    const supabase = createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    if (supabaseUser) {
      const mapped = await loadProfile(supabaseUser);
      applyUser(mapped);
    }
  }, [useMockAuth, applyUser]);

  useEffect(() => {
    if (useMockAuth) {
      const stored = getMockUser();
      if (stored) applyUser(stored);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const mapped = await loadProfile(session.user);
        applyUser(mapped);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const mapped = await loadProfile(session.user);
        applyUser(mapped);
      } else {
        applyUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [useMockAuth, applyUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        if (useMockAuth) {
          const mockUser = createMockUser(email, undefined, 'free');
          setMockUser(mockUser);
          applyUser(mockUser);
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const mapped = await loadProfile(data.user);
          applyUser(mapped);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [useMockAuth, applyUser]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setIsLoading(true);
      try {
        if (useMockAuth) {
          const mockUser = createMockUser(email, username, 'free');
          setMockUser(mockUser);
          applyUser(mockUser);
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: username },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data.user) {
          const mapped = await loadProfile(data.user);
          applyUser(mapped);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [useMockAuth, applyUser]
  );

  const logout = useCallback(async () => {
    if (useMockAuth) {
      clearMockUser();
      applyUser(null);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    applyUser(null);
  }, [useMockAuth, applyUser]);

  const switchOrganization = useCallback(
    (_orgId: string) => {
      if (user) setOrganization(organizationFromPlan(user.plan));
    },
    [user]
  );

  const organizations: Organization[] = user
    ? [organizationFromPlan(user.plan)]
    : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        organizations,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode: useMockAuth,
        login,
        register,
        logout,
        switchOrganization,
        refreshProfile,
      }}
    >
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
