const Boom = require('@hapi/boom');
const User = require('../models/User');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const authController = {
  register: async (request, h) => {
    try {
      const { email, password, firstName, lastName, role } = request.payload;
      
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw Boom.conflict('Email already registered');
      }
      
      const user = await User.create({
        email, password, firstName, lastName, role
      });
      
      const tokens = await authService.generateTokens(user);
      
      logger.info('User registered successfully', {
        userId: user.id, email: user.email
      });
      
      return h.response({
        message: 'User registered successfully',
        user: user.toJSON(),
        tokens
      }).code(201);
      
    } catch (error) {
      logger.error('Registration failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Registration failed');
    }
  },

  login: async (request, h) => {
    try {
      const { email, password } = request.payload;
      
      const user = await User.findByEmail(email);
      if (!user) {
        throw Boom.unauthorized('Invalid email or password');
      }
      
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        throw Boom.unauthorized('Invalid email or password');
      }
      
      const tokens = await authService.generateTokens(user);
      
      logger.info('User logged in successfully', {
        userId: user.id, email: user.email
      });
      
      return h.response({
        message: 'Login successful',
        user: user.toJSON(),
        tokens
      }).code(200);
      
    } catch (error) {
      logger.error('Login failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Login failed');
    }
  },

  refreshToken: async (request, h) => {
    try {
      const { refreshToken } = request.payload;
      
      const decoded = await authService.verifyRefreshToken(refreshToken);
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw Boom.unauthorized('Invalid refresh token');
      }
      
      const tokens = await authService.generateTokens(user);
      
      return h.response({
        message: 'Token refreshed successfully',
        tokens
      }).code(200);
      
    } catch (error) {
      logger.error('Token refresh failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.unauthorized('Invalid refresh token');
    }
  },

  logout: async (request, h) => {
    try {
      const user = request.auth.credentials;
      
      logger.info('User logged out', {
        userId: user.id, email: user.email
      });
      
      return h.response({
        message: 'Logout successful'
      }).code(200);
      
    } catch (error) {
      logger.error('Logout failed:', error.message);
      throw Boom.badImplementation('Logout failed');
    }
  },

  getCurrentUser: async (request, h) => {
    try {
      const user = request.auth.credentials;
      
      return h.response({
        user: user.toJSON()
      }).code(200);
      
    } catch (error) {
      logger.error('Get current user failed:', error.message);
      throw Boom.badImplementation('Failed to get user information');
    }
  }
};

module.exports = authController; 