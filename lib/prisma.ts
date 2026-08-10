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
      connectionLimit: 15,
      connectTimeout: 10000,
      acquireTimeout: 10000,
    };
  } catch {
    return { host: '127.0.0.1', port: 3306, user: 'root', database: 'toil_db' };
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
