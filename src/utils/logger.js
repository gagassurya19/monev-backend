const winston = require('winston')
const path = require('path')
const config = require('../../config')

// Create logs directory if it doesn't exist
const fs = require('fs')
const logsDir = path.dirname(config.logging.file)
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Custom format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`
  })
)

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'celoe-logs-backend' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),

    // Write all logs to combined.log
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
})

// Add console transport for development
if (config.server.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`
      })
    )
  }))
}

// Add request logging helper
logger.logRequest = (req, statusCode, responseTime) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.headers['user-agent'],
    ip: req.info.remoteAddress
  }

  if (statusCode >= 400) {
    logger.warn('HTTP Request', logData)
  } else {
    logger.info('HTTP Request', logData)
  }
}

module.exports = logger
