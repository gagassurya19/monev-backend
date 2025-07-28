const mysql = require('mysql2/promise')
const config = require('../../config')
const logger = require('../utils/logger')

const coursePerformanceService = {
  getCoursePerformance: async (conn) => {
    try {
      const [result] = await conn.query(`
        SELECT * FROM course_performance
      `)
      return result
    } catch (error) {
      logger.error('Error', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      })
      throw error
    }
  },
}

module.exports = coursePerformanceService
