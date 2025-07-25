const authController = require('../controllers/authController')
const validators = require('../validators/authValidators')
const Joi = require('joi')

const routes = [
  {
    method: 'POST',
    path: '/auth/validate',
    handler: authController.validateToken,
    options: {
      description: 'Validate JWT token',
      notes: 'Validates a JWT token with platform-compatible payload structure',
      tags: ['api', 'auth'],
      validate: {
        payload: validators.tokenPayloadSchema
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/auth/generate-token',
    handler: authController.generateToken,
    options: {
      description: 'Generate a new JWT token',
      notes: 'Generates a new JWT token with platform-compatible payload structure',
      tags: ['api', 'auth'],
      validate: {
        payload: Joi.object({
          sub: Joi.string().default('test-user'),
          name: Joi.string().default('Test User'),
          kampus: Joi.string().default(''),
          fakultas: Joi.string().default(''),
          prodi: Joi.string().default(''),
          admin: Joi.boolean().default(false)
        }).optional()
      },
      auth: false
    }
  }
]

module.exports = routes
