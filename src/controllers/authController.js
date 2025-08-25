const Boom = require('@hapi/boom')
const { AuthService } = require('../services')
const logger = require('../utils/logger')

const authController = {
  // Validate JWT token using secret key
  validateToken: async (request, h) => {
    try {
      const token = request.query.token || request.payload?.token

      if (!token) {
        throw Boom.badRequest('Token is required')
      }

      // Use the existing verifyToken method from authService
      const validationResult = await AuthService.verifyToken(token)

      if (!validationResult || !validationResult.success) {
        logger.warn('Invalid token validation attempt', { token: `${token.substring(0, 10)}...` })
        throw Boom.unauthorized('Invalid token')
      }

      const user = validationResult.user

      logger.info('JWT token validated successfully', {
        sub: user.sub || user.username,
        hasExpiry: !!user.exp
      })

      return h.response({
        message: 'Token is valid',
        data: {
          id: user.id,
          username: user.username,
          sub: user.sub || user.username,
          name: user.name || 'Unknown User',
          kampus: user.kampus || '',
          fakultas: user.fakultas || '',
          prodi: user.prodi || '',
          admin: user.admin || false,
          isValid: true,
          ...(user.exp && { expiresAt: new Date(user.exp * 1000).toISOString() }),
          ...(user.iat && { issuedAt: new Date(user.iat * 1000).toISOString() })
        }
      }).code(200)
    } catch (error) {
      logger.error('Token validation failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Token validation failed')
    }
  },

  // Generate a new JWT token with platform-compatible structure
  generateToken: async (request, h) => {
    try {
      const payload = request.payload || {}

      // Validate required fields
      if (!payload.id || !payload.username || !payload.name || !payload.expirationMinutes || !payload.userRole) {
        throw Boom.badRequest('Missing required fields: id, username, name, expirationMinutes, userRole')
      }

      const result = await AuthService.generateJwtToken(payload)

      logger.info('JWT token generated successfully', {
        id: payload.id,
        username: payload.username,
        name: payload.name,
        userRole: payload.userRole
      })

      return h.response(result).code(200)
    } catch (error) {
      logger.error('Token generation failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Token generation failed')
    }
  },

  loginAdmin: async (request, h) => {
    try {
      const { username, password } = request.payload  

      const loginResult = await AuthService.loginAdmin(username, password)

      if (!loginResult) {
        throw Boom.unauthorized('Invalid username or password')
      }

      return h.response({
        status: true,
        message: 'Admin login successful',
        ...loginResult
      }).code(200)
    } catch (error) {
      logger.error('Admin login failed:', error.message)
      // If it's already a Boom error, re-throw it
      if (error.isBoom) {
        throw error
      }
      throw Boom.badImplementation('Admin login failed')
    }
  }
}

module.exports = authController
