require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 8889,
    database: process.env.DB_NAME || 'moodle401',
    user: process.env.DB_USER || 'moodle',
    password: process.env.DB_PASSWORD || 'moodle',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-this',
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