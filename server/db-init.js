const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get connection string from command line argument
const connectionString = process.argv[2];

if (!connectionString) {
  console.error('❌ Error: Please provide your external PostgreSQL connection string.');
  console.log('\nUsage:');
  console.log('  node db-init.js "your-postgresql-connection-string"');
  process.exit(1);
}

const schemaPath = path.join(__dirname, 'config', 'schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error(`❌ Error: schema.sql not found at ${schemaPath}`);
  process.exit(1);
}

console.log('📖 Reading schema.sql...');
const sql = fs.readFileSync(schemaPath, 'utf8');

console.log('🔌 Connecting to PostgreSQL database on Render...');
const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('🏥 Connected successfully! Executing database schema queries...');
    return client.query(sql);
  })
  .then(() => {
    console.log('✅ Database schema executed and seed data inserted successfully!');
  })
  .catch((err) => {
    console.error('❌ Database initialization failed:', err.message);
  })
  .finally(() => {
    client.end();
  });
