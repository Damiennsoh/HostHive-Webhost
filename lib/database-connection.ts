export type DatabaseType = 'postgresql' | 'mysql' | 'redis' | 'mongodb';

export function defaultEnvKey(dbType: DatabaseType): string {
  switch (dbType) {
    case 'postgresql':
      return 'DATABASE_URL';
    case 'mysql':
      return 'MYSQL_URL';
    case 'redis':
      return 'REDIS_URL';
    case 'mongodb':
      return 'MONGODB_URL';
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
    case 'mongodb':
      return `mongodb://${encUser}:${encPass}@${host}:${port}/${database}?authSource=admin`;
  }
}

export function parseCoolifyInternalUrl(
  internalUrl: string | undefined,
  dbType: DatabaseType
): { host: string; port: number; database: string; username: string; password: string } | null {
  if (!internalUrl) return null;
  try {
    const url = new URL(internalUrl);
    const defaultPort = dbType === 'mongodb' ? '27017' : dbType === 'redis' ? '6379' : dbType === 'mysql' ? '3306' : '5432';
    return {
      host: url.hostname,
      port: parseInt(url.port || defaultPort, 10),
      database: url.pathname.replace(/^\//, '') || (dbType === 'mongodb' ? 'admin' : 'postgres'),
      username: decodeURIComponent(url.username) || (dbType === 'mongodb' ? 'root' : 'postgres'),
      password: decodeURIComponent(url.password) || '',
    };
  } catch {
    return null;
  }
}
