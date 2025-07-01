const authController = require('../controllers/authController');
const validators = require('../validators/authValidators');

const routes = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: authController.register,
    options: {
      description: 'Register a new user',
      tags: ['api', 'auth'],
      validate: {
        payload: validators.registerSchema
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: authController.login,
    options: {
      description: 'User login',
      tags: ['api', 'auth'],
      validate: {
        payload: validators.loginSchema
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    handler: authController.refreshToken,
    options: {
      description: 'Refresh access token',
      tags: ['api', 'auth'],
      validate: {
        payload: validators.refreshTokenSchema
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/auth/logout',
    handler: authController.logout,
    options: {
      description: 'User logout',
      tags: ['api', 'auth'],
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/auth/me',
    handler: authController.getCurrentUser,
    options: {
      description: 'Get current user information',
      tags: ['api', 'auth'],
      auth: 'jwt'
    }
  }
];

module.exports = routes; 