const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const rawUrl = process.env.DATABASE_URL;
  console.log('Connecting to:', rawUrl ? rawUrl.split('@')[1] : 'undefined');
  const pool = mysql.createPool({
    uri: rawUrl,
    ssl: { rejectUnauthorized: true }
  });

  try {
    const [rows] = await pool.query('SELECT * FROM parametres');
    console.log('--- SYSTEM PARAMETERS ---');
    console.table(rows);
    
    const [roles] = await pool.query('DESCRIBE demandes');
    console.log('--- DEMANDS TABLE COLUMNS ---');
    console.table(roles);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();
