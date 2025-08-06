const Joi = require('joi')

const celoeApiValidators = {
  celoeApiPagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10).description('Number of logs to return'),
    offset: Joi.number().integer().min(0).default(0).description('Number of logs to skip')
  })
}

module.exports = celoeApiValidators 