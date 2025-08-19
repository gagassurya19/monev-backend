const Joi = require('joi')

const etlStudentActivitySummaryValidators = {
  // Basic pagination validator
  etlPagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20).description('Number of logs to return'),
    offset: Joi.number().integer().min(0).default(0).description('Number of logs to skip')
  }),

  // Token only validator
  etlTokenOnly: Joi.object({
    token: Joi.string().optional().description('Webhook token for authentication')
  })
}

module.exports = etlStudentActivitySummaryValidators

