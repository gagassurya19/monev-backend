const authService = require('../services/authService');

const jwtAuth = {
  name: 'jwt',
  scheme: 'bearer-access-token',
  
  implementation: (server, options) => {
    return {
      authenticate: async (request, h) => {
        try {
          const authorization = request.headers.authorization;
          
          if (!authorization) {
            return h.unauthenticated('Missing authorization header');
          }
          
          const token = authorization.replace(/Bearer\s+/i, '');
          
          if (!token) {
            return h.unauthenticated('Missing token');
          }
          
          // Verify token and get user
          const user = await authService.getUserFromToken(token);
          
          return h.authenticated({
            credentials: user,
            artifacts: { token }
          });
          
        } catch (error) {
          return h.unauthenticated('Invalid token');
        }
      }
    };
  }
};

module.exports = jwtAuth; 