const Boom = require('@hapi/boom')
const celoeApiGatewayService = require('../services/celoeapiGatewayService')
const logger = require('../utils/logger')

const celoeApiController = {
  // Get ETL Status
  getETLStatus: async (request, h) => {
    try {
      logger.info('Get ETL status requested')
      
      const result = await celoeApiGatewayService.getETLStatus()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Get ETL status failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get ETL status from external API')
    }
  },

  // Get ETL Logs
  getETLLogs: async (request, h) => {
    try {
      const { limit, offset } = request.query
      logger.info('Get ETL logs requested', { limit, offset })
      
      const result = await celoeApiGatewayService.getETLLogs(limit, offset)
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Get ETL logs failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get ETL logs from external API')
    }
  },

  // Run ETL Process
  runETL: async (request, h) => {
    try {
      logger.info('Run ETL process requested')
      
      const result = await celoeApiGatewayService.runETL()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Run ETL process failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to run ETL process on external API')
    }
  },

  // Run Incremental ETL
  runIncrementalETL: async (request, h) => {
    try {
      logger.info('Run incremental ETL process requested')
      
      const result = await celoeApiGatewayService.runIncrementalETL()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Run incremental ETL process failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to run incremental ETL process on external API')
    }
  },

  // Clear Stuck ETL Processes
  clearStuckETL: async (request, h) => {
    try {
      logger.info('Clear stuck ETL processes requested')
      
      const result = await celoeApiGatewayService.clearStuckETL()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Clear stuck ETL processes failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to clear stuck ETL processes on external API')
    }
  },

  // Force Clear All Inprogress ETL
  forceClearETL: async (request, h) => {
    try {
      logger.info('Force clear ETL processes requested')
      
      const result = await celoeApiGatewayService.forceClearETL()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Force clear ETL processes failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to force clear ETL processes on external API')
    }
  },

  // Get Debug ETL Status
  getDebugETL: async (request, h) => {
    try {
      logger.info('Get debug ETL status requested')
      
      const result = await celoeApiGatewayService.getDebugETL()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Get debug ETL status failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get debug ETL status from external API')
    }
  }
}

module.exports = celoeApiController 