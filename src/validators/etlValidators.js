const Joi = require('joi')

const etlValidators = {
  etlQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook authentication token')
  })
}

module.exports = etlValidators
