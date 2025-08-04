#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Test koneksi ke database monev_db
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

async function testConnection() {
  console.log('=== Monev Database Connection Test ===\n');
  
  console.log('Database Configuration:');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Port: ${dbConfig.port}`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Charset: ${dbConfig.charset}`);
  console.log(`Collation: ${dbConfig.collation}\n`);

  try {
    // Test connection
    console.log('Testing database connection...');
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      charset: dbConfig.charset
    });

    console.log('✅ Database connection successful!\n');

    // Test ping
    console.log('Testing ping...');
    await connection.ping();
    console.log('✅ Ping successful!\n');

    // Test query
    console.log('Testing basic query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful!');
    console.log(`Result: ${JSON.stringify(rows[0])}\n`);

    // Check tables
    console.log('Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Check database info
    console.log('\nDatabase Information:');
    const [dbInfo] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as mysql_version');
    console.log(`Current Database: ${dbInfo[0].current_db}`);
    console.log(`MySQL Version: ${dbInfo[0].mysql_version}`);

    await connection.end();
    console.log('\n✅ All tests passed! Database is ready to use.');

  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nPossible solutions:');
      console.error('1. Check username and password in .env file');
      console.error('2. Make sure user has proper privileges');
      console.error('3. Run: npm run setup:db');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nPossible solutions:');
      console.error('1. Check if MySQL server is running');
      console.error('2. Check host and port configuration');
      console.error('3. Check firewall settings');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nPossible solutions:');
      console.error('1. Database does not exist');
      console.error('2. Run: npm run setup:db');
      console.error('3. Check database name in .env file');
    }
    
    process.exit(1);
  }
}

// Run test
testConnection(); 