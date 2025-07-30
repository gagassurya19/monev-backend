const Joi = require('joi')

const sasValidators = {
  sasGetFilterSchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Token'),
  })
}

module.exports = sasValidators
