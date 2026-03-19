const { Pool } = require('pg');
require('dotenv').config();

let pool;

// Different configurations for different environments
if (process.env.NODE_ENV === 'production') {
  // Production: Use Render's PostgreSQL URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render
    }
  });
} else {
  // Development: Use local PostgreSQL or environment variables
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'jobtrackr',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });
}

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('✅ Connected to database successfully');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
