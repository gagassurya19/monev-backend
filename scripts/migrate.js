const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

async function runMigrations() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database
    });
    
    console.log('Connected to MySQL database');
    
    // Get migration files
    const migrationsDir = path.join(__dirname, '../src/database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        await connection.execute(statement);
      }
      
      console.log(`✓ Migration ${file} completed`);
    }
    
    console.log('All migrations completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migrations
runMigrations(); 