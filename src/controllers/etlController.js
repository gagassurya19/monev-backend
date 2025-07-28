const Boom = require('@hapi/boom')
const etlService = require('../services/etlService')
const logger = require('../utils/logger')
const database = require('../database/connection')

const etlController = {
  // Manually trigger ETL process
  triggerETL: async (request, h) => {
    try {
      logger.info('Manual ETL trigger requested', {
        webhookToken: request.auth.credentials.token
      })

      const result = await etlService.runETL()

      return h.response({
        message: 'ETL process completed successfully',
        result
      }).code(200)
    } catch (error) {
      logger.error('Manual ETL trigger failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('ETL process failed')
    }
  },

  // Get ETL status
  getETLStatus: async (request, h) => {
    try {
      const status = await etlService.getETLStatus()

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
      const result = await etlService.getETLHistory(limit, offset)

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
  }
}

module.exports = etlController
