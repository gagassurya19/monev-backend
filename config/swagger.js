const swaggerOptions = {
  info: {
    title: 'Celoe Logs Backend API',
    version: '1.0.0',
    description: 'API for logging system with JWT authentication'
  },
  documentationPath: '/docs',
  jsonPath: '/swagger.json',
  securityDefinitions: {
    'Bearer': {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
    },
    'Token': {
      type: 'apiKey', 
      name: 'token',
      in: 'query',
      description: 'JWT token as query parameter. Example: "?token=your_jwt_token"'
    }
  },
  security: [
    { 'Bearer': [] },
    { 'Token': [] }
  ]
};

module.exports = swaggerOptions; 