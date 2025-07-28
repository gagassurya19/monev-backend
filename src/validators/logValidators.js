const Joi = require('joi')

const logValidators = {
  logIdParamSchema: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .description('Log entry ID')
  }),

  createLogSchema: Joi.object({
    level: Joi.string()
      .valid('error', 'warn', 'info', 'debug')
      .required()
      .description('Log level'),

    message: Joi.string()
      .min(1)
      .max(1000)
      .required()
      .description('Log message'),

    source: Joi.string()
      .max(100)
      .required()
      .description('Source of the log (service, module, etc.)'),

    userId: Joi.number()
      .integer()
      .positive()
      .description('User ID associated with the log'),

    metadata: Joi.object()
      .description('Additional metadata as JSON object'),

    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .description('Array of tags for categorization'),

    timestamp: Joi.date()
      .iso()
      .description('Custom timestamp (defaults to current time)')
  }),

  updateLogSchema: Joi.object({
    level: Joi.string()
      .valid('error', 'warn', 'info', 'debug')
      .description('Log level'),

    message: Joi.string()
      .min(1)
      .max(1000)
      .description('Log message'),

    source: Joi.string()
      .max(100)
      .description('Source of the log'),

    metadata: Joi.object()
      .description('Additional metadata as JSON object'),

    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .description('Array of tags for categorization')
  }).min(1),

  getLogsQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .description('Page number for pagination'),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .description('Number of items per page'),

    level: Joi.string()
      .valid('error', 'warn', 'info', 'debug')
      .description('Filter by log level'),

    source: Joi.string()
      .max(100)
      .description('Filter by source'),

    userId: Joi.number()
      .integer()
      .positive()
      .description('Filter by user ID'),

    startDate: Joi.date()
      .iso()
      .description('Start date for date range filter'),

    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .description('End date for date range filter'),

    sortBy: Joi.string()
      .valid('id', 'level', 'message', 'source', 'timestamp', 'createdAt')
      .default('timestamp')
      .description('Field to sort by'),

    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .description('Sort order')
  }),

  searchLogsQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    q: Joi.string()
      .min(1)
      .max(200)
      .required()
      .description('Search query string'),

    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .description('Page number for pagination'),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .description('Number of items per page'),

    level: Joi.string()
      .valid('error', 'warn', 'info', 'debug')
      .description('Filter by log level'),

    source: Joi.string()
      .max(100)
      .description('Filter by source'),

    startDate: Joi.date()
      .iso()
      .description('Start date for date range filter'),

    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .description('End date for date range filter')
  }),

  logStatsQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    startDate: Joi.date()
      .iso()
      .description('Start date for statistics'),

    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .description('End date for statistics'),

    groupBy: Joi.string()
      .valid('hour', 'day', 'week', 'month')
      .default('day')
      .description('Group statistics by time period'),

    source: Joi.string()
      .max(100)
      .description('Filter statistics by source')
  }),

  // Additional schemas referenced in routes
  summaryQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    startDate: Joi.date()
      .iso()
      .description('Start date for summary'),

    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .description('End date for summary'),

    groupBy: Joi.string()
      .valid('hour', 'day', 'week', 'month')
      .default('day')
      .description('Group summary by time period')
  }),

  userParamsSchema: Joi.object({
    userId: Joi.number()
      .integer()
      .positive()
      .required()
      .description('User ID')
  }),

  userLogsQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .description('Page number for pagination'),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .description('Number of items per page'),

    startDate: Joi.date()
      .iso()
      .description('Start date for date range filter'),

    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .description('End date for date range filter'),

    sortBy: Joi.string()
      .valid('id', 'level', 'message', 'source', 'timestamp', 'createdAt')
      .default('timestamp')
      .description('Field to sort by'),

    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .description('Sort order')
  }),

  courseParamsSchema: Joi.object({
    courseId: Joi.number()
      .integer()
      .positive()
      .required()
      .description('Course ID')
  }),

  courseLogsQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .description('Page number for pagination'),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .description('Number of items per page'),

    startDate: Joi.date()
      .iso()
      .description('Start date for date range filter'),

    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .description('End date for date range filter'),

    sortBy: Joi.string()
      .valid('id', 'level', 'message', 'source', 'timestamp', 'createdAt')
      .default('timestamp')
      .description('Field to sort by'),

    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .description('Sort order')
  }),

  actionParamsSchema: Joi.object({
    action: Joi.string()
      .min(1)
      .max(100)
      .required()
      .description('Action type')
  }),

  actionLogsQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .description('Page number for pagination'),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .description('Number of items per page'),

    startDate: Joi.date()
      .iso()
      .description('Start date for date range filter'),

    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .description('End date for date range filter'),

    sortBy: Joi.string()
      .valid('id', 'level', 'message', 'source', 'timestamp', 'createdAt')
      .default('timestamp')
      .description('Field to sort by'),

    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .description('Sort order')
  }),

  dateRangeQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    startDate: Joi.date()
      .iso()
      .required()
      .description('Start date for date range filter'),

    endDate: Joi.date()
      .iso()
      .required()
      .min(Joi.ref('startDate'))
      .description('End date for date range filter'),

    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .description('Page number for pagination'),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .description('Number of items per page'),

    level: Joi.string()
      .valid('error', 'warn', 'info', 'debug')
      .description('Filter by log level'),

    source: Joi.string()
      .max(100)
      .description('Filter by source'),

    sortBy: Joi.string()
      .valid('id', 'level', 'message', 'source', 'timestamp', 'createdAt')
      .default('timestamp')
      .description('Field to sort by'),

    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .description('Sort order')
  }),

  exportQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token'),

    format: Joi.string()
      .valid('csv', 'json')
      .default('csv')
      .description('Export format'),

    startDate: Joi.date()
      .iso()
      .description('Start date for export filter'),

    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .description('End date for export filter'),

    level: Joi.string()
      .valid('error', 'warn', 'info', 'debug')
      .description('Filter by log level'),

    source: Joi.string()
      .max(100)
      .description('Filter by source'),

    userId: Joi.number()
      .integer()
      .positive()
      .description('Filter by user ID'),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .default(1000)
      .description('Maximum number of records to export')
  })
}

module.exports = logValidators
