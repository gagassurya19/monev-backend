const Boom = require('@hapi/boom')
const etlStudentActivitySummaryService = require('../services/etlStudentActivitySummaryService')
const logger = require('../utils/logger')

const etlStudentActivitySummaryController = {
  // Manually trigger SAS ETL process
  triggerETL: async (request, h) => {
    try {
      const { start_date, concurrency = 4 } = request.payload || {}
      
      logger.info('Manual SAS ETL trigger requested', {
        webhookToken: request.auth.credentials.token,
        start_date,
        concurrency
      })

      const result = await etlStudentActivitySummaryService.runETL(start_date, concurrency)

      return h.response({
        message: 'SAS ETL process completed successfully',
        result,
        parameters: {
          start_date,
          concurrency
        }
      }).code(200)
    } catch (error) {
      logger.error('Manual SAS ETL trigger failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('SAS ETL process failed')
    }
  },

  // Clean local SAS ETL data
  cleanLocalData: async (request, h) => {
    try {
      logger.info('Manual SAS ETL data cleanup requested', {
        webhookToken: request.auth.credentials.token
      })

      const result = await etlStudentActivitySummaryService.cleanLocalData()

      return h.response({
        message: 'SAS ETL data cleanup completed successfully',
        result
      }).code(200)
    } catch (error) {
      logger.error('Manual SAS ETL data cleanup failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('SAS ETL data cleanup failed')
    }
  },

  // Get SAS ETL status
  getETLStatus: async (request, h) => {
    try {
      const status = await etlStudentActivitySummaryService.getETLStatus()

      return h.response({
        status
      }).code(200)
    } catch (error) {
      logger.error('Get SAS ETL status failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get SAS ETL status')
    }
  },

  getETLHistory: async (request, h) => {
    try {
      logger.info('Get SAS ETL log history')

      const { limit, offset, type_run = 'fetch_student_activity_summary' } = request.query;
      const result = await etlStudentActivitySummaryService.getETLHistory(limit, offset, type_run)

      return h.response({
        status: true,
        message: "Get SAS ETL history completed successfully",
        data: result,
      }).code(200)
    } catch (error) {
      logger.error("Get SAS ETL history failed:", error.message)
      return h.response({
        status: false,
        message: "Failed to get SAS ETL logs history",
        error: error.message
      })
    }
  },

  // Test SAS API connection
  testAPIConnection: async (request, h) => {
    try {
      logger.info('Testing SAS API connection requested')

      const result = await etlStudentActivitySummaryService.testAPIConnection()

      return h.response({
        status: true,
        message: result.success ? 'SAS API connection test successful' : 'SAS API connection test failed',
        data: result
      }).code(result.success ? 200 : 500)
    } catch (error) {
      logger.error('SAS API connection test failed:', error.message)
      return h.response({
        status: false,
        message: 'SAS API connection test failed',
        error: error.message
      }).code(500)
    }
  }
}

module.exports = etlStudentActivitySummaryController

