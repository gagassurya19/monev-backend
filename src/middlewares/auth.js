const authService = require('../services/authService')
const Boom = require('@hapi/boom')

const jwtAuth = {
  name: 'jwt',
  scheme: 'jwt-token',

  implementation: (server, options) => {
    return {
      authenticate: (request, h) => {
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

        // Validate JWT token using secret key
        const validationResult = authService.validateToken(token)

        if (!validationResult) {
          throw Boom.unauthorized('Invalid JWT token')
        }

        // Return user credentials with platform-compatible structure
        return h.authenticated({
          credentials: {
            sub: validationResult.sub || validationResult.userId,
            name: validationResult.name || 'Unknown User',
            kampus: validationResult.kampus || '',
            fakultas: validationResult.fakultas || '',
            prodi: validationResult.prodi || '',
            admin: validationResult.admin || false,
            token,
            isValid: true,
            exp: validationResult.exp,
            iat: validationResult.iat
          },
          artifacts: { token }
        })
      }
    }
  }
}

module.exports = jwtAuth
