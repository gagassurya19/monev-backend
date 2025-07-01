const database = require('../database/connection');
const logger = require('../utils/logger');

const healthController = {
  // Basic health check
  getHealth: async (request, h) => {
    try {
      return h.response({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'celoe-logs-backend'
      }).code(200);
    } catch (error) {
      logger.error('Health check failed:', error.message);
      return h.response({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }).code(503);
    }
  },

  // Detailed health check including database
  getDetailedHealth: async (request, h) => {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'celoe-logs-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {}
    };

    // Check database connection
    try {
      await database.testConnection();
      healthCheck.checks.database = {
        status: 'healthy',
        message: 'Database connection successful'
      };
    } catch (error) {
      healthCheck.status = 'degraded';
      healthCheck.checks.database = {
        status: 'unhealthy',
        message: error.message
      };
      logger.error('Database health check failed:', error.message);
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    healthCheck.checks.memory = {
      status: 'healthy',
      usage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      }
    };

    // Check if any component is unhealthy
    const hasUnhealthyCheck = Object.values(healthCheck.checks)
      .some(check => check.status === 'unhealthy');

    if (hasUnhealthyCheck) {
      healthCheck.status = 'unhealthy';
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    return h.response(healthCheck).code(statusCode);
  }
};

module.exports = healthController; 