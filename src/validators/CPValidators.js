const Joi = require('joi')

const cpValidators = {
  cpQuerySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Token')
  })
}

module.exports = cpValidators
