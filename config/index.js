require("dotenv").config();

const config = {
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || "0.0.0.0",
    env: process.env.NODE_ENV || "development",
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:3001"],
  },

  database: require("./database"),

  jwt: {
    secret: process.env.JWT_SECRET || "SECRET123",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },

  security: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },

  api: {
    prefix: process.env.API_PREFIX || "/api/v1",
  },

  etl_sas_category_subject: {
    endpoint: {
      categories:
        process.env.EXTERNAL_API_ENDPOINT_CATEGORIES || "/course/category",
      subjects: process.env.EXTERNAL_API_ENDPOINT_SUBJECTS || "/course/subject",
    },
    batchSize: parseInt(process.env.ETL_BATCH_SIZE) || 1000,
    timeout: parseInt(process.env.ETL_TIMEOUT) || 1800000, // 30 minutes
    retryAttempts: parseInt(process.env.ETL_RETRY_ATTEMPTS) || 3,
  },

  celoeapi: {
    baseUrl:
      process.env.EXTERNAL_API_MOODLE_BASE_URL || "http://localhost:8081",
    prefix: process.env.EXTERNAL_API_PREFIX || "/celoeapi",
    timeout: parseInt(process.env.CELOEAPI_TIMEOUT) || 300000, // 5 minutes default
    retryAttempts: parseInt(process.env.CELOEAPI_RETRY_ATTEMPTS) || 3,
  },
};

module.exports = config;
