const healthController = require('../controllers/healthController');

const routes = [
  {
    method: 'GET',
    path: '/health',
    handler: healthController.getHealth,
    options: {
      description: 'Health check endpoint',
      tags: ['api', 'health'],
      auth: false // No authentication required for health checks
    }
  },
  {
    method: 'GET',
    path: '/health/detailed',
    handler: healthController.getDetailedHealth,
    options: {
      description: 'Detailed health check with database status',
      tags: ['api', 'health'],
      auth: false
    }
  }
];

module.exports = routes; 