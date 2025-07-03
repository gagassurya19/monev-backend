const authService = require('../services/authService');
const Boom = require('@hapi/boom');

const webhookAuth = {
  name: 'webhook',
  scheme: 'webhook-token',
  
  implementation: (server, options) => {
    return {
      authenticate: (request, h) => {
        let token = null;
        
        // Check for token in query parameters first (webhook style)
        if (request.query && request.query.token) {
          token = request.query.token;
        }
        // Also check Authorization header as fallback
        else if (request.headers.authorization) {
          const authorization = request.headers.authorization;
          token = authorization.replace(/Bearer\s+/i, '');
        }
        
        if (!token) {
          throw Boom.unauthorized('token missing');
        }
        
        // Validate webhook token
        if (!authService.validateWebhookToken(token)) {
          throw Boom.unauthorized('Invalid webhook token');
        }
        
        try {
          const webhookInfo = authService.getWebhookInfo(token);
          
          return h.authenticated({
            credentials: webhookInfo,
            artifacts: { token }
          });
        } catch (error) {
          throw Boom.unauthorized('Invalid webhook token');
        }
      }
    };
  }
};

module.exports = webhookAuth; 