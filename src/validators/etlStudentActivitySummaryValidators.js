const Joi = require('joi')

const etlStudentActivitySummaryValidators = {
  // Basic pagination validator
  etlPagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20).description('Number of logs to return'),
    offset: Joi.number().integer().min(0).default(0).description('Number of logs to skip'),
    type_run: Joi.string().valid('fetch_student_activity_summary').default('fetch_student_activity_summary').description('Filter logs by type_run (SAS ETL only)')
  }),

  // Token only validator
  etlTokenOnly: Joi.object({
    token: Joi.string().optional().description('Webhook token for authentication')
  }),

  // ETL trigger body validator
  etlTriggerBody: Joi.object({
    start_date: Joi.date().iso().description('Start date for ETL process (YYYY-MM-DD)'),
    concurrency: Joi.number().integer().min(1).max(10).default(4).description('Number of concurrent processes (1-10)')
  })
}

module.exports = etlStudentActivitySummaryValidators

