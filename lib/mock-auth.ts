import type { User } from './types';
import { isSupabaseConfigured as checkSupabaseEnv } from './supabase/env';

export const MOCK_AUTH_ENABLED = false;

const STORAGE_KEY = 'hosthive_mock_user';
const COOKIE_NAME = 'hosthive_mock';

export function getMockUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setMockUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearMockUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function createMockUser(email: string, username?: string, plan: User['plan'] = 'free'): User {
  return {
    id: `mock_${Date.now()}`,
    email,
    username: username || email.split('@')[0] || 'developer',
    plan,
    createdAt: new Date().toISOString(),
  };
}

export function isSupabaseConfigured(): boolean {
  return checkSupabaseEnv();
}
