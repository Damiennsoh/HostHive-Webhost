-- =============================================================================
-- HostHive — Complete Supabase Schema
-- This is a single consolidated file with all tables, functions, triggers, and policies
-- Run this entire file in Supabase SQL Editor to set up the complete database
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS
-- =============================================================================

-- =============================================================================
-- 0. Extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. Profiles Table (extends auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  username      TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  github_login  TEXT,
  github_token  TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if migrating from old schema
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

-- Fill in missing usernames so we can apply NOT NULL safely if needed
UPDATE public.profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- Now make username NOT NULL
ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL;

-- Add constraint for valid plan values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'hobby', 'startup', 'pro', 'team', 'enterprise'));

-- =============================================================================
-- 2. Trigger Function for New User Profile Creation
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_plan TEXT;
BEGIN
  -- Extract metadata with proper null handling
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', v_full_name, split_part(NEW.email, '@', 1));
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  v_plan := COALESCE(NEW.raw_user_meta_data->>'plan', 'free');

  -- Validate plan value
  IF v_plan NOT IN ('free', 'hobby', 'startup', 'pro', 'team', 'enterprise') THEN
    v_plan := 'free';
  END IF;

  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    avatar_url,
    plan,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_full_name,
    v_avatar_url,
    v_plan,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    plan = COALESCE(EXCLUDED.plan, public.profiles.plan),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent auth user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. Updated-At Trigger Function
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 4. Projects Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL,
  coolify_uuid      TEXT,
  git_repo_url      TEXT NOT NULL,
  git_branch        TEXT NOT NULL DEFAULT 'main',
  git_provider      TEXT NOT NULL DEFAULT 'github'
                      CHECK (git_provider IN ('github', 'gitlab', 'bitbucket')),
  build_command     TEXT,
  start_command     TEXT,
  root_directory    TEXT DEFAULT '/',
  runtime           TEXT DEFAULT 'nixpacks'
                      CHECK (runtime IN ('nixpacks', 'dockerfile', 'static')),
  custom_domain     TEXT,
  assigned_domain   TEXT,
  status            TEXT NOT NULL DEFAULT 'inactive'
                      CHECK (status IN ('inactive', 'deploying', 'running', 'stopped', 'failed')),
  framework         TEXT,
  is_public         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_git_repo ON public.projects(git_repo_url, git_branch);

-- Trigger for projects updated_at
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 5. Deployments Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.deployments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id        UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coolify_deploy_id TEXT,
  status            TEXT NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued', 'building', 'deploying', 'success', 'failed', 'cancelled')),
  trigger           TEXT NOT NULL DEFAULT 'manual'
                      CHECK (trigger IN ('manual', 'github_push', 'github_pr', 'api')),
  commit_sha        TEXT,
  commit_message    TEXT,
  commit_author     TEXT,
  branch            TEXT,
  log_url           TEXT,
  duration_secs     INTEGER,
  error_message     TEXT,
  started_at        TIMESTAMPTZ,
  finished_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON public.deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON public.deployments(created_at DESC);

-- =============================================================================
-- 6. Environment Variables Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.env_vars (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,
  is_secret   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, key)
);

CREATE INDEX IF NOT EXISTS idx_env_vars_project_id ON public.env_vars(project_id);

-- Trigger for env_vars updated_at
DROP TRIGGER IF EXISTS set_env_vars_updated_at ON public.env_vars;
CREATE TRIGGER set_env_vars_updated_at
  BEFORE UPDATE ON public.env_vars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 7. Notifications Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  deployment_id UUID REFERENCES public.deployments(id) ON DELETE SET NULL,
  type          TEXT NOT NULL
                  CHECK (type IN ('deploy_success', 'deploy_failed', 'uptime_alert', 'downtime_alert', 'welcome')),
  channel       TEXT NOT NULL DEFAULT 'email'
                  CHECK (channel IN ('email', 'webhook', 'in_app')),
  subject       TEXT,
  sent_at       TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'sent', 'failed')),
  resend_id     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON public.notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =============================================================================
-- 8. Custom Domains Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id          UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain              TEXT NOT NULL,
  record_type         TEXT NOT NULL DEFAULT 'CNAME'
                        CHECK (record_type IN ('A', 'CNAME', 'TXT')),
  cname_target        TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending', 'verified', 'failed')),
  ssl_status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (ssl_status IN ('pending', 'active', 'failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (domain)
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_project_id ON public.custom_domains(project_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON public.custom_domains(user_id);

ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_domains" ON public.custom_domains;
DROP POLICY IF EXISTS "users_insert_own_domains" ON public.custom_domains;
DROP POLICY IF EXISTS "users_update_own_domains" ON public.custom_domains;
DROP POLICY IF EXISTS "users_delete_own_domains" ON public.custom_domains;

CREATE POLICY "users_select_own_domains"
  ON public.custom_domains FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_domains"
  ON public.custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_domains"
  ON public.custom_domains FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_domains"
  ON public.custom_domains FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_custom_domains_updated_at ON public.custom_domains;
CREATE TRIGGER set_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 9. Managed Databases Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.managed_databases (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id          UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  db_type             TEXT NOT NULL
                        CHECK (db_type IN ('postgresql', 'mysql', 'redis')),
  coolify_uuid        TEXT,
  status              TEXT NOT NULL DEFAULT 'provisioning'
                        CHECK (status IN ('provisioning', 'running', 'stopped', 'failed')),
  host                TEXT,
  port                INTEGER,
  database_name       TEXT,
  username            TEXT,
  internal_network    TEXT,
  connection_url      TEXT,
  env_var_key         TEXT NOT NULL DEFAULT 'DATABASE_URL',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_managed_databases_user_id ON public.managed_databases(user_id);
CREATE INDEX IF NOT EXISTS idx_managed_databases_project_id ON public.managed_databases(project_id);

ALTER TABLE public.managed_databases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_databases" ON public.managed_databases;
DROP POLICY IF EXISTS "users_insert_own_databases" ON public.managed_databases;
DROP POLICY IF EXISTS "users_update_own_databases" ON public.managed_databases;
DROP POLICY IF EXISTS "users_delete_own_databases" ON public.managed_databases;

CREATE POLICY "users_select_own_databases"
  ON public.managed_databases FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_databases"
  ON public.managed_databases FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_databases"
  ON public.managed_databases FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_databases"
  ON public.managed_databases FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_managed_databases_updated_at ON public.managed_databases;
CREATE TRIGGER set_managed_databases_updated_at
  BEFORE UPDATE ON public.managed_databases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 10. RLS Policies for Core Tables
-- =============================================================================

-- Profiles (already enabled above)
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;

CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects
DROP POLICY IF EXISTS "users_select_own_projects" ON public.projects;
DROP POLICY IF EXISTS "users_insert_own_projects" ON public.projects;
DROP POLICY IF EXISTS "users_update_own_projects" ON public.projects;
DROP POLICY IF EXISTS "users_delete_own_projects" ON public.projects;
DROP POLICY IF EXISTS "public_projects_select" ON public.projects;

CREATE POLICY "users_select_own_projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "public_projects_select"
  ON public.projects FOR SELECT
  USING (is_public = TRUE);

-- Deployments
DROP POLICY IF EXISTS "users_select_own_deployments" ON public.deployments;
DROP POLICY IF EXISTS "users_insert_own_deployments" ON public.deployments;
DROP POLICY IF EXISTS "users_update_own_deployments" ON public.deployments;

CREATE POLICY "users_select_own_deployments"
  ON public.deployments FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_deployments"
  ON public.deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_deployments"
  ON public.deployments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Environment Variables
DROP POLICY IF EXISTS "users_select_own_env_vars" ON public.env_vars;
DROP POLICY IF EXISTS "users_insert_own_env_vars" ON public.env_vars;
DROP POLICY IF EXISTS "users_update_own_env_vars" ON public.env_vars;
DROP POLICY IF EXISTS "users_delete_own_env_vars" ON public.env_vars;

CREATE POLICY "users_select_own_env_vars"
  ON public.env_vars FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_env_vars"
  ON public.env_vars FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_env_vars"
  ON public.env_vars FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_env_vars"
  ON public.env_vars FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "users_select_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "users_insert_own_notifications" ON public.notifications;

CREATE POLICY "users_select_own_notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 11. Helper Functions for Data Management
-- =============================================================================

-- Function to sync missing profiles for existing users
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_username TEXT;
  v_full_name TEXT;
BEGIN
  FOR v_user IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      v_full_name := v_user.raw_user_meta_data->>'full_name';
      v_username := COALESCE(v_user.raw_user_meta_data->>'username', v_full_name, split_part(v_user.email, '@', 1));

      INSERT INTO public.profiles (
        id, email, username, full_name, avatar_url, plan, created_at, updated_at
      ) VALUES (
        v_user.id,
        v_user.email,
        v_username,
        v_full_name,
        v_user.raw_user_meta_data->>'avatar_url',
        COALESCE(v_user.raw_user_meta_data->>'plan', 'free'),
        NOW(),
        NOW()
      );
      RETURN QUERY SELECT v_user.id, v_user.email, 'created'::TEXT;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN QUERY SELECT v_user.id, v_user.email, ('error: ' || SQLERRM)::TEXT;
    END;
  END LOOP;
END;
$$;

-- Function to manually create a profile
CREATE OR REPLACE FUNCTION public.create_profile_for_user(
  p_user_id UUID,
  p_email TEXT,
  p_username TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_plan TEXT DEFAULT 'free'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, username, full_name, avatar_url, plan, created_at, updated_at
  ) VALUES (
    p_user_id, p_email, COALESCE(p_username, split_part(p_email, '@', 1)), p_full_name, p_avatar_url, 
    COALESCE(p_plan, 'free'), NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- =============================================================================
-- 12. Final Setup
-- =============================================================================

-- Ensure all tables have RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.env_vars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managed_databases ENABLE ROW LEVEL SECURITY;
