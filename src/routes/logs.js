const logController = require('../controllers/logController')
const validators = require('../validators/logValidators')

const routes = [
  {
    method: 'GET',
    path: '/logs',
    handler: logController.getLogs,
    options: {
      description: 'Get logs with filtering and pagination',
      notes: 'Retrieve logs with optional filtering by user, course, action, etc.',
      tags: ['api', 'logs'],
      validate: {
        query: validators.getLogsQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/summary',
    handler: logController.getLogsSummary,
    options: {
      description: 'Get logs summary statistics',
      notes: 'Get aggregated statistics about logs',
      tags: ['api', 'logs'],
      validate: {
        query: validators.summaryQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/user/{userId}',
    handler: logController.getUserLogs,
    options: {
      description: 'Get logs for specific user',
      notes: 'Retrieve all logs for a specific user',
      tags: ['api', 'logs'],
      validate: {
        params: validators.userParamsSchema,
        query: validators.userLogsQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/course/{courseId}',
    handler: logController.getCourseLogs,
    options: {
      description: 'Get logs for specific course',
      notes: 'Retrieve all logs for a specific course',
      tags: ['api', 'logs'],
      validate: {
        params: validators.courseParamsSchema,
        query: validators.courseLogsQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/action/{action}',
    handler: logController.getActionLogs,
    options: {
      description: 'Get logs for specific action',
      notes: 'Retrieve all logs for a specific action type',
      tags: ['api', 'logs'],
      validate: {
        params: validators.actionParamsSchema,
        query: validators.actionLogsQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/daterange',
    handler: logController.getLogsByDateRange,
    options: {
      description: 'Get logs within date range',
      notes: 'Retrieve logs within a specific date range',
      tags: ['api', 'logs'],
      validate: {
        query: validators.dateRangeQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/export',
    handler: logController.exportLogs,
    options: {
      description: 'Export logs to CSV',
      notes: 'Export filtered logs to CSV format',
      tags: ['api', 'logs'],
      validate: {
        query: validators.exportQuerySchema
      },
      auth: 'jwt'
    }
  }
]

module.exports = routes
