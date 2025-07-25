const mysql = require('mysql2/promise')
const config = require('../../config')
const logger = require('../utils/logger')

class Database {
  constructor () {
    this.pool = null
  }

  // Initialize connection pool
  async init () {
    try {
      this.pool = mysql.createPool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        connectionLimit: config.database.connectionLimit,
        acquireTimeout: config.database.acquireTimeout,
        timeout: config.database.timeout,
        reconnect: config.database.reconnect,
        multipleStatements: false, // Security best practice
        ssl: false // Configure based on your MySQL setup
      })

      logger.info('Database pool created successfully')
    } catch (error) {
      logger.error('Failed to create database pool:', error.message)
      throw error
    }
  }

  // Get connection from pool
  async getConnection () {
    if (!this.pool) {
      await this.init()
    }
    return this.pool.getConnection()
  }

  // Execute query with automatic connection management
  async query (sql, params = []) {
    const connection = await this.getConnection()
    try {
      const [rows] = await connection.execute(sql, params)
      return rows
    } catch (error) {
      logger.error('Database query error:', {
        sql: `${sql.substring(0, 100)}...`, // Log only first 100 chars for security
        error: error.message
      })
      throw error
    } finally {
      connection.release()
    }
  }

  // Execute transaction
  async transaction (queries) {
    const connection = await this.getConnection()
    try {
      await connection.beginTransaction()

      const results = []
      for (const { sql, params = [] } of queries) {
        const [rows] = await connection.execute(sql, params)
        results.push(rows)
      }

      await connection.commit()
      return results
    } catch (error) {
      await connection.rollback()
      logger.error('Transaction error:', error.message)
      throw error
    } finally {
      connection.release()
    }
  }

  // Test database connection
  async testConnection () {
    try {
      const connection = await this.getConnection()
      await connection.ping()
      connection.release()
      return true
    } catch (error) {
      logger.error('Database connection test failed:', error.message)
      throw error
    }
  }

  // Close all connections
  async closeConnection () {
    if (this.pool) {
      await this.pool.end()
      logger.info('Database pool closed')
    }
  }

  // Get pool status
  getPoolStatus () {
    if (!this.pool) return null

    return {
      threadId: this.pool.threadId,
      config: {
        connectionLimit: this.pool.config.connectionLimit,
        acquireTimeout: this.pool.config.acquireTimeout
      }
    }
  }
}

// Create singleton instance
const database = new Database()

module.exports = database
