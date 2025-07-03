const config = require('../../config');

const authService = {
  // Validate webhook token
  validateWebhookToken: (token) => {
    if (!token) {
      return false;
    }
    
    // Check if the token exists in the configured webhook tokens
    return config.webhooks.tokens.includes(token);
  },

  // Get webhook info from token
  getWebhookInfo: (token) => {
    if (!authService.validateWebhookToken(token)) {
      throw new Error('Invalid webhook token');
    }

    // Return webhook info (can be extended to include more details per token)
    return {
      token,
      type: 'webhook',
      isValid: true,
      // You can extend this to map tokens to specific permissions or identities
      permissions: ['read', 'write']
    };
  }
};

module.exports = authService; 