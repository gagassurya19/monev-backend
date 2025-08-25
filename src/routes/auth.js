const authController = require('../controllers/authController')
const validators = require('../validators/authValidators')
const Joi = require('joi')

const routes = [
  {
    method: 'GET',
    path: '/validate',
    handler: authController.validateToken,
    options: {
      description: 'Validate JWT token',
      notes: 'Validates a JWT token from query parameter',
      tags: ['api', 'auth'],
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/generate-token',
    handler: authController.generateToken,
    options: {
      description: 'Generate a new JWT token',
      notes: 'Generates a new JWT token with custom payload structure',
      tags: ['api', 'auth'],
      validate: {
        payload: Joi.object({
          id: Joi.string().required(),
          username: Joi.string().required(),
          name: Joi.string().required(),
          expirationMinutes: Joi.number().integer().min(1).max(525600).required(),
          userRole: Joi.string().valid('admin', 'user').required()
        })
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
