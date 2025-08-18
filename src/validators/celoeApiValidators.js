const Joi = require('joi')

const celoeApiValidators = {
  // Basic pagination validator
  celoeApiPagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10).description('Number of logs to return'),
    offset: Joi.number().integer().min(0).default(0).description('Number of logs to skip')
  }),

  // SAS ETL specific validators
  sasETLLogs: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50).description('Number of logs to return'),
    offset: Joi.number().integer().min(0).default(0).description('Number of logs to skip'),
    status: Joi.string().valid('running', 'completed', 'failed').description('Filter by status')
  }),

  sasETLRun: Joi.object({
    start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).description('Start date in YYYY-MM-DD format'),
    end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).description('End date in YYYY-MM-DD format'),
    concurrency: Joi.number().integer().min(1).max(10).default(1).description('Number of concurrent processes')
  }),

  sasETLExport: Joi.object({
    limit: Joi.number().integer().min(1).max(1000).default(100).description('Number of records to return'),
    offset: Joi.number().integer().min(0).default(0).description('Number of records to skip'),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).description('Filter by specific date (YYYY-MM-DD)'),
    course_id: Joi.string().description('Filter by course ID')
  }),

  // CP ETL specific validators
  cpETLLogs: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50).description('Number of logs to return'),
    offset: Joi.number().integer().min(0).default(0).description('Number of logs to skip'),
    status: Joi.number().integer().valid(1, 2, 3).description('Filter by status: 1 (finished), 2 (inprogress), 3 (failed)')
  }),

  cpETLRun: Joi.object({
    start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).description('Start date in YYYY-MM-DD format'),
    end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).description('End date in YYYY-MM-DD format'),
    concurrency: Joi.number().integer().min(1).max(10).default(1).description('Number of concurrent processes')
  }),

  cpETLExport: Joi.object({
    limit: Joi.number().integer().min(1).max(1000).default(100).description('Number of records to return'),
    offset: Joi.number().integer().min(0).default(0).description('Number of records to skip'),
    table: Joi.string().valid(
      'cp_student_profile',
      'cp_course_summary', 
      'cp_activity_summary',
      'cp_student_quiz_detail',
      'cp_student_assignment_detail',
      'cp_student_resource_access'
    ).description('Export specific table only'),
    tables: Joi.string().description('Comma-separated list of tables to export'),
    debug: Joi.boolean().default(false).description('Include debug information')
  })
}

module.exports = celoeApiValidators 