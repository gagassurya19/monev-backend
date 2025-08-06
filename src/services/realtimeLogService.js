const database = require('../database/connection')
const logger = require('../utils/logger')

class RealtimeLogService {
  constructor() {
    this.db = database
  }

  /**
   * Create a new realtime log entry
   * @param {number} logId - Parent ETL log ID
   * @param {string} level - Log level (info, warning, error, progress)
   * @param {string} message - Log message
   * @param {Object} additionalData - Additional data to store
   * @returns {Promise<Object>} Created realtime log entry
   */
  async createRealtimeLog(logId, level, message, additionalData = {}) {
    try {
      const {
        progress = null,
        data = null
      } = additionalData

      const query = `
        INSERT INTO monev_sas_realtime_logs 
        (log_id, level, message, progress, data, timestamp) 
        VALUES (?, ?, ?, ?, ?, ?)
      `
      
      const result = await this.db.query(query, [
        logId,
        level,
        message,
        progress,
        data ? JSON.stringify(data) : null,
        new Date()
      ])

      const realtimeLogId = result.insertId
      
      logger.info(`Created realtime log entry`, {
        realtimeLogId,
        logId,
        level,
        message: message.substring(0, 100) // Truncate for logging
      })

      return {
        id: realtimeLogId,
        log_id: logId,
        level,
        message,
        progress,
        data,
        timestamp: new Date()
      }
    } catch (error) {
      logger.error('Failed to create realtime log:', error.message)
      throw error
    }
  }

  /**
   * Get realtime logs for a specific ETL log
   * @param {number} logId - Parent ETL log ID
   * @param {number} limit - Number of records to return
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Object>} Realtime logs with pagination info
   */
  async getRealtimeLogs(logId, limit = 100, offset = 0) {
    try {
      // Convert parameters to integers
      const limitInt = parseInt(limit) || 100
      const offsetInt = parseInt(offset) || 0
      
      const query = `
        SELECT id, log_id, level, message, progress, data, timestamp
        FROM monev_sas_realtime_logs 
        WHERE log_id = ? 
        ORDER BY timestamp ASC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `
      
      const countQuery = `
        SELECT COUNT(*) as total FROM monev_sas_realtime_logs 
        WHERE log_id = ?
      `

      const logs = await this.db.query(query, [logId])
      const countResult = await this.db.query(countQuery, [logId])

      const total = countResult[0].total

      // Parse JSON data if present
      const parsedLogs = Array.isArray(logs) ? logs.map(log => ({
        ...log,
        data: log.data ? (typeof log.data === 'string' ? JSON.parse(log.data) : log.data) : null
      })) : []

      return {
        logs: parsedLogs,
        pagination: {
          total: parseInt(total),
          limit,
          offset,
          current_page: Math.floor(offset / limit) + 1,
          total_pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      logger.error('Failed to get realtime logs:', error.message)
      throw error
    }
  }

  /**
   * Get latest realtime logs for a specific ETL log (for streaming)
   * @param {number} logId - Parent ETL log ID
   * @param {number} limit - Number of latest records to return
   * @returns {Promise<Array>} Latest realtime logs
   */
  async getLatestRealtimeLogs(logId, limit = 50) {
    try {
      // Convert parameter to integer
      const limitInt = parseInt(limit) || 50
      
      const query = `
        SELECT id, log_id, level, message, progress, data, timestamp
        FROM monev_sas_realtime_logs 
        WHERE log_id = ? 
        ORDER BY timestamp DESC
        LIMIT ${limitInt}
      `
      
      const [logs] = await this.db.query(query, [logId])

      // Parse JSON data if present and reverse order for chronological display
      const parsedLogs = Array.isArray(logs) ? logs.reverse().map(log => ({
        ...log,
        data: log.data ? (typeof log.data === 'string' ? JSON.parse(log.data) : log.data) : null
      })) : []

      return parsedLogs
    } catch (error) {
      logger.error('Failed to get latest realtime logs:', error.message)
      throw error
    }
  }

  /**
   * Check if realtime logs exist for a specific ETL log
   * @param {number} logId - Parent ETL log ID
   * @returns {Promise<boolean>} True if logs exist
   */
  async hasRealtimeLogs(logId) {
    try {
      const query = `
        SELECT COUNT(*) as count FROM monev_sas_realtime_logs 
        WHERE log_id = ?
      `
      
      const result = await this.db.query(query, [logId])
      return result[0].count > 0
    } catch (error) {
      logger.error('Failed to check realtime logs existence:', error.message)
      throw error
    }
  }

  /**
   * Create progress log entry
   * @param {number} logId - Parent ETL log ID
   * @param {number} current - Current progress count
   * @param {number} total - Total count
   * @param {string} message - Progress message
   * @returns {Promise<Object>} Created progress log entry
   */
  async createProgressLog(logId, current, total, message) {
    const progress = total > 0 ? Math.round((current / total) * 100) : 0
    return await this.createRealtimeLog(logId, 'progress', message, {
      progress,
      data: { current, total, percentage: progress }
    })
  }

  /**
   * Create info log entry
   * @param {number} logId - Parent ETL log ID
   * @param {string} message - Info message
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} Created info log entry
   */
  async createInfoLog(logId, message, data = null) {
    return await this.createRealtimeLog(logId, 'info', message, { data })
  }

  /**
   * Create warning log entry
   * @param {number} logId - Parent ETL log ID
   * @param {string} message - Warning message
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} Created warning log entry
   */
  async createWarningLog(logId, message, data = null) {
    return await this.createRealtimeLog(logId, 'warning', message, { data })
  }

  /**
   * Create error log entry
   * @param {number} logId - Parent ETL log ID
   * @param {string} message - Error message
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} Created error log entry
   */
  async createErrorLog(logId, message, data = null) {
    return await this.createRealtimeLog(logId, 'error', message, { data })
  }
}

module.exports = RealtimeLogService 