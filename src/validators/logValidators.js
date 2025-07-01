const Joi = require('@hapi/joi');

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
  })
};

module.exports = logValidators; 