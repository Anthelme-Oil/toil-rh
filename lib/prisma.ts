import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function parseDatabaseUrl(rawUrl?: string) {
  const defaultUrl = 'mysql://root@127.0.0.1:3306/toil_db';
  const urlStr = (rawUrl || defaultUrl).replace('mariadb://', 'http://').replace('mysql://', 'http://');

  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname === 'localhost' ? '127.0.0.1' : (parsed.hostname || '127.0.0.1');
    const port = parsed.port ? parseInt(parsed.port, 10) : 3306;
    const user = decodeURIComponent(parsed.username || 'root');
    const password = decodeURIComponent(parsed.password || '');
    const database = parsed.pathname ? parsed.pathname.replace('/', '') : 'toil_db';

    const ssl = (parsed.searchParams.has('sslaccept') || parsed.hostname.includes('tidbcloud'))
      ? { rejectUnauthorized: false }
      : undefined;

    return {
      host,
      port,
      user,
      password,
      database,
      ssl,
      connectionLimit: 5,
      minimumIdle: 1,
      idleTimeout: 60,
      connectTimeout: 30000,
      acquireTimeout: 30000,
    };
  } catch {
    return {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      database: 'toil_db',
      connectionLimit: 5,
      minimumIdle: 1,
      idleTimeout: 60,
    };
  }
}

function createClient(): PrismaClient {
  const config = parseDatabaseUrl(process.env.DATABASE_URL);
  const adapter = new PrismaMariaDb(config);
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Recrée une nouvelle instance propre de PrismaClient et de son pool MariaDB
 */
export function resetPrismaClient(): PrismaClient {
  try {
    if (globalForPrisma.prisma) {
      globalForPrisma.prisma.$disconnect().catch(() => {});
    }
  } catch {
    // Ignorer
  }
  globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

/**
 * Proxy dynamique vers l'instance active de PrismaClient.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient) {
    const client = getPrisma();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = getPrisma();
}

/**
 * Exécute une opération Prisma avec re-tentatives sur vraies ruptures réseau.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const errString = String(err) + (err instanceof Error ? err.message : '');
    const isConnError =
      errString.includes('ECONNRESET') ||
      errString.includes('ClosedConnection') ||
      errString.includes('write ECONNRESET') ||
      errString.includes('pool is ending');

    if (retries > 0 && isConnError) {
      console.warn(
        `[Prisma Retry] Coupure réseau détectée. Régénération du pool (${retries} tentative(s) restante(s))...`
      );
      resetPrismaClient();
      await new Promise((resolve) => setTimeout(resolve, 500));
      return await withRetry(fn, retries - 1);
    }
    throw err;
  }
}
