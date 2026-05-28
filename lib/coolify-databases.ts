import { z } from 'zod';
import type { DatabaseType } from '@/lib/database-connection';

const coolifyEnvSchema = z.object({
  COOLIFY_API_URL: z.string().url(),
  COOLIFY_API_TOKEN: z.string().min(1),
  COOLIFY_SERVER_UUID: z.string().optional(),
  COOLIFY_DESTINATION_UUID: z.string().optional(),
  COOLIFY_PROJECT_UUID: z.string().optional(),
});

export interface CoolifyDatabaseResponse {
  uuid: string;
  internal_db_url?: string;
  name?: string;
  status?: string;
}

function getCoolifyConfig() {
  return coolifyEnvSchema.parse({
    COOLIFY_API_URL: process.env.COOLIFY_API_URL,
    COOLIFY_API_TOKEN: process.env.COOLIFY_API_TOKEN,
    COOLIFY_SERVER_UUID: process.env.COOLIFY_SERVER_UUID,
    COOLIFY_DESTINATION_UUID: process.env.COOLIFY_DESTINATION_UUID,
    COOLIFY_PROJECT_UUID: process.env.COOLIFY_PROJECT_UUID,
  });
}

function coolifyEndpoint(dbType: DatabaseType): string {
  switch (dbType) {
    case 'postgresql':
      return '/databases/postgresql';
    case 'mysql':
      return '/databases/mysql';
    case 'redis':
      return '/databases/redis';
  }
}

function buildCreateBody(
  dbType: DatabaseType,
  opts: {
    name: string;
    username: string;
    password: string;
    database: string;
  }
) {
  const env = getCoolifyConfig();
  const base: Record<string, unknown> = {
    server_uuid: env.COOLIFY_SERVER_UUID,
    destination_uuid: env.COOLIFY_DESTINATION_UUID,
    project_uuid: env.COOLIFY_PROJECT_UUID,
    name: opts.name,
    description: `Lynx Host managed ${dbType}`,
    instant_deploy: true,
    is_public: false,
  };

  if (dbType === 'postgresql') {
    return {
      ...base,
      postgres_user: opts.username,
      postgres_password: opts.password,
      postgres_db: opts.database,
    };
  }
  if (dbType === 'mysql') {
    return {
      ...base,
      mysql_user: opts.username,
      mysql_password: opts.password,
      mysql_database: opts.database,
      mysql_root_password: opts.password,
    };
  }
  return {
    ...base,
    redis_password: opts.password,
  };
}

export async function createCoolifyDatabase(
  dbType: DatabaseType,
  opts: { name: string; username: string; password: string; database: string }
): Promise<CoolifyDatabaseResponse | null> {
  const env = getCoolifyConfig();
  if (!env.COOLIFY_SERVER_UUID) {
    return null;
  }

  const baseUrl = env.COOLIFY_API_URL.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/api/v1${coolifyEndpoint(dbType)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.COOLIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildCreateBody(dbType, opts)),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Coolify database API ${res.status}: ${text}`);
  }

  return res.json() as Promise<CoolifyDatabaseResponse>;
}

export async function deleteCoolifyDatabase(
  dbType: DatabaseType,
  uuid: string
): Promise<void> {
  const env = getCoolifyConfig();
  const baseUrl = env.COOLIFY_API_URL.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/api/v1${coolifyEndpoint(dbType)}/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${env.COOLIFY_API_TOKEN}` },
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Coolify delete database ${res.status}: ${text}`);
  }
}

export function isCoolifyDatabaseConfigured(): boolean {
  try {
    const env = getCoolifyConfig();
    return Boolean(env.COOLIFY_SERVER_UUID);
  } catch {
    return false;
  }
}

