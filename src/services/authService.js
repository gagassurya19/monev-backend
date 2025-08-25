const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../../config')
const logger = require('../utils/logger')
const database = require('../database/connection')

const authService = {
  // Login user
  login: async (username, password) => {
    try {
      // Find user by username
      const userRows = await database.query(
        'SELECT * FROM monev_users WHERE username = ?',
        [username]
      )

      if (!userRows || userRows.length === 0) {
        throw new Error('User not found')
      }

      const user = userRows[0]

      // Check if password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new Error('Invalid password')
      }

      // Check if user is active
      if (user.admin !== 1) {
        throw new Error('User account is not active')
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          sub: user.sub,
          name: user.name,
          kampus: user.kampus,
          fakultas: user.fakultas,
          prodi: user.prodi,
          admin: user.admin
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      )

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          kampus: user.kampus,
          fakultas: user.fakultas,
          prodi: user.prodi,
          admin: user.admin
        }
      }
    } catch (error) {
      logger.error('Login failed:', error.message)
      throw error
    }
  },

  // Verify JWT token
  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, config.jwt.secret)

      if (!decoded) {
        throw new Error('User not found')
      }

      return {
        success: true,
        user: decoded
      }
    } catch (error) {
      logger.error('Token verification failed:', error.message)
      throw error
    }
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const userRows = await database.query(
        'SELECT id, username, name, kampus, fakultas, prodi, admin, created_at FROM monev_users WHERE id = ?',
        [userId]
      )

      if (!userRows || userRows.length === 0) {
        throw new Error('User not found')
      }

      return {
        success: true,
        user: userRows[0]
      }
    } catch (error) {
      logger.error('Get user profile failed:', error.message)
      throw error
    }
  },

  // Change password
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      // Get current user
      const userRows = await database.query(
        'SELECT * FROM monev_users WHERE id = ?',
        [userId]
      )

      if (!userRows || userRows.length === 0) {
        throw new Error('User not found')
      }

      const user = userRows[0]

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, config.security.saltRounds)

      // Update password
      await database.query(
        'UPDATE monev_users SET password = ? WHERE id = ?',
        [hashedNewPassword, userId]
      )

      return {
        success: true,
        message: 'Password changed successfully'
      }
    } catch (error) {
      logger.error('Change password failed:', error.message)
      throw error
    }
  },

  // Admin login
  loginAdmin: async (username, password) => {
    try {
      // Find user by username
      const userRows = await database.query(
        'SELECT * FROM monev_users WHERE username = ?',
        [username]
      )

      if (!userRows || userRows.length === 0) {
        throw new Error('User not found')
      }

      const user = userRows[0]

      // Check if password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new Error('Invalid password')
      }

      // Check if user is admin (admin field is tinyint(1) - 0 or 1)
      if (user.admin !== 1) {
        throw new Error('User is not an admin')
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          sub: user.username,
          name: user.name,
          kampus: user.kampus,
          fakultas: user.fakultas,
          prodi: user.prodi,
          admin: user.admin
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      )

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          kampus: user.kampus,
          fakultas: user.fakultas,
          prodi: user.prodi,
          admin: user.admin
        }
      }
    } catch (error) {
      logger.error('Admin login failed:', error.message)
      throw error
    }
  },

  // Generate JWT token with custom payload
  generateJwtToken: async (payload) => {
    try {
      const { id, username, name, expirationMinutes, userRole, kampus, fakultas, prodi } = payload;

      // Validate required fields
      if (!id || !username || !name || !expirationMinutes || !userRole) {
        throw new Error('Missing required fields: id, username, name, expirationMinutes, userRole');
      }

      // Validate expirationMinutes
      if (expirationMinutes <= 0 || expirationMinutes > 525600) { // Max 1 year
        throw new Error('expirationMinutes must be between 1 and 525600 (1 year)');
      }

      // Create token payload
      const now = Math.floor(Date.now() / 1000);
      const tokenPayload = {
        id: parseInt(id) || 1,
        username,
        sub: username,
        name,
        kampus: kampus || '',
        fakultas: fakultas || '',
        prodi: prodi || '',
        admin: userRole === 'admin' ? 1 : 0,
        exp: now + (expirationMinutes * 60),
        iat: now
      };

      // Generate JWT token
      const token = jwt.sign(tokenPayload, config.jwt.secret, { algorithm: 'HS256' });

      // Decode token to get info
      const decoded = jwt.decode(token);
      
      return {
        success: true,
        message: 'Token generated successfully',
        data: {
          token,
          tokenInfo: {
            header: {
              alg: 'HS256',
              typ: 'JWT'
            },
            payload: decoded,
            expiresIn: expirationMinutes * 60, // in seconds
            isExpired: false
          },
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Token generation failed:', error.message);
      throw error;
    }
  }
}

module.exports = authService
