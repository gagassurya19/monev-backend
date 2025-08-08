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
}

module.exports = etlCoursePerformanceValidators
