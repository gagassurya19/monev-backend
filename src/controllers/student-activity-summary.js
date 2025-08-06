const { StudentActivitySummaryService } = require('../services')
const logger = require('../utils/logger');

const studentActivitySummaryController = {
  getFakultas: async (request, h) => {
    try {
      const decodedToken = request.auth.credentials;
      const { search } = request.query;
      const data = await StudentActivitySummaryService.getFakultas(decodedToken, search, request.query.page, request.query.limit);

      return h.response({
        status: true,
        dataUser: decodedToken,
        ...data,
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
      const decodedToken = request.auth.credentials;
      const { fakultas, kampus, search } = request.query;
      const data = await StudentActivitySummaryService.getProdiByFakultas(decodedToken, fakultas, kampus, search, request.query.page, request.query.limit);

      return h.response({
        status: true,
        dataUser: decodedToken,
        ...data,
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
      const decodedToken = request.auth.credentials;
      const { prodi, search } = request.query;
      const data = await StudentActivitySummaryService.getMatkulByProdi(decodedToken, prodi, search, request.query.page, request.query.limit);

      return h.response({
        status: true,
        dataUser: decodedToken,
        ...data,
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

  // ETL

  getStatusETLLastRun: async (request, h) => {
    try {
        return await StudentActivitySummaryService.getStatusLastETLRun(request, h);
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
        const data = await StudentActivitySummaryService.getHistoryETLRun(limit, offset)
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