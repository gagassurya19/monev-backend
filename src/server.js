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
      validate: {
        failAction: async (request, h, err) => {
          logger.error('Validation error:', err.message)
          throw err
        }
      },
      cors: {
        origin: config.server.corsOrigins,
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Origin', 'X-Requested-With', 'cache-control', 'pragma'],
        exposedHeaders: ['WWW-Authenticate', 'Server-Authorization'],
        additionalExposedHeaders: ['X-Custom-Header'],
        maxAge: 86400,
        credentials: true
      }
    }
  })

  // Log CORS configuration for debugging
  logger.info('CORS Configuration:', {
    corsOrigins: config.server.corsOrigins,
    corsEnabled: true
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

  // Configure CORS using built-in HAPI options
  server.route({
    method: 'OPTIONS',
    path: '/{p*}',
    handler: (request, h) => {
      const origin = request.headers.origin;
      const allowedOrigins = config.server.corsOrigins;
      
      // Check if origin is in allowed list
      const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
      
      // Log CORS preflight request for debugging
      logger.info('CORS Preflight Request:', {
        origin: origin,
        allowedOrigins: allowedOrigins,
        isAllowed: isAllowed,
        path: request.path,
        method: request.method
      });
      
      return h.response()
        .header('Access-Control-Allow-Origin', isAllowed ? origin : allowedOrigins[0])
        .header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, If-None-Match, Origin, X-Requested-With, Cache-Control, Pragma, X-Forwarded-For, X-Forwarded-Proto')
        .header('Access-Control-Allow-Credentials', 'true')
        .header('Access-Control-Max-Age', '86400')
        .header('Access-Control-Expose-Headers', 'WWW-Authenticate, Server-Authorization')
        .code(200)
    },
    options: {
      auth: false, // Ensure OPTIONS requests bypass authentication
      cors: {
        origin: config.server.corsOrigins
      }
    }
  })

  // Register JWT authentication scheme
  const authMiddleware = require('./middlewares/auth')
  server.auth.scheme(authMiddleware.name, authMiddleware.implementation)
  server.auth.strategy('jwt', authMiddleware.name)

  // Register routes
  server.route(routes)

  // Serve static files from public directory
  server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: './public',
        listing: false,
        index: false
      }
    },
    options: {
      auth: false,
      description: 'Serve static files from public directory',
      notes: 'Serves HTML, CSS, JS, and other static files',
      tags: ['static']
    }
  })

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
  logger.info(`Server host: ${config.server.host}`)
  logger.info(`Server port: ${config.server.port}`)
  logger.info(`Server address: ${server.info.address}:${server.info.port}`)

  // Log actual server binding
  console.log('=== Server Debug Info ===')
  console.log('Server URI:', server.info.uri)
  console.log('Server Address:', server.info.address)
  console.log('Server Port:', server.info.port)
  console.log('Config Host:', config.server.host)
  console.log('Config Port:', config.server.port)
  console.log('========================')

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
