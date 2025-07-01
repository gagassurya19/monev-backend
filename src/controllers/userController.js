const Boom = require('@hapi/boom');
const User = require('../models/User');
const logger = require('../utils/logger');

const userController = {
  getAllUsers: async (request, h) => {
    try {
      const options = request.query;
      const result = await User.findAll(options);
      
      return h.response({
        message: 'Users retrieved successfully',
        data: result.users.map(user => user.toJSON()),
        pagination: result.pagination
      }).code(200);
      
    } catch (error) {
      logger.error('Get users failed:', error.message);
      throw Boom.badImplementation('Failed to retrieve users');
    }
  },

  getUserById: async (request, h) => {
    try {
      const { id } = request.params;
      const user = await User.findById(id);
      
      if (!user) {
        throw Boom.notFound('User not found');
      }
      
      return h.response({
        message: 'User retrieved successfully',
        user: user.toJSON()
      }).code(200);
      
    } catch (error) {
      logger.error('Get user by ID failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Failed to retrieve user');
    }
  },

  updateUser: async (request, h) => {
    try {
      const { id } = request.params;
      const updateData = request.payload;
      const currentUser = request.auth.credentials;
      
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        throw Boom.notFound('User not found');
      }
      
      // Check permissions - users can only update themselves unless they're admin
      if (currentUser.id !== parseInt(id) && currentUser.role !== 'admin') {
        throw Boom.forbidden('Insufficient permissions');
      }
      
      // Check if email is being changed and already exists
      if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.emailExists(updateData.email, id);
        if (emailExists) {
          throw Boom.conflict('Email already in use');
        }
      }
      
      // Only admins can change roles
      if (updateData.role && currentUser.role !== 'admin') {
        delete updateData.role;
      }
      
      const updatedUser = await User.updateById(id, updateData);
      
      logger.info('User updated', {
        updatedUserId: id,
        updatedBy: currentUser.id
      });
      
      return h.response({
        message: 'User updated successfully',
        user: updatedUser.toJSON()
      }).code(200);
      
    } catch (error) {
      logger.error('Update user failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Failed to update user');
    }
  },

  deleteUser: async (request, h) => {
    try {
      const { id } = request.params;
      const currentUser = request.auth.credentials;
      
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        throw Boom.notFound('User not found');
      }
      
      // Only admins can delete users, and they can't delete themselves
      if (currentUser.role !== 'admin') {
        throw Boom.forbidden('Insufficient permissions');
      }
      
      if (currentUser.id === parseInt(id)) {
        throw Boom.badRequest('Cannot delete your own account');
      }
      
      const deleted = await User.deleteById(id);
      if (!deleted) {
        throw Boom.badImplementation('Failed to delete user');
      }
      
      logger.info('User deleted', {
        deletedUserId: id,
        deletedBy: currentUser.id
      });
      
      return h.response({
        message: 'User deleted successfully'
      }).code(200);
      
    } catch (error) {
      logger.error('Delete user failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Failed to delete user');
    }
  },

  changePassword: async (request, h) => {
    try {
      const { id } = request.params;
      const { currentPassword, newPassword } = request.payload;
      const authUser = request.auth.credentials;
      
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        throw Boom.notFound('User not found');
      }
      
      // Users can only change their own password unless they're admin
      if (authUser.id !== parseInt(id) && authUser.role !== 'admin') {
        throw Boom.forbidden('Insufficient permissions');
      }
      
      // Verify current password (only if not admin changing someone else's password)
      if (authUser.id === parseInt(id)) {
        const isValidPassword = await user.verifyPassword(currentPassword);
        if (!isValidPassword) {
          throw Boom.unauthorized('Current password is incorrect');
        }
      }
      
      await user.updatePassword(newPassword);
      
      logger.info('Password changed', {
        userId: id,
        changedBy: authUser.id
      });
      
      return h.response({
        message: 'Password changed successfully'
      }).code(200);
      
    } catch (error) {
      logger.error('Change password failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Failed to change password');
    }
  }
};

module.exports = userController; 