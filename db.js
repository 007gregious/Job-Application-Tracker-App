const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.NODE_ENV === 'production') {
  // Production: Use Render's PostgreSQL
  console.log('í³Š Connecting to Render PostgreSQL...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Development: Use local PostgreSQL
  console.log('í³Š Connecting to local PostgreSQL...');
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'jobtrackr',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });
}

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('âŒ Database connection error:', err.message);
  } else {
    console.log('âœ… Database connected successfully');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
