const authController = require('../controllers/authController');
const validators = require('../validators/authValidators');
const Joi = require('joi');

const routes = [
  {
    method: 'GET',
    path: '/auth/validate',
    handler: authController.validateToken,
    options: {
      description: 'Validate webhook token',
      notes: 'Validates a webhook token provided via query parameter',
      tags: ['api', 'auth'],
      validate: {
        query: validators.tokenQuerySchema
      },

      auth: false
    }
  },
  {
    method: 'POST',
    path: '/auth/validate',
    handler: authController.validateToken,
    options: {
      description: 'Validate webhook token (POST)',
      tags: ['api', 'auth'],
      validate: {
        payload: validators.tokenPayloadSchema
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/auth/webhook',
    handler: authController.getCurrentWebhook,
    options: {
      description: 'Get current webhook information',
      tags: ['api', 'auth'],
      auth: 'webhook'
    }
  }
];

module.exports = routes; 