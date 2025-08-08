const healthController = require('../controllers/healthController')
const Joi = require('joi')

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: healthController.getHealth,
    options: {
      description: 'Health check endpoint',
      notes: 'Simple health check to verify server is running',
      tags: ['api', 'health'],

      auth: false // No authentication required for health checks
    }
  },
  {
    method: 'GET',
    path: '/detailed',
    handler: healthController.getDetailedHealth,
    options: {
      description: 'Detailed health check with database status',
      notes: 'Comprehensive health check including database connectivity and system information',
      tags: ['api', 'health'],

      auth: false
    }
  }
]

module.exports = routes
