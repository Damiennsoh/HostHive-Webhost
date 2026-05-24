-- HostHive MVP — Row Level Security (RLS) Policies

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.env_vars      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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

CREATE POLICY "users_select_own_notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
