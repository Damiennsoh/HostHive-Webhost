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
import { mockOrganizations } from './mock-data';
import {
  MOCK_AUTH_ENABLED,
  getMockUser,
  setMockUser,
  clearMockUser,
  createMockUser,
  isSupabaseConfigured,
} from './mock-auth';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(u: SupabaseUser): User {
  return {
    id: u.id,
    email: u.email ?? '',
    username: u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? '',
    avatar: u.user_metadata?.avatar_url,
    plan: (u.user_metadata?.plan as User['plan']) ?? 'free',
    createdAt: u.created_at,
  };
}

function pickOrganization(plan: User['plan'] = 'free'): Organization {
  if (plan === 'enterprise') return mockOrganizations.find((o) => o.plan === 'enterprise') ?? mockOrganizations[0];
  if (plan === 'pro') return mockOrganizations.find((o) => o.plan === 'pro') ?? mockOrganizations[0];
  if (plan === 'startup') return mockOrganizations.find((o) => o.slug === 'startup-inc') ?? mockOrganizations[0];
  return mockOrganizations[0];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const useMockAuth = MOCK_AUTH_ENABLED || !isSupabaseConfigured();

  useEffect(() => {
    if (useMockAuth) {
      const stored = getMockUser();
      if (stored) {
        setUser(stored);
        setOrganization(pickOrganization(stored.plan));
      }
      setIsLoading(false);
      return;
    }

    import('@/lib/supabase/client')
      .then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const mapped = mapSupabaseUser(session.user);
            setUser(mapped);
            setOrganization(pickOrganization(mapped.plan));
          }
          setIsLoading(false);
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const mapped = mapSupabaseUser(session.user);
            setUser(mapped);
            setOrganization(pickOrganization(mapped.plan));
          } else {
            setUser(null);
            setOrganization(null);
          }
        });

        return () => subscription.unsubscribe();
      })
      .catch(() => setIsLoading(false));
  }, [useMockAuth]);

  const login = useCallback(
    async (email: string, _password: string) => {
      setIsLoading(true);
      if (useMockAuth) {
        const mockUser = createMockUser(email, undefined, 'free');
        setMockUser(mockUser);
        setUser(mockUser);
        setOrganization(pickOrganization('free'));
        setIsLoading(false);
        return;
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: _password });
      setIsLoading(false);
      if (error) throw error;
      if (data.user) {
        const mapped = mapSupabaseUser(data.user);
        setUser(mapped);
        setOrganization(pickOrganization(mapped.plan));
      }
    },
    [useMockAuth]
  );

  const register = useCallback(
    async (email: string, username: string, _password: string) => {
      setIsLoading(true);
      if (useMockAuth) {
        const mockUser = createMockUser(email, username, 'free');
        setMockUser(mockUser);
        setUser(mockUser);
        setOrganization(pickOrganization('free'));
        setIsLoading(false);
        return;
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: _password,
        options: { data: { full_name: username } },
      });
      setIsLoading(false);
      if (error) throw error;
      if (data.user) {
        const mapped = mapSupabaseUser(data.user);
        setUser(mapped);
        setOrganization(pickOrganization(mapped.plan));
      }
    },
    [useMockAuth]
  );

  const logout = useCallback(async () => {
    if (useMockAuth) {
      clearMockUser();
      setUser(null);
      setOrganization(null);
      return;
    }
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setOrganization(null);
  }, [useMockAuth]);

  const switchOrganization = useCallback((orgId: string) => {
    const org = mockOrganizations.find((o) => o.id === orgId);
    if (org) setOrganization(org);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        organizations: mockOrganizations,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode: useMockAuth,
        login,
        register,
        logout,
        switchOrganization,
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
