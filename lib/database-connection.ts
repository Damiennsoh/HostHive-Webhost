export type DatabaseType = 'postgresql' | 'mysql' | 'redis';

export function defaultEnvKey(dbType: DatabaseType): string {
  switch (dbType) {
    case 'postgresql':
      return 'DATABASE_URL';
    case 'mysql':
      return 'MYSQL_URL';
    case 'redis':
      return 'REDIS_URL';
  }
}

export function buildConnectionUrl(
  dbType: DatabaseType,
  params: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  }
): string {
  const { host, port, database, username, password } = params;
  const encUser = encodeURIComponent(username);
  const encPass = encodeURIComponent(password);

  switch (dbType) {
    case 'postgresql':
      return `postgresql://${encUser}:${encPass}@${host}:${port}/${database}`;
    case 'mysql':
      return `mysql://${encUser}:${encPass}@${host}:${port}/${database}`;
    case 'redis':
      return password
        ? `redis://:${encPass}@${host}:${port}`
        : `redis://${host}:${port}`;
  }
}

export function parseCoolifyInternalUrl(
  internalUrl: string | undefined,
  dbType: DatabaseType
): { host: string; port: number; database: string; username: string; password: string } | null {
  if (!internalUrl) return null;
  try {
    const url = new URL(internalUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || (dbType === 'redis' ? '6379' : dbType === 'mysql' ? '3306' : '5432'), 10),
      database: url.pathname.replace(/^\//, '') || 'postgres',
      username: decodeURIComponent(url.username) || 'postgres',
      password: decodeURIComponent(url.password) || '',
    };
  } catch {
    return null;
  }
}
