const Hapi = require('@hapi/hapi')
const config = require('../config')
const logger = require('./utils/logger')
const database = require('./database/connection')
const routes = require('./routes')
const cronService = require('./services/cronService')

const init = async () => {
  // Create Hapi server instance
  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
    state: {
      strictHeader: false, // Allow malformed cookies to be ignored instead of causing errors
      ignoreErrors: true, // Ignore cookie parsing errors
      clearInvalid: true, // Automatically clear invalid cookies
      encoding: 'base64json',
      isSecure: false, // Set to true in production with HTTPS
      isHttpOnly: true,
      isSameSite: 'Lax'
    },
    routes: {
      cors: {
        origin: ['*'], // Configure based on your needs
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
        exposedHeaders: ['WWW-Authenticate', 'Server-Authorization'],
        additionalExposedHeaders: ['X-Custom-Header'],
        maxAge: 60,
        credentials: true
      },
      validate: {
        failAction: async (request, h, err) => {
          logger.error('Validation error:', err.message)
          throw err
        }
      }
    }
  })

  // Register plugins
  await server.register([
    require('@hapi/inert'),
    require('@hapi/vision'),
    {
      plugin: require('hapi-swagger'),
      options: require('../config/swagger')
    }
  ])

  // Register JWT authentication scheme
  const authMiddleware = require('./middlewares/auth')
  server.auth.scheme(authMiddleware.name, authMiddleware.implementation)
  server.auth.strategy('jwt', authMiddleware.name)

  // Register routes
  server.route(routes)

  // Add global error handling
  server.ext('onPreResponse', (request, h) => {
    const response = request.response

    if (response.isBoom) {
      logger.error('Request error:', {
        statusCode: response.output.statusCode,
        error: response.message,
        path: request.path,
        method: request.method
      })
    }

    return h.continue
  })

  // Initialize database connection
  try {
    await database.testConnection()
    logger.info('Database connection established successfully')
  } catch (error) {
    logger.error('Database connection failed:', error.message)
    process.exit(1)
  }

  // Start the server
  await server.start()
  logger.info(`Server running on ${server.info.uri}`)

  // Initialize and start cron jobs
  cronService.initialize()
  cronService.start()

  return server
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully')
  cronService.stop()
  cronService.destroy()
  await database.closeConnection()
  process.exit(0)
})

init()
