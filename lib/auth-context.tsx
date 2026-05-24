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
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
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
    createdAt: u.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        setOrganization(mockOrganizations[0]);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        setOrganization(mockOrganizations[0]);
      } else {
        setUser(null);
        setOrganization(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) throw error;
    if (data.user) {
      setUser(mapSupabaseUser(data.user));
      setOrganization(mockOrganizations[0]);
    }
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: username },
      },
    });
    setIsLoading(false);
    if (error) throw error;
    if (data.user) {
      setUser(mapSupabaseUser(data.user));
      setOrganization(mockOrganizations[0]);
    }
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setOrganization(null);
  }, []);

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
