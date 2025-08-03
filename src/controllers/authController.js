const Boom = require('@hapi/boom')
const authService = require('../services/authService')
const logger = require('../utils/logger')

const authController = {
  // Validate JWT token using secret key
  validateToken: async (request, h) => {
    try {
      const token = request.query.token || request.payload?.token

      if (!token) {
        throw Boom.badRequest('Token is required')
      }

      const validationResult = authService.validateToken(token)

      if (!validationResult) {
        logger.warn('Invalid token validation attempt', { token: `${token.substring(0, 10)}...` })
        throw Boom.unauthorized('Invalid token')
      }

      // Process validation result with platform-compatible structure
      const tokenInfo = {
        ...validationResult,
        token,
        isValid: true
      }

      logger.info('JWT token validated successfully', {
        sub: tokenInfo.sub || tokenInfo.userId,
        hasExpiry: !!tokenInfo.exp
      })

      return h.response({
        message: 'Token is valid',
        data: {
          sub: tokenInfo.sub || tokenInfo.userId,
          name: tokenInfo.name || 'Unknown User',
          kampus: tokenInfo.kampus || '',
          fakultas: tokenInfo.fakultas || '',
          prodi: tokenInfo.prodi || '',
          admin: tokenInfo.admin || false,
          isValid: tokenInfo.isValid,
          ...(tokenInfo.exp && { expiresAt: new Date(tokenInfo.exp * 1000).toISOString() }),
          ...(tokenInfo.iat && { issuedAt: new Date(tokenInfo.iat * 1000).toISOString() })
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

      // Default payload structure matching external platform
      const tokenPayload = {
        sub: 'test-user',
        name: 'Test User',
        kampus: '',
        fakultas: '',
        prodi: '',
        admin: false,
        ...payload
      }

      const token = authService.generateJwtToken(tokenPayload)

      logger.info('JWT token generated successfully', {
        sub: tokenPayload.sub,
        name: tokenPayload.name,
        admin: tokenPayload.admin
      })

      return h.response({
        message: 'JWT token generated successfully',
        token,
        payload: tokenPayload,
        expiresIn: '30 days'
      }).code(201)
    } catch (error) {
      logger.error('Token generation failed:', error.message)
      throw Boom.badImplementation('Token generation failed')
    }
  },

  loginAdmin: async (request, h) => {
    try {
      const { username, password } = request.payload  

      const loginResult = await authService.loginAdmin(username, password)

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
