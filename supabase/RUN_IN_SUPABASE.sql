-- =============================================================================
-- HostHive — Run this entire file in Supabase SQL Editor
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS where needed
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Profiles (extends auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  github_login  TEXT,
  github_token  TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If profiles existed without plan (e.g. from an earlier partial run)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'hobby', 'startup', 'pro', 'team', 'enterprise'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, plan)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'plan', 'free')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. Projects, deployments, env vars, notifications
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 3. Updated-at trigger function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_env_vars_updated_at ON public.env_vars;
CREATE TRIGGER set_env_vars_updated_at
  BEFORE UPDATE ON public.env_vars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.env_vars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_select_own_projects" ON public.projects;
DROP POLICY IF EXISTS "users_insert_own_projects" ON public.projects;
DROP POLICY IF EXISTS "users_update_own_projects" ON public.projects;
DROP POLICY IF EXISTS "users_delete_own_projects" ON public.projects;
DROP POLICY IF EXISTS "public_projects_select" ON public.projects;
CREATE POLICY "users_select_own_projects"
  ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_projects"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_projects"
  ON public.projects FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "public_projects_select"
  ON public.projects FOR SELECT USING (is_public = TRUE);

DROP POLICY IF EXISTS "users_select_own_deployments" ON public.deployments;
DROP POLICY IF EXISTS "users_insert_own_deployments" ON public.deployments;
DROP POLICY IF EXISTS "users_update_own_deployments" ON public.deployments;
CREATE POLICY "users_select_own_deployments"
  ON public.deployments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_deployments"
  ON public.deployments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_deployments"
  ON public.deployments FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_select_own_env_vars" ON public.env_vars;
DROP POLICY IF EXISTS "users_insert_own_env_vars" ON public.env_vars;
DROP POLICY IF EXISTS "users_update_own_env_vars" ON public.env_vars;
DROP POLICY IF EXISTS "users_delete_own_env_vars" ON public.env_vars;
CREATE POLICY "users_select_own_env_vars"
  ON public.env_vars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_env_vars"
  ON public.env_vars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_env_vars"
  ON public.env_vars FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_env_vars"
  ON public.env_vars FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_select_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "users_insert_own_notifications" ON public.notifications;
CREATE POLICY "users_select_own_notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_notifications"
  ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. Custom domains
-- -----------------------------------------------------------------------------
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
  ON public.custom_domains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_domains"
  ON public.custom_domains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_domains"
  ON public.custom_domains FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_domains"
  ON public.custom_domains FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_custom_domains_updated_at ON public.custom_domains;
CREATE TRIGGER set_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. Managed databases (PostgreSQL, MySQL, Redis)
-- -----------------------------------------------------------------------------
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
  ON public.managed_databases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_databases"
  ON public.managed_databases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_databases"
  ON public.managed_databases FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_databases"
  ON public.managed_databases FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_managed_databases_updated_at ON public.managed_databases;
CREATE TRIGGER set_managed_databases_updated_at
  BEFORE UPDATE ON public.managed_databases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Done.
SELECT 'HostHive schema applied successfully.' AS status;
