const Boom = require('@hapi/boom');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const authController = {
  // Validate webhook token
  validateToken: async (request, h) => {
    try {
      const token = request.query.token || request.payload?.token;
      
      if (!token) {
        throw Boom.badRequest('Token is required');
      }
      
      const isValid = authService.validateWebhookToken(token);
      
      if (!isValid) {
        logger.warn('Invalid token validation attempt', { token });
        throw Boom.unauthorized('Invalid token');
      }
      
      const webhookInfo = authService.getWebhookInfo(token);
      
      logger.info('Token validated successfully', { token });
      
      return h.response({
        message: 'Token is valid',
        webhook: webhookInfo
      }).code(200);
      
    } catch (error) {
      logger.error('Token validation failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Token validation failed');
    }
  },

  // Get current webhook info (for authenticated requests)
  getCurrentWebhook: async (request, h) => {
    try {
      const webhookInfo = request.auth.credentials;
      
      return h.response({
        webhook: webhookInfo
      }).code(200);
      
    } catch (error) {
      logger.error('Get webhook info failed:', error.message);
      throw Boom.badImplementation('Failed to get webhook information');
    }
  }
};

module.exports = authController; 