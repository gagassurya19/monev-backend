const Joi = require('joi')

const authValidators = {
  tokenQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook token')
  }),

  tokenPayloadSchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Webhook token')
  })
}

module.exports = authValidators
