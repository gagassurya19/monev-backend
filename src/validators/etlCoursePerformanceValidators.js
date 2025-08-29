const Joi = require('joi')

const etlCoursePerformanceValidators = {
  etlCoursePerformanceTokenOnly: Joi.object({
    token: Joi.string()
      .required()
      .description('token auth')
  }),
  etlCoursePerformancePagination: Joi.object({
    token: Joi.string()
      .required()
      .description("token auth"),
    limit: Joi.number(),
    offset: Joi.number()
  }),
  etlTriggerBody: Joi.object({
    start_date: Joi.date().iso().description('Start date for ETL process (YYYY-MM-DD)'),
    end_date: Joi.date().iso().description('End date for ETL process (YYYY-MM-DD)'),
    concurrency: Joi.number().integer().min(1).max(10).default(4).description('Number of concurrent processes (1-10)')
  })
}

module.exports = etlCoursePerformanceValidators
