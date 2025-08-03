const config = require('../../config')
const jwt = require('jsonwebtoken')
const database = require('../database/connection')
const bcrypt = require('bcrypt')

const authService = {
  // Generate a JWT token
  generateToken: (payload, expiresIn = null) => {
    const options = {}
    if (expiresIn) {
      options.expiresIn = expiresIn
    } else {
      options.expiresIn = config.jwt.expiresIn
    }

    return jwt.sign(payload, config.jwt.secret, options)
  },

  // Validate JWT token using secret key from environment
  validateToken: (token) => {
    if (!token) {
      return false
    }

    try {
      // First try to verify with our secret key
      const decoded = jwt.verify(token, config.jwt.secret)
      return decoded
    } catch (error) {
      // If verification fails, try to validate as external token
      return authService.validateExternalToken(token)
    }
  },

  // Validate external JWT token without signature verification
  validateExternalToken: (token) => {
    if (!token) {
      return false
    }

    try {
      // Decode token without signature verification
      const decoded = jwt.decode(token, { complete: false })

      if (!decoded) {
        return false
      }

      // Validate token structure - ensure required fields exist
      if (!decoded.sub) {
        return false
      }

      // Check if token is expired
      if (decoded.exp && Math.floor(Date.now() / 1000) >= decoded.exp) {
        return false
      }

      // Return the decoded payload
      return decoded
    } catch (error) {
      return false
    }
  },

  // Verify and decode JWT token
  verifyJwtToken: (token) => {
    try {
      // First try to verify with our secret key
      return jwt.verify(token, config.jwt.secret)
    } catch (error) {
      // If verification fails, try to validate as external token
      const externalValidation = authService.validateExternalToken(token)
      if (externalValidation) {
        return externalValidation
      }
      throw new Error(`JWT verification failed: ${error.message}`)
    }
  },

  // Generate a JWT token with platform-compatible payload structure
  generateJwtToken: (payload = {}) => {
    // Default payload structure matching external platform
    const defaultPayload = {
      sub: 'default-user',
      name: 'Default User',
      kampus: '',
      fakultas: '',
      prodi: '',
      admin: false
    }

    // Merge with provided payload
    const finalPayload = {
      ...defaultPayload,
      ...payload
    }

    return authService.generateToken(finalPayload, '30d') // 30 days expiration
  },

  loginAdmin: async (username, password) => {
    const user = await database.query(`
      SELECT * FROM moodle_logs.user ua
      WHERE ua.username = ?
      `, [username])

    if (user.length === 0) {
      return false
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user[0].password)
    
    if (!isPasswordValid) {
      return false
    }

    const token = authService.generateJwtToken({
      sub: user[0].username,
      name: user[0].username,
      admin: true
    })

    return {
      token,
    }
  }
}

module.exports = authService
