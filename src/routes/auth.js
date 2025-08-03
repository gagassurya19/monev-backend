const authController = require('../controllers/authController')
const validators = require('../validators/authValidators')
const Joi = require('joi')

const routes = [
  {
    method: 'POST',
    path: '/validate',
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
    path: '/generate-token',
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
  },
  {
    method: 'POST',
    path: '/login-admin',
    handler: authController.loginAdmin,
    options: {
      description: 'Login to the platform as admin',
      notes: 'Logs in a admin to the platform',
      tags: ['api', 'auth'],
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required()
        })
      },
      auth: false
    }
  }
]

module.exports = routes
