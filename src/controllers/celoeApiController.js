const Boom = require('@hapi/boom')
const celoeApiGatewayService = require('../services/celoeapiGatewayService')
const logger = require('../utils/logger')

const celoeApiController = {
  // ===== SAS (Student Activity Summary) ETL Controllers =====

  // Run SAS ETL Pipeline
  runSASETL: async (request, h) => {
    try {
      const { start_date, end_date, concurrency } = request.payload || {}
      logger.info('Run SAS ETL process requested', { start_date, end_date, concurrency })
      
      const result = await celoeApiGatewayService.runSASETL(start_date, end_date, concurrency)
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Run SAS ETL process failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to run SAS ETL process on external API')
    }
  },

  // Clean SAS ETL Data
  cleanSASETL: async (request, h) => {
    try {
      logger.info('Clean SAS ETL data requested')
      
      const result = await celoeApiGatewayService.cleanSASETL()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Clean SAS ETL data failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to clean SAS ETL data on external API')
    }
  },

  // Get SAS ETL Logs
  getSASETLLogs: async (request, h) => {
    try {
      const { limit, offset, status } = request.query
      logger.info('Get SAS ETL logs requested', { limit, offset, status })
      
      const result = await celoeApiGatewayService.getSASETLLogs(limit, offset, status)
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Get SAS ETL logs failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get SAS ETL logs from external API')
    }
  },

  // Get SAS ETL Status
  getSASETLStatus: async (request, h) => {
    try {
      logger.info('Get SAS ETL status requested')
      
      const result = await celoeApiGatewayService.getSASETLStatus()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Get SAS ETL status failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get SAS ETL status from external API')
    }
  },

  // Export SAS ETL Data
  exportSASETLData: async (request, h) => {
    try {
      const { limit, offset, date, course_id } = request.query
      logger.info('Export SAS ETL data requested', { limit, offset, date, course_id })
      
      const result = await celoeApiGatewayService.exportSASETLData(limit, offset, date, course_id)
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Export SAS ETL data failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to export SAS ETL data from external API')
    }
  },

  // ===== CP (Course Performance) ETL Controllers =====

  // Run CP ETL Pipeline
  runCPETL: async (request, h) => {
    try {
      const { start_date, end_date, concurrency } = request.payload || {}
      logger.info('Run CP ETL process requested', { start_date, end_date, concurrency })
      
      const result = await celoeApiGatewayService.runCPETL(start_date, end_date, concurrency)
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Run CP ETL process failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to run CP ETL process on external API')
    }
  },

  // Clean CP ETL Data
  cleanCPETL: async (request, h) => {
    try {
      logger.info('Clean CP ETL data requested')
      
      const result = await celoeApiGatewayService.cleanCPETL()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Clean CP ETL data failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to clean CP ETL data on external API')
    }
  },

  // Get CP ETL Logs
  getCPETLLogs: async (request, h) => {
    try {
      const { limit, offset, status } = request.query
      logger.info('Get CP ETL logs requested', { limit, offset, status })
      
      const result = await celoeApiGatewayService.getCPETLLogs(limit, offset, status)
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Get CP ETL logs failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get CP ETL logs from external API')
    }
  },

  // Get CP ETL Status
  getCPETLStatus: async (request, h) => {
    try {
      logger.info('Get CP ETL status requested')
      
      const result = await celoeApiGatewayService.getCPETLStatus()
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Get CP ETL status failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get CP ETL status from external API')
    }
  },

  // Export CP ETL Data
  exportCPETLData: async (request, h) => {
    try {
      const { limit, offset, table, tables, debug } = request.query
      logger.info('Export CP ETL data requested', { limit, offset, table, tables, debug })
      
      const result = await celoeApiGatewayService.exportCPETLData(limit, offset, table, tables, debug)
      
      return h.response(result).code(200)
    } catch (error) {
      logger.error('Export CP ETL data failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to export CP ETL data from external API')
    }
  }
}

module.exports = celoeApiController 