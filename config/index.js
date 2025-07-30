require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 8889,
    database: process.env.DB_NAME || 'moodle_logs',
    user: process.env.DB_USER || 'moodle',
    password: process.env.DB_PASSWORD || 'moodle',
    connectionLimit: 10,
    // Removed incompatible MySQL2 options: acquireTimeout, timeout, reconnect
    waitForConnections: true,
    queueLimit: 0
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'SECRET123',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  security: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
  },
  
  api: {
    prefix: process.env.API_PREFIX || '/api/v1'
  }
};

module.exports = config; 