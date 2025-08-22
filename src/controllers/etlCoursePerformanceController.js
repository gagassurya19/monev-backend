const Boom = require('@hapi/boom')
const { EtlCoursePerformanceService } = require('../services')
const logger = require('../utils/logger')
const database = require('../database/connection')

const etlCoursePerformanceController = {
  // Manually trigger ETL process
  triggerETL: async (request, h) => {
    try {
      const { start_date, concurrency = 4 } = request.payload || {}
      
      logger.info('Manual ETL trigger requested', {
        webhookToken: request.auth.credentials.token,
        start_date,
        concurrency
      })

      const result = await EtlCoursePerformanceService.runETL(start_date, concurrency)

      return h.response({
        message: 'ETL process completed successfully',
        result,
        parameters: {
          start_date,
          concurrency
        }
      }).code(200)
    } catch (error) {
      logger.error('Manual ETL trigger failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('ETL process failed')
    }
  },

  // Clean local CP ETL data
  cleanLocalData: async (request, h) => {
    try {
      logger.info('Manual CP ETL data cleanup requested', {
        webhookToken: request.auth.credentials.token
      })

      const result = await EtlCoursePerformanceService.cleanLocalData()

      return h.response({
        message: 'CP ETL data cleanup completed successfully',
        result
      }).code(200)
    } catch (error) {
      logger.error('Manual CP ETL data cleanup failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('CP ETL data cleanup failed')
    }
  },

  // Get ETL status
  getETLStatus: async (request, h) => {
    try {
      const status = await EtlCoursePerformanceService.getETLStatus()

      return h.response({
        status
      }).code(200)
    } catch (error) {
      logger.error('Get ETL status failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get ETL status')
    }
  },

  getETLHistory: async (request, h) => {
    try {
      logger.info('Get log history')

      const { limit, offset } = request.query;
      const result = await EtlCoursePerformanceService.getETLHistory(limit, offset)

      return h.response({
        status: true,
        message: "Get ETL history completed successfully",
        data: result,
      }).code(200)
    } catch (error) {
      logger.error("Get ETL history failed:", error.message)
      return h.response({
        status: false,
        message: "Failed to get ETL logs history",
        error: error.message
      })
    }
  },

  // Test API connection
  testAPIConnection: async (request, h) => {
    try {
      logger.info('Testing API connection requested')

      const result = await EtlCoursePerformanceService.testAPIConnection()

      return h.response({
        status: true,
        message: result.success ? 'API connection test successful' : 'API connection test failed',
        data: result
      }).code(result.success ? 200 : 500)
    } catch (error) {
      logger.error('API connection test failed:', error.message)
      return h.response({
        status: false,
        message: 'API connection test failed',
        error: error.message
      }).code(500)
    }
  }
}

module.exports = etlCoursePerformanceController
