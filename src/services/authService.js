const jwt = require('jsonwebtoken');
const config = require('../../config');
const User = require('../models/User');

const authService = {
  // Generate access and refresh tokens
  generateTokens: async (user) => {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: config.jwt.expiresIn
    };
  },

  // Verify access token
  verifyAccessToken: async (token) => {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  },

  // Verify refresh token
  verifyRefreshToken: async (token) => {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  },

  // Get user from token (for auth middleware)
  getUserFromToken: async (token) => {
    try {
      const decoded = await authService.verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token or user not found');
    }
  }
};

module.exports = authService; 