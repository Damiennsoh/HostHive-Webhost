import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import {
  buildConnectionUrl,
  defaultEnvKey,
  parseCoolifyInternalUrl,
  type DatabaseType,
} from '@/lib/database-connection';
import { createCoolifyDatabase, isCoolifyDatabaseConfigured } from '@/lib/coolify-databases';
import { slugify } from '@/lib/project-utils';

const DB_TYPES: DatabaseType[] = ['postgresql', 'mysql', 'redis'];

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  if (auth.isDemo) {
    return NextResponse.json({ success: true, databases: [] });
  }

  const { user, supabase } = auth;
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('managed_databases')
    .select('*, projects(name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    databases: data ?? [],
    coolifyConfigured: isCoolifyDatabaseConfigured(),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  if (auth.isDemo) {
    return NextResponse.json(
      { error: 'Create a real account to provision databases' },
      { status: 403 }
    );
  }

  const { user, supabase } = auth;
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, db_type, project_id } = body as {
    name: string;
    db_type: DatabaseType;
    project_id?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!DB_TYPES.includes(db_type)) {
    return NextResponse.json({ error: 'Invalid database type' }, { status: 400 });
  }

  const slug = slugify(name);
  const password = randomUUID().replace(/-/g, '').slice(0, 24);
  const username = `hh_${slug.replace(/-/g, '_').slice(0, 20)}`;
  const databaseName = slug.replace(/-/g, '_');

  let coolifyUuid: string | null = null;
  let connectionUrl: string;
  let host: string;
  let port: number;
  let status: 'provisioning' | 'running' | 'failed' = 'running';
  let internalNetwork: string | null = 'lynxhost_private';

  try {
    if (isCoolifyDatabaseConfigured()) {
      status = 'provisioning';
      const created = await createCoolifyDatabase(db_type, {
        name: slug,
        username,
        password,
        database: databaseName,
      });
      coolifyUuid = created?.uuid ?? null;
      const parsed = parseCoolifyInternalUrl(created?.internal_db_url, db_type);
      if (parsed) {
        host = parsed.host;
        port = parsed.port;
        connectionUrl =
          created?.internal_db_url ??
          buildConnectionUrl(db_type, { ...parsed, password: parsed.password || password });
      } else {
        host = `${slug}.internal`;
        port = db_type === 'redis' ? 6379 : db_type === 'mysql' ? 3306 : 5432;
        connectionUrl = buildConnectionUrl(db_type, {
          host,
          port,
          database: databaseName,
          username,
          password,
        });
      }
      status = 'running';
    } else {
      host = `${slug}.lynxhost-internal`;
      port = db_type === 'redis' ? 6379 : db_type === 'mysql' ? 3306 : 5432;
      connectionUrl = buildConnectionUrl(db_type, {
        host,
        port,
        database: databaseName,
        username,
        password,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Coolify database creation failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const envVarKey = defaultEnvKey(db_type);

  const { data: row, error } = await supabase
    .from('managed_databases')
    .insert({
      user_id: user.id,
      project_id: project_id ?? null,
      name: name.trim(),
      db_type,
      coolify_uuid: coolifyUuid,
      status,
      host,
      port,
      database_name: databaseName,
      username,
      internal_network: internalNetwork,
      connection_url: connectionUrl,
      env_var_key: envVarKey,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (project_id && row) {
    const { injectDatabaseEnvForProject } = await import('@/lib/inject-database-env');
    await injectDatabaseEnvForProject(supabase, user.id, project_id, row);
  }

  return NextResponse.json(
    {
      success: true,
      database: row,
      message: isCoolifyDatabaseConfigured()
        ? 'Database provisioned on Coolify'
        : 'Database record created (set COOLIFY_SERVER_UUID for live provisioning)',
    },
    { status: 201 }
  );
}

