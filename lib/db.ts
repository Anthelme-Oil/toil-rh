import 'server-only';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const globalForDb = globalThis as unknown as {
  dbPool: mysql.Pool | undefined;
};

export function getDbPool(): mysql.Pool {
  if (!globalForDb.dbPool) {
    const rawUrl = process.env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/toil_db';
    const isTiDB = rawUrl.includes('tidbcloud.com');
    globalForDb.dbPool = mysql.createPool({
      uri: rawUrl,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ...(isTiDB ? { ssl: { rejectUnauthorized: true } } : {}),
    });
  }
  return globalForDb.dbPool;
}

export function generateId(): string {
  return 'c' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getDbPool();
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> {
  const pool = getDbPool();
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}
