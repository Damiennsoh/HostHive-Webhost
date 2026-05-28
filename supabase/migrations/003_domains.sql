-- Lynx Host — Custom domains (Vercel-style DNS verification)
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

