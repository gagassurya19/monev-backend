const Joi = require('joi')

const etlValidators = {
  etlTokenOnly: Joi.object({
    token: Joi.string()
      .required()
      .description('token auth')
  }),
  etlPagination: Joi.object({
    token: Joi.string()
      .required()
      .description("token auth"),
    limit: Joi.number(),
    offset: Joi.number()
  }),
}

module.exports = etlValidators
