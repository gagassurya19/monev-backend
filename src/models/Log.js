const database = require('../database/connection')

class Log {
  constructor (data = {}) {
    this.id = data.id
    this.level = data.level
    this.message = data.message
    this.source = data.source
    this.userId = data.userId
    this.metadata = data.metadata
    this.tags = data.tags
    this.timestamp = data.timestamp
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  // Create a new log entry
  static async create (logData) {
    const {
      level,
      message,
      source,
      userId = null,
      metadata = null,
      tags = null,
      timestamp = null
    } = logData

    const logTimestamp = timestamp ? new Date(timestamp) : new Date()
    const metadataJson = metadata ? JSON.stringify(metadata) : null
    const tagsJson = tags ? JSON.stringify(tags) : null

    const sql = `
      INSERT INTO logs (level, message, source, userId, metadata, tags, timestamp, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const result = await database.query(sql, [
      level, message, source, userId, metadataJson, tagsJson, logTimestamp
    ])

    return await Log.findById(result.insertId)
  }

  // Find log by ID
  static async findById (id) {
    const sql = 'SELECT * FROM logs WHERE id = ?'
    const rows = await database.query(sql, [id])

    if (rows.length === 0) {
      return null
    }

    const logData = rows[0]

    // Parse JSON fields
    if (logData.metadata) {
      logData.metadata = JSON.parse(logData.metadata)
    }
    if (logData.tags) {
      logData.tags = JSON.parse(logData.tags)
    }

    return new Log(logData)
  }

  // Get all logs with filtering and pagination
  static async findAll (options = {}) {
    const {
      page = 1,
      limit = 20,
      level = '',
      source = '',
      userId = null,
      startDate = null,
      endDate = null,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options

    const offset = (page - 1) * limit
    const whereConditions = []
    const queryParams = []

    // Add level filter
    if (level) {
      whereConditions.push('level = ?')
      queryParams.push(level)
    }

    // Add source filter
    if (source) {
      whereConditions.push('source = ?')
      queryParams.push(source)
    }

    // Add user filter
    if (userId) {
      whereConditions.push('userId = ?')
      queryParams.push(userId)
    }

    // Add date range filter
    if (startDate) {
      whereConditions.push('timestamp >= ?')
      queryParams.push(startDate)
    }

    if (endDate) {
      whereConditions.push('timestamp <= ?')
      queryParams.push(endDate)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM logs ${whereClause}`
    const countResult = await database.query(countSql, queryParams)
    const total = countResult[0].total

    // Get paginated results
    const sql = `
      SELECT * FROM logs 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `

    queryParams.push(limit, offset)
    const rows = await database.query(sql, queryParams)

    // Parse JSON fields for each log
    const logs = rows.map(row => {
      if (row.metadata) {
        row.metadata = JSON.parse(row.metadata)
      }
      if (row.tags) {
        row.tags = JSON.parse(row.tags)
      }
      return new Log(row)
    })

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Search logs by message content
  static async search (searchOptions = {}) {
    const {
      q,
      page = 1,
      limit = 20,
      level = '',
      source = '',
      startDate = null,
      endDate = null
    } = searchOptions

    const offset = (page - 1) * limit
    const whereConditions = ['message LIKE ?']
    const queryParams = [`%${q}%`]

    // Add additional filters
    if (level) {
      whereConditions.push('level = ?')
      queryParams.push(level)
    }

    if (source) {
      whereConditions.push('source = ?')
      queryParams.push(source)
    }

    if (startDate) {
      whereConditions.push('timestamp >= ?')
      queryParams.push(startDate)
    }

    if (endDate) {
      whereConditions.push('timestamp <= ?')
      queryParams.push(endDate)
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`

    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM logs ${whereClause}`
    const countResult = await database.query(countSql, queryParams)
    const total = countResult[0].total

    // Get paginated results
    const sql = `
      SELECT * FROM logs 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `

    queryParams.push(limit, offset)
    const rows = await database.query(sql, queryParams)

    // Parse JSON fields
    const logs = rows.map(row => {
      if (row.metadata) {
        row.metadata = JSON.parse(row.metadata)
      }
      if (row.tags) {
        row.tags = JSON.parse(row.tags)
      }
      return new Log(row)
    })

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Update log entry
  static async updateById (id, updateData) {
    const allowedFields = ['level', 'message', 'source', 'metadata', 'tags']
    const updates = []
    const values = []

    // Build dynamic update query
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'metadata' || key === 'tags') {
          updates.push(`${key} = ?`)
          values.push(value ? JSON.stringify(value) : null)
        } else {
          updates.push(`${key} = ?`)
          values.push(value)
        }
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update')
    }

    updates.push('updatedAt = NOW()')
    values.push(id)

    const sql = `UPDATE logs SET ${updates.join(', ')} WHERE id = ?`
    await database.query(sql, values)

    return await Log.findById(id)
  }

  // Delete log entry (hard delete)
  static async deleteById (id) {
    const sql = 'DELETE FROM logs WHERE id = ?'
    const result = await database.query(sql, [id])

    return result.affectedRows > 0
  }

  // Get log statistics
  static async getStats (options = {}) {
    const {
      startDate = null,
      endDate = null,
      groupBy = 'day',
      source = ''
    } = options

    const whereConditions = []
    const queryParams = []

    // Add date range filter
    if (startDate) {
      whereConditions.push('timestamp >= ?')
      queryParams.push(startDate)
    }

    if (endDate) {
      whereConditions.push('timestamp <= ?')
      queryParams.push(endDate)
    }

    // Add source filter
    if (source) {
      whereConditions.push('source = ?')
      queryParams.push(source)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Define date format based on groupBy
    let dateFormat
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00'
        break
      case 'day':
        dateFormat = '%Y-%m-%d'
        break
      case 'week':
        dateFormat = '%Y-%u'
        break
      case 'month':
        dateFormat = '%Y-%m'
        break
      default:
        dateFormat = '%Y-%m-%d'
    }

    // Get counts by level and time period
    const sql = `
      SELECT 
        DATE_FORMAT(timestamp, '${dateFormat}') as period,
        level,
        COUNT(*) as count
      FROM logs 
      ${whereClause}
      GROUP BY DATE_FORMAT(timestamp, '${dateFormat}'), level
      ORDER BY period DESC, level
    `

    const statsResult = await database.query(sql, queryParams)

    // Get total counts by level
    const totalSql = `
      SELECT level, COUNT(*) as total
      FROM logs 
      ${whereClause}
      GROUP BY level
    `

    const totalResult = await database.query(totalSql, queryParams)

    return {
      periodStats: statsResult,
      totalsByLevel: totalResult
    }
  }

  // Get unique sources
  static async getSources () {
    const sql = 'SELECT DISTINCT source FROM logs ORDER BY source'
    const rows = await database.query(sql)

    return rows.map(row => row.source)
  }
}

module.exports = Log
