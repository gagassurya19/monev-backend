const database = require('../database/connection')
const logger = require('../utils/logger')

class LogService {
  constructor() {
    this.db = database
  }

  /**
   * Create a new ETL log entry
   * @param {string} typeRun - Type of ETL run (fetch_category_subject, fetch_course_performance, fetch_student_activity_summary)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created log entry
   */
  async createLog(typeRun, options = {}) {
    try {
      const {
        startDate = new Date(),
        status = 'running',
        totalRecords = 0,
        offset = 0
      } = options

      const query = `
        INSERT INTO monev_sas_logs 
        (type_run, start_date, status, total_records, offset, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `
      
      const result = await this.db.query(query, [
        typeRun,
        startDate,
        status,
        totalRecords,
        offset,
        new Date()
      ])

      const logId = result.insertId
      
      logger.info(`Created ETL log entry`, {
        logId,
        typeRun,
        status,
        totalRecords
      })

      return {
        id: logId,
        type_run: typeRun,
        start_date: startDate,
        status,
        total_records: totalRecords,
        offset,
        created_at: new Date()
      }
    } catch (error) {
      logger.error('Failed to create ETL log:', error.message)
      throw error
    }
  }

  /**
   * Update an existing ETL log entry
   * @param {number} logId - Log ID to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated log entry
   */
  async updateLog(logId, updates = {}) {
    try {
      const {
        endDate,
        duration,
        status,
        totalRecords,
        offset
      } = updates

      const updateFields = []
      const updateValues = []

      if (endDate !== undefined) {
        updateFields.push('end_date = ?')
        updateValues.push(endDate)
      }

      if (duration !== undefined) {
        updateFields.push('duration = ?')
        updateValues.push(duration)
      }

      if (status !== undefined) {
        updateFields.push('status = ?')
        updateValues.push(status)
      }

      if (totalRecords !== undefined) {
        updateFields.push('total_records = ?')
        updateValues.push(totalRecords)
      }

      if (offset !== undefined) {
        updateFields.push('offset = ?')
        updateValues.push(offset)
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update')
      }

      const query = `
        UPDATE monev_sas_logs 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `

      updateValues.push(logId)

      await this.db.query(query, updateValues)

      logger.info(`Updated ETL log entry`, {
        logId,
        updates
      })

      return await this.getLogById(logId)
    } catch (error) {
      logger.error('Failed to update ETL log:', error.message)
      throw error
    }
  }

  /**
   * Get log by ID
   * @param {number} logId - Log ID
   * @returns {Promise<Object|null>} Log entry
   */
  async getLogById(logId) {
    try {
      const query = `
        SELECT * FROM monev_sas_logs 
        WHERE id = ?
      `
      
      const rows = await this.db.query(query, [logId])
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      logger.error('Failed to get log by ID:', error.message)
      throw error
    }
  }

  /**
   * Get logs by type with pagination
   * @param {string} typeRun - Type of ETL run
   * @param {number} limit - Number of records to return
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Object>} Logs with pagination info
   */
  async getLogsByType(typeRun, limit = 5, offset = 0) {
    try {
      // Convert parameters to integers
      const limitInt = parseInt(limit) || 5
      const offsetInt = parseInt(offset) || 0
      
      const query = `
        SELECT * FROM monev_sas_logs 
        WHERE type_run = ?
        ORDER BY created_at DESC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `
      
      const countQuery = `
        SELECT COUNT(*) as total FROM monev_sas_logs 
        WHERE type_run = ?
      `

      const logs = await this.db.query(query, [typeRun])
      const countResult = await this.db.query(countQuery, [typeRun])

      const total = countResult[0].total

      return {
        logs: Array.isArray(logs) ? logs : [],
        pagination: {
          total: parseInt(total),
          limit,
          offset,
          current_page: Math.floor(offset / limit) + 1,
          total_pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      logger.error('Failed to get logs by type:', error.message)
      throw error
    }
  }

  /**
   * Get all logs with pagination
   * @param {number} limit - Number of records to return
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Object>} Logs with pagination info
   */
  async getAllLogs(limit = 5, offset = 0) {
    try {
      // Convert parameters to integers
      const limitInt = parseInt(limit) || 5
      const offsetInt = parseInt(offset) || 0
      
      const query = `
        SELECT * FROM monev_sas_logs 
        ORDER BY created_at DESC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `
      
      const countQuery = `
        SELECT COUNT(*) as total FROM monev_sas_logs
      `

      const logs = await this.db.query(query)
      const countResult = await this.db.query(countQuery)

      const total = countResult[0].total

      return {
        logs: Array.isArray(logs) ? logs : [],
        pagination: {
          total: parseInt(total),
          limit,
          offset,
          current_page: Math.floor(offset / limit) + 1,
          total_pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      logger.error('Failed to get all logs:', error.message)
      throw error
    }
  }

  /**
   * Check if ETL is currently running for a specific type
   * @param {string} typeRun - Type of ETL run
   * @returns {Promise<boolean>} True if running
   */
  async isEtlRunning(typeRun) {
    try {
      const query = `
        SELECT COUNT(*) as count FROM monev_sas_logs 
        WHERE type_run = ? AND status = 'running'
      `
      
      const result = await this.db.query(query, [typeRun])
      return result[0].count > 0
    } catch (error) {
      logger.error('Failed to check ETL running status:', error.message)
      throw error
    }
  }

  /**
   * Calculate duration between start and end dates
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {string} Duration in HH:MM:SS format
   */
  calculateDuration(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = end - start
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

module.exports = LogService 