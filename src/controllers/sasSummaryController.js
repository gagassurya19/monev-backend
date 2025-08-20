const Boom = require('@hapi/boom')
const sasSummaryService = require('../services/sasSummaryService')
const logger = require('../utils/logger')

const sasSummaryController = {
  getChart: async (request, h) => {
    try {
      const result = await sasSummaryService.getChartAggregation(request.query)
      return h.response(result).code(200)
    } catch (error) {
      logger.error('sasSummaryController.getChart failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to fetch chart aggregation')
    }
  },

  getStats: async (request, h) => {
    try {
      const result = await sasSummaryService.getStatsOverview(request.query)
      return h.response(result).code(200)
    } catch (error) {
      logger.error('sasSummaryController.getStats failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to fetch stats overview')
    }
  },

  getTable: async (request, h) => {
    try {
      const result = await sasSummaryService.getSummaryTable(request.query)
      return h.response(result).code(200)
    } catch (error) {
      logger.error('sasSummaryController.getTable failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to fetch summary table')
    }
  }
}

module.exports = sasSummaryController


