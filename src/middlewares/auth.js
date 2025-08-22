const authService = require('../services/authService')
const Boom = require('@hapi/boom')

const jwtAuth = {
  name: 'jwt',
  scheme: 'jwt-token',

  implementation: (server, options) => {
    return {
      authenticate: async (request, h) => {
        let token = null

        // Check for token in Authorization header first
        if (request.headers.authorization) {
          const authorization = request.headers.authorization
          token = authorization.replace(/Bearer\s+/i, '')
        }
        // Fallback to query parameter
        else if (request.query && request.query.token) {
          token = request.query.token
        }

        if (!token) {
          throw Boom.unauthorized('JWT token missing')
        }

        try {
          // Validate JWT token using authService
          const validationResult = await authService.verifyToken(token)

          if (!validationResult || !validationResult.success) {
            throw Boom.unauthorized('Invalid JWT token')
          }

          const user = validationResult.user

          // Return user credentials with platform-compatible structure
          return h.authenticated({
            credentials: {
              sub: user.sub || user.username,
              name: user.name || 'Unknown User',
              kampus: user.kampus || '',
              fakultas: user.fakultas || '',
              prodi: user.prodi || '',
              admin: user.admin || false,
              token,
              isValid: true,
              exp: user.exp,
              iat: user.iat
            },
            artifacts: { token }
          })
        } catch (error) {
          if (error.isBoom) {
            throw error
          }
          throw Boom.unauthorized('Invalid JWT token')
        }
      }
    }
  }
}

module.exports = jwtAuth
