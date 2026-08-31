import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function dumpDatabase() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('❌ Erreur: DATABASE_URL non définie dans .env.local ou .env');
    process.exit(1);
  }

  console.log('🔄 Connexion à la base de données pour le dump...');
  const isTiDB = rawUrl.includes('tidbcloud.com');
  const connection = await mysql.createConnection({
    uri: rawUrl,
    ssl: isTiDB ? { rejectUnauthorized: true } : undefined,
  });

  const [dbRows] = await connection.query('SELECT DATABASE() as current_db');
  const dbName = (dbRows && dbRows[0] && dbRows[0].current_db) || 'toil_db';

  console.log(`📦 Exportation de la base: ${dbName}...`);

  const outputFile = path.join(process.cwd(), 'backup_toil_db.sql');
  const sqlStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });

  sqlStream.write(`-- --------------------------------------------------------\n`);
  sqlStream.write(`-- Dump complet de la base de données : ${dbName}\n`);
  sqlStream.write(`-- Date : ${new Date().toISOString()}\n`);
  sqlStream.write(`-- --------------------------------------------------------\n\n`);
  sqlStream.write(`SET NAMES utf8mb4;\n`);
  sqlStream.write(`SET FOREIGN_KEY_CHECKS = 0;\n\n`);

  // Récupérer toutes les tables
  const [tables] = await connection.query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
  const tableNames = tables.map((t) => Object.values(t)[0]);

  console.log(`📋 ${tableNames.length} tables trouvées :`, tableNames.join(', '));

  for (const table of tableNames) {
    console.log(`  ⏳ Export de la table [${table}]...`);

    // 1. Structure de la table
    const [createTableResult] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
    const createTableSql = createTableResult[0]['Create Table'];

    sqlStream.write(`--\n-- Structure de la table \`${table}\`\n--\n`);
    sqlStream.write(`DROP TABLE IF EXISTS \`${table}\`;\n`);
    sqlStream.write(`${createTableSql};\n\n`);

    // 2. Données de la table
    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);

    if (rows && rows.length > 0) {
      sqlStream.write(`--\n-- Données de la table \`${table}\` (${rows.length} lignes)\n--\n`);
      for (const row of rows) {
        const columns = Object.keys(row).map((col) => `\`${col}\``).join(', ');
        const values = Object.values(row).map((val) => {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val ? 1 : 0;
          if (val instanceof Date) {
            return connection.escape(val.toISOString().slice(0, 19).replace('T', ' '));
          }
          if (typeof val === 'object') {
            return connection.escape(JSON.stringify(val));
          }
          return connection.escape(String(val));
        }).join(', ');

        sqlStream.write(`INSERT INTO \`${table}\` (${columns}) VALUES (${values});\n`);
      }
      sqlStream.write(`\n`);
    }
  }

  sqlStream.write(`SET FOREIGN_KEY_CHECKS = 1;\n`);
  sqlStream.end();

  await connection.end();
  console.log(`\n🎉 Dump terminé avec succès dans le fichier :\n👉 ${outputFile}`);
}

dumpDatabase().catch((err) => {
  console.error('❌ Erreur lors du dump :', err);
  process.exit(1);
});
