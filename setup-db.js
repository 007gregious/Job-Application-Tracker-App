const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function setupDatabase() {
  console.log('í´„ Setting up database...');
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    
    // Split into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (let statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
        console.log('âœ… Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('í¾‰ Database setup complete!');
  } catch (error) {
    console.error('âŒ Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
