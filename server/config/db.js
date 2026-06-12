const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const isProduction = process.env.NODE_ENV === 'production';

// Connection config
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hms_db';

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('🏥 Successfully connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error on idle client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
