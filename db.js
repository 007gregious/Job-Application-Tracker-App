require('dotenv').config();

let db;

// In production (Render), use PostgreSQL
if (process.env.NODE_ENV === 'production') {
  console.log('í³Š Connecting to Render PostgreSQL...');
  const { Pool } = require('pg');
  
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  // Test connection
  db.connect((err, client, release) => {
    if (err) {
      console.error('âŒ Database connection error:', err.message);
    } else {
      console.log('âœ… Database connected successfully');
      release();
    }
  });
  
  // Wrap with query method
  const originalDb = db;
  db = {
    query: (text, params) => originalDb.query(text, params),
    pool: originalDb
  };
} else {
  // In development, use in-memory database
  console.log('í²¾ Using in-memory database for development');
  db = require('./db-memory');
}

module.exports = db;
