const Boom = require('@hapi/boom');
const Log = require('../models/Log');
const logger = require('../utils/logger');

const logController = {
  createLog: async (request, h) => {
    try {
      const logData = {
        ...request.payload,
        userId: request.auth.credentials.id
      };
      
      const log = await Log.create(logData);
      
      logger.info('Log entry created', {
        logId: log.id,
        level: log.level,
        source: log.source,
        userId: log.userId
      });
      
      return h.response({
        message: 'Log entry created successfully',
        log
      }).code(201);
      
    } catch (error) {
      logger.error('Create log failed:', error.message);
      throw Boom.badImplementation('Failed to create log entry');
    }
  },

  getAllLogs: async (request, h) => {
    try {
      const options = request.query;
      const result = await Log.findAll(options);
      
      return h.response({
        message: 'Logs retrieved successfully',
        data: result.logs,
        pagination: result.pagination
      }).code(200);
      
    } catch (error) {
      logger.error('Get logs failed:', error.message);
      throw Boom.badImplementation('Failed to retrieve logs');
    }
  },

  getLogById: async (request, h) => {
    try {
      const { id } = request.params;
      const log = await Log.findById(id);
      
      if (!log) {
        throw Boom.notFound('Log entry not found');
      }
      
      return h.response({
        message: 'Log retrieved successfully',
        log
      }).code(200);
      
    } catch (error) {
      logger.error('Get log by ID failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Failed to retrieve log');
    }
  },

  updateLog: async (request, h) => {
    try {
      const { id } = request.params;
      const updateData = request.payload;
      
      const log = await Log.findById(id);
      if (!log) {
        throw Boom.notFound('Log entry not found');
      }
      
      const updatedLog = await Log.updateById(id, updateData);
      
      logger.info('Log entry updated', {
        logId: id,
        userId: request.auth.credentials.id
      });
      
      return h.response({
        message: 'Log entry updated successfully',
        log: updatedLog
      }).code(200);
      
    } catch (error) {
      logger.error('Update log failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Failed to update log entry');
    }
  },

  deleteLog: async (request, h) => {
    try {
      const { id } = request.params;
      
      const log = await Log.findById(id);
      if (!log) {
        throw Boom.notFound('Log entry not found');
      }
      
      const deleted = await Log.deleteById(id);
      if (!deleted) {
        throw Boom.badImplementation('Failed to delete log entry');
      }
      
      logger.info('Log entry deleted', {
        logId: id,
        userId: request.auth.credentials.id
      });
      
      return h.response({
        message: 'Log entry deleted successfully'
      }).code(200);
      
    } catch (error) {
      logger.error('Delete log failed:', error.message);
      if (error.isBoom) throw error;
      throw Boom.badImplementation('Failed to delete log entry');
    }
  },

  searchLogs: async (request, h) => {
    try {
      const searchOptions = request.query;
      const result = await Log.search(searchOptions);
      
      return h.response({
        message: 'Search completed successfully',
        data: result.logs,
        pagination: result.pagination,
        searchQuery: searchOptions.q
      }).code(200);
      
    } catch (error) {
      logger.error('Search logs failed:', error.message);
      throw Boom.badImplementation('Failed to search logs');
    }
  },

  getLogStats: async (request, h) => {
    try {
      const options = request.query;
      const stats = await Log.getStats(options);
      
      return h.response({
        message: 'Statistics retrieved successfully',
        stats
      }).code(200);
      
    } catch (error) {
      logger.error('Get log stats failed:', error.message);
      throw Boom.badImplementation('Failed to retrieve statistics');
    }
  }
};

module.exports = logController; 