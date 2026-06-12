const { Pool } = require('pg');
const connectionString = 'postgresql://postgres:Sandeep@localhost:5432/hms_db';

const pool = new Pool({ connectionString });

async function test() {
  try {
    const res = await pool.query('SELECT id, name, email, password, role_id FROM users');
    console.log('Database users rows found:', res.rows.length);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Database connection / query error:', err.message);
  } finally {
    await pool.end();
  }
}

test();
