-- Lynx Host — Managed databases (PostgreSQL, MySQL, Redis via Coolify)

-- Ensure plan column exists (Supabase starter schemas may omit it)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'hobby', 'startup', 'pro', 'team', 'enterprise'));

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

