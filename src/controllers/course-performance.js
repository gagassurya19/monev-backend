const Boom = require('@hapi/boom')
const coursePerformanceService = require('../services/course-performance')
const logger = require('../utils/logger')

const coursePerformanceController = {
  // Get course
  getCourse: async (request, h) => {
    try {
      logger.info('Get course performance requested', {
        webhookToken: request.auth.credentials.token
      })

      const result = await coursePerformanceService.getCoursePerformance()

      return h.response({
        message: 'Course performance retrieved successfully',
        result
      }).code(200)
    } catch (error) {
      logger.error('Get course performance failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Get course performance failed')
    }
  },
  
}

module.exports = coursePerformanceController
