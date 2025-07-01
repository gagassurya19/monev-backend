const logController = require('../controllers/logController');
const validators = require('../validators/logValidators');

const routes = [
  {
    method: 'POST',
    path: '/logs',
    handler: logController.createLog,
    options: {
      description: 'Create a new log entry',
      tags: ['api', 'logs'],
      validate: {
        payload: validators.createLogSchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs',
    handler: logController.getAllLogs,
    options: {
      description: 'Get all logs with filtering and pagination',
      tags: ['api', 'logs'],
      validate: {
        query: validators.getLogsQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/{id}',
    handler: logController.getLogById,
    options: {
      description: 'Get log by ID',
      tags: ['api', 'logs'],
      validate: {
        params: validators.logIdParamSchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'PUT',
    path: '/logs/{id}',
    handler: logController.updateLog,
    options: {
      description: 'Update log entry',
      tags: ['api', 'logs'],
      validate: {
        params: validators.logIdParamSchema,
        payload: validators.updateLogSchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/logs/{id}',
    handler: logController.deleteLog,
    options: {
      description: 'Delete log entry',
      tags: ['api', 'logs'],
      validate: {
        params: validators.logIdParamSchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/search',
    handler: logController.searchLogs,
    options: {
      description: 'Search logs with advanced filters',
      tags: ['api', 'logs'],
      validate: {
        query: validators.searchLogsQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/stats',
    handler: logController.getLogStats,
    options: {
      description: 'Get log statistics',
      tags: ['api', 'logs'],
      validate: {
        query: validators.logStatsQuerySchema
      },
      auth: 'jwt'
    }
  }
];

module.exports = routes; 