import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import mysql from 'mysql2/promise';

async function main() {
  const rawUrl = process.env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/toil_db';
  console.log('Connexion à la base de données...', rawUrl.split('@')[1] || rawUrl);
  const isTiDB = rawUrl.includes('tidbcloud.com');
  const connection = await mysql.createConnection({
    uri: rawUrl,
    ssl: isTiDB ? { rejectUnauthorized: true } : undefined,
  });

  console.log('Connecté !');

  // Vérifier les colonnes de la table utilisateurs
  const [columns] = await connection.query('SHOW COLUMNS FROM utilisateurs');
  const colNames = columns.map(c => c.Field);
  console.log('Colonnes actuelles dans utilisateurs :', colNames);

  const newCols = [
    { name: 'est_drh', type: 'TINYINT DEFAULT 0' },
    { name: 'est_rh_print', type: 'TINYINT DEFAULT 0' },
    { name: 'est_gestionnaire_salle', type: 'TINYINT DEFAULT 0' }
  ];

  for (const col of newCols) {
    if (!colNames.includes(col.name)) {
      console.log(`Ajout de la colonne ${col.name}...`);
      await connection.query(`ALTER TABLE utilisateurs ADD COLUMN ${col.name} ${col.type}`);
      console.log(`Colonne ${col.name} ajoutée avec succès !`);
    } else {
      console.log(`La colonne ${col.name} existe déjà.`);
    }
  }

  console.log('Migration terminée avec succès !');
  await connection.end();
}

main().catch(err => {
  console.error('Échec de la migration :', err);
  process.exit(1);
});
