import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { getCoolifyClient } from '@/lib/coolify-client';
import { defaultEnvKey } from '@/lib/database-connection';

type ManagedDb = {
  id: string;
  project_id: string | null;
  connection_url: string | null;
  env_var_key: string;
  db_type: string;
};

export async function injectDatabaseEnvForProject(
  supabase: any,
  userId: string,
  projectId: string,
  database: ManagedDb
): Promise<void> {
  if (!database.connection_url) {
    throw new Error('Database has no connection URL');
  }

  const envKey = database.env_var_key || defaultEnvKey(database.db_type as 'postgresql');

  await supabase.from('env_vars').upsert(
    {
      project_id: projectId,
      user_id: userId,
      key: envKey,
      value: database.connection_url,
      is_secret: true,
    },
    { onConflict: 'project_id,key' }
  );

  await supabase
    .from('managed_databases')
    .update({ project_id: projectId, updated_at: new Date().toISOString() })
    .eq('id', database.id)
    .eq('user_id', userId);

  const { data: project } = await supabase
    .from('projects')
    .select('coolify_uuid')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (project?.coolify_uuid) {
    try {
      const coolify = getCoolifyClient();
      await coolify.setEnvVars(project.coolify_uuid, { [envKey]: database.connection_url });
    } catch (err) {
      console.warn('[injectDatabaseEnv] Coolify env sync failed:', err);
    }
  }
}
