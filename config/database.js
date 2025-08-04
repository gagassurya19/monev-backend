require('dotenv').config();

const databaseConfig = {
  development: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'monev_db',
    user: process.env.DB_USER || 'monev_user',
    password: process.env.DB_PASSWORD || 'monev_password',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    // Centralized database names
    dbNames: {
      main: process.env.DB_NAME || 'monev_db',
      old: process.env.OLD_DB_NAME || 'moodle_logs',
      test: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'monev_test_db'
    }
  },
  
  production: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'monev_db',
    user: process.env.DB_USER || 'monev_user',
    password: process.env.DB_PASSWORD || 'monev_password',
    connectionLimit: 20,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    // Centralized database names
    dbNames: {
      main: process.env.DB_NAME || 'monev_db',
      old: process.env.OLD_DB_NAME || 'moodle_logs',
      test: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'monev_test_db'
    }
  },
  
  test: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'monev_test_db',
    user: process.env.DB_USER || 'monev_user',
    password: process.env.DB_PASSWORD || 'monev_password',
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    // Centralized database names
    dbNames: {
      main: process.env.DB_NAME || 'monev_test_db',
      old: process.env.OLD_DB_NAME || 'moodle_logs',
      test: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'monev_test_db'
    }
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = databaseConfig[env]; 