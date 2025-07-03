const authService = require('../services/authService');

const webhookAuth = {
  name: 'webhook',
  scheme: 'webhook-token',
  
  implementation: (server, options) => {
    return {
      authenticate: async (request, h) => {
        try {
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
            return h.unauthenticated('Missing webhook token');
          }
          
          // Validate webhook token
          const webhookInfo = authService.getWebhookInfo(token);
          
          return h.authenticated({
            credentials: webhookInfo,
            artifacts: { token }
          });
          
        } catch (error) {
          return h.unauthenticated('Invalid webhook token');
        }
      }
    };
  }
};

module.exports = webhookAuth; 