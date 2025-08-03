const swaggerOptions = {
  info: {
    title: 'MONEV API',
    version: '1.0.0',
    description: 'API for MONEV - Educational Analytics Platform'
  },
  documentationPath: '/api/docs',
  jsonPath: '/api/swagger.json',
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT Authorization header using the Bearer scheme. Enter your JWT token in the format: Bearer {your-jwt-token}'
    },
    token: {
      type: 'apiKey',
      name: 'token',
      in: 'query',
      description: 'JWT token as query parameter. Example: ?token=your-jwt-token'
    }
  },
  security: [
    { Bearer: [] },
    { token: [] }
  ]
};

module.exports = swaggerOptions;