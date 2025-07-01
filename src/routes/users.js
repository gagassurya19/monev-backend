const userController = require('../controllers/userController');
const validators = require('../validators/userValidators');

const routes = [
  {
    method: 'GET',
    path: '/users',
    handler: userController.getAllUsers,
    options: {
      description: 'Get all users with pagination',
      tags: ['api', 'users'],
      validate: {
        query: validators.getUsersQuerySchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: userController.getUserById,
    options: {
      description: 'Get user by ID',
      tags: ['api', 'users'],
      validate: {
        params: validators.userIdParamSchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: userController.updateUser,
    options: {
      description: 'Update user information',
      tags: ['api', 'users'],
      validate: {
        params: validators.userIdParamSchema,
        payload: validators.updateUserSchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: userController.deleteUser,
    options: {
      description: 'Delete user',
      tags: ['api', 'users'],
      validate: {
        params: validators.userIdParamSchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'PUT',
    path: '/users/{id}/password',
    handler: userController.changePassword,
    options: {
      description: 'Change user password',
      tags: ['api', 'users'],
      validate: {
        params: validators.userIdParamSchema,
        payload: validators.changePasswordSchema
      },
      auth: 'jwt'
    }
  }
];

module.exports = routes; 