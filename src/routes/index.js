const config = require('../../config')
const healthRoutes = require('./health')
const authRoutes = require('./auth')
const etlRoutes = require('./etl')
const coursePerformanceRoutes = require('./course-performance')

// Combine all routes
const routes = [
  // Health check routes (no prefix needed)
  ...healthRoutes,

  // API routes with prefix
  ...authRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}${route.path}`
  })),

  ...etlRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}${route.path}`
  })),

  ...coursePerformanceRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}${route.path}`
  }))
]

module.exports = routes
