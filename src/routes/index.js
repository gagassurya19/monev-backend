const config = require('../../config');
const healthRoutes = require('./health');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const logRoutes = require('./logs');

// Combine all routes
const routes = [
  // Health check routes (no prefix needed)
  ...healthRoutes,
  
  // API routes with prefix
  ...authRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}${route.path}`
  })),
  
  ...userRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}${route.path}`
  })),
  
  ...logRoutes.map(route => ({
    ...route,
    path: `${config.api.prefix}${route.path}`
  }))
];

module.exports = routes; 