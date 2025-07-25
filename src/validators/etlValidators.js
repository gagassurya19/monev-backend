const Joi = require('joi')

const etlValidators = {
  etlQuerySchema: Joi.object({
    token: Joi.string()
      .description('Webhook authentication token')
  })
}

module.exports = etlValidators
