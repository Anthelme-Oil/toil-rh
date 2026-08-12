const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const mysql = require('mysql2/promise');

async function inspectDemandes() {
  const dbUrl = process.env.DATABASE_URL;
  console.log('Connecting to DATABASE_URL with SSL...');

  const connection = await mysql.createConnection({
    uri: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const [rows] = await connection.execute(
      'SELECT id, titre, nom_demandeur, email_demandeur, email_manager, statut, statut_n1, statut_rh, cree_le FROM demandes ORDER BY cree_le DESC LIMIT 10'
    );
    console.log('--- DERNIÈRES DEMANDES EN BD ---');
    console.dir(rows, { depth: null });
  } catch (err) {
    console.error('Erreur inspection BD:', err);
  } finally {
    await connection.end();
  }
}

inspectDemandes();
