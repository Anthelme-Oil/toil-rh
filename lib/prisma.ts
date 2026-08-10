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
    const user = parsed.username || 'root';
    const password = parsed.password || '';
    const database = parsed.pathname ? parsed.pathname.replace('/', '') : 'toil_db';

    return {
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 10,
      minimumIdle: 0,
      idleTimeout: 10, // Fermer les connexions inactives au bout de 10s pour éviter la péremption du socket
      connectTimeout: 10000,
      acquireTimeout: 10000,
    };
  } catch {
    return {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      database: 'toil_db',
      connectionLimit: 10,
      minimumIdle: 0,
      idleTimeout: 10,
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

export const prisma = getPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Robustesse maximale : Exécute une opération Prisma avec re-tentatives automatiques
 * et déconnexion/reconnexion forcée en cas d'erreur de socket (ECONNRESET)
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const errString = String(err) + (err instanceof Error ? err.message : '');
    const isConnError =
      errString.includes('ECONNRESET') ||
      errString.includes('ClosedConnection') ||
      errString.includes('connection') ||
      errString.includes('socket') ||
      errString.includes('Protocol error') ||
      errString.includes('write ECONNRESET');

    if (retries > 0 && isConnError) {
      console.warn(`[Prisma Retry] Coupure de socket MySQL détectée (ECONNRESET). Reconnexion du pool (reste ${retries} tentative(s))...`);
      try {
        await prisma.$disconnect();
      } catch {
        // Ignorer l'erreur de déconnexion si le socket est déjà mort
      }
      try {
        await prisma.$connect();
      } catch {
        // Ignorer l'erreur de reconnexion immédiate
      }
      // Attente courte avant de re-tester la requête
      await new Promise((resolve) => setTimeout(resolve, 300));
      return await withRetry(fn, retries - 1);
    }
    throw err;
  }
}
