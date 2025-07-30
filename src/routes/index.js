const config = require('../../config')
const healthRoutes = require('./health')
const authRoutes = require('./auth')
const coursePerformanceRoutes = require('./course-performance')
const studentActivitySummaryRoutes = require('./student-activity-summary')

// Combine all routes
const routes = [
  // Health check routes (no prefix needed)
  ...healthRoutes,

  // API routes with prefix
  ...authRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}/auth${route.path}`
  })),

  ...coursePerformanceRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}/cp${route.path}`
  })),

  ...studentActivitySummaryRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}/sas${route.path}`
  }))
]

module.exports = routes
