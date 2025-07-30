const Boom = require('@hapi/boom')
const studentActivitySummaryService = require('../services/student-activity-summary')
const logger = require('../utils/logger');
const authService = require('../services/authService');

const studentActivitySummaryController = {
  getFakultas: async (request, h) => {
    try {
      const { token } = request.query;

      if (!token) {
        return h.response({
          status: false,
          message: 'Token is required'
        }).code(400);
      }

      const decodedToken = authService.validateToken(token);

      const data = await studentActivitySummaryService.getFakultas();

      return h.response({
        status: true,
        dataUser: decodedToken,
        data,
      });
    } catch (err) {
      logger.error('Failed to get fakultas:', err.message);
      return h.response({
        status: false,
        message: 'Failed to get fakultas',
        error: err.message
      }).code(500);
    }
  },
  getProdiByFakultas: async (request, h) => {
    try {
      const { token, fakultas, kampus } = request.query;

      if (!token) {
        return h.response({
          status: false,
          message: 'Token is required'
        }).code(400);
      }

      const decodedToken = authService.validateToken(token);

      const data = await studentActivitySummaryService.getProdiByFakultas(decodedToken, fakultas, kampus);

      return h.response({
        status: true,
        dataUser: decodedToken,
        data,
      });
    } catch (err) {
      logger.error('Failed to get prodi by id_fakultas & kampus:', err.message);
      return h.response({
        status: false,
        message: 'Failed to get prodi by id_fakultas & kampus',
        error: err.message
      }).code(500);
    }
  },
  getMatkulByProdi: async (request, h) => {
    try {
      const { token, prodi } = request.query;

      if (!token) {
        return h.response({
          status: false,
          message: 'Token is required'
        }).code(400);
      }

      const decodedToken = authService.validateToken(token);

      const data = await studentActivitySummaryService.getMatkulByProdi(decodedToken, prodi);

      return h.response({
        status: true,
        dataUser: decodedToken,
        data,
      });
    } catch (err) {
      logger.error('Failed to get matakuliah with id_prodi:', err.message);
      return h.response({
        status: false,
        message: 'Failed to get matakuliah with id_prodi',
        error: err.message
      }).code(500);
    }
  },
  getStatusETLLastRun: async (request, h) => {
    try {
        return await studentActivitySummaryService.getStatusLastETLRun(request, h);
    } catch(error) {
        logger.error('Failed to get status last etl-chart:', err.message);
        return h.response({
            status: false,
            message: 'Failed to get status last etl-chart',
            error: err.message
        }).code(500);
    }
  },
  getHistoryETLRun: async (request, h) => {
    const { limit, offset } = request.query
    try {
        const data = await studentActivitySummaryService.getHistoryETLRun(limit, offset)
        return h.response({
            status: true,
            data
        })
    } catch(error) {
        logger.error('Failed to get logs etl-chart history:', err.message);
        return h.response({
            status: false,
            message: 'Failed to get logs etl-chart history',
            error: err.message
        }).code(500);
    }
  } 
}

module.exports = studentActivitySummaryController