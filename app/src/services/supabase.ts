/**
 * Supabase Client & API Routes
 * 
 * This module provides:
 * - Supabase client initialization
 * - Auth helpers (signIn, signUp, signOut, getSession)
 * - Database queries for projects, deployments, domains, env vars
 * - Real-time subscriptions for deployment status updates
 * 
 * To use:
 * 1. Set your Supabase URL and anon key in environment variables
 * 2. Install: npm install @supabase/supabase-js
 * 3. Import and use the helpers below
 * 
 * Supabase Project Setup:
 * - Create project at https://supabase.com
 * - Enable Auth (Email, GitHub OAuth)
 * - Create tables: projects, deployments, domains, env_vars, activity_logs
 * - Enable Row Level Security (RLS) policies
 * - Create storage bucket for build artifacts
 */

import { createClient } from '@supabase/supabase-js';
import type { Project, Domain, EnvVar, ActivityEvent } from '@/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ===== AUTH =====

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGithub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${window.location.origin}/github-connect` },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function getUser() {
  return supabase.auth.getUser();
}

// ===== PROJECTS =====

export async function getProjects(userId: string) {
  return supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function getProjectById(projectId: string) {
  return supabase.from('projects').select('*').eq('id', projectId).single();
}

export async function createProject(project: Omit<Project, 'id'>) {
  return supabase.from('projects').insert(project).select().single();
}

export async function updateProject(projectId: string, updates: Partial<Project>) {
  return supabase.from('projects').update(updates).eq('id', projectId);
}

export async function deleteProject(projectId: string) {
  return supabase.from('projects').delete().eq('id', projectId);
}

// ===== DEPLOYMENTS =====

export async function getDeployments(projectId: string) {
  return supabase
    .from('deployments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
}

export async function createDeployment(projectId: string, commit: string, branch: string) {
  return supabase
    .from('deployments')
    .insert({ project_id: projectId, commit, branch, status: 'pending' })
    .select()
    .single();
}

export async function updateDeploymentStatus(
  deploymentId: string,
  status: string,
  logs?: string
) {
  return supabase.from('deployments').update({ status, logs }).eq('id', deploymentId);
}

// ===== DOMAINS =====

export async function getDomains(projectId: string) {
  return supabase.from('domains').select('*').eq('project_id', projectId);
}

export async function addDomain(domain: Omit<Domain, 'id'>) {
  return supabase.from('domains').insert(domain).select().single();
}

export async function updateDomain(domainId: string, updates: Partial<Domain>) {
  return supabase.from('domains').update(updates).eq('id', domainId);
}

export async function deleteDomain(domainId: string) {
  return supabase.from('domains').delete().eq('id', domainId);
}

// ===== ENVIRONMENT VARIABLES =====

export async function getEnvVars(projectId: string) {
  return supabase.from('env_vars').select('*').eq('project_id', projectId);
}

export async function addEnvVar(envVar: Omit<EnvVar, 'id'>) {
  return supabase.from('env_vars').insert(envVar).select().single();
}

export async function updateEnvVar(envVarId: string, updates: Partial<EnvVar>) {
  return supabase.from('env_vars').update(updates).eq('id', envVarId);
}

export async function deleteEnvVar(envVarId: string) {
  return supabase.from('env_vars').delete().eq('id', envVarId);
}

// ===== ACTIVITY LOGS =====

export async function getActivityLogs(userId: string) {
  return supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
}

export async function logActivity(event: Omit<ActivityEvent, 'id'>) {
  return supabase.from('activity_logs').insert(event);
}

// ===== REAL-TIME SUBSCRIPTIONS =====

export function subscribeToProject(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`projects:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe();
}

export function subscribeToDeployments(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`deployments:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deployments',
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}

// ===== GITHUB INTEGRATION =====

export async function linkGithubAccount(userId: string, githubToken: string) {
  return supabase.from('user_integrations').upsert({
    user_id: userId,
    github_token: githubToken,
    connected_at: new Date().toISOString(),
  });
}

export async function getGithubToken(userId: string) {
  return supabase
    .from('user_integrations')
    .select('github_token')
    .eq('user_id', userId)
    .single();
}

// ===== DATABASE SCHEMA (for migrations) =====
/*
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE env_vars ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  repo TEXT,
  branch TEXT DEFAULT 'main',
  framework TEXT,
  status TEXT DEFAULT 'pending',
  url TEXT,
  type TEXT DEFAULT 'frontend',
  languages TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS: Users can only see their own projects
CREATE POLICY "Users can CRUD own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Deployments table
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  commit TEXT,
  branch TEXT,
  status TEXT DEFAULT 'pending',
  logs TEXT,
  build_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Domains table
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  ssl TEXT DEFAULT 'pending',
  dns TEXT DEFAULT 'pending',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Environment variables table
CREATE TABLE env_vars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  project TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- GitHub integrations table
CREATE TABLE user_integrations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  github_token TEXT,
  connected_at TIMESTAMP
);
*/
