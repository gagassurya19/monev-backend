const axios = require('axios')
const config = require('../../config')
const logger = require('../utils/logger')
const database = require('../database/connection')
const dbConfig = require('../../config/database')

// API Configuration
const API_CONFIG = {
  baseURL: 'http://localhost:8081/api',
  token: 'default-webhook-token-change-this',
  limit: 5000, // Records per page
  tables: [
    'course_activity_summary',
    'course_summary', 
    'student_assignment_detail',
    'student_profile',
    'student_quiz_detail',
    'student_resource_access'
  ]
}

// Mapping from API table names to database table names
const TABLE_MAPPING = {
  'course_activity_summary': 'monev_cp_activity_summary',
  'course_summary': 'monev_cp_course_summary',
  'student_assignment_detail': 'monev_cp_student_assignment_detail',
  'student_profile': 'monev_cp_student_profile',
  'student_quiz_detail': 'monev_cp_student_quiz_detail',
  'student_resource_access': 'monev_cp_student_resource_access'
}

const etlCoursePerformanceService = {
  // Main ETL function that runs all ETL operations
  runETL: async () => {
    try {
      logger.info('Starting ETL process from API')

      // Clear existing data for fresh ETL run
      await etlCoursePerformanceService.clearExistingData()

      // Run concurrent ETL operations for all tables
      const etlPromises = API_CONFIG.tables.map(table => 
        etlCoursePerformanceService.processTableData(table)
      )

      await Promise.all(etlPromises)

      logger.info('ETL process completed successfully')
      return { 
        success: true, 
        message: 'ETL process completed successfully', 
        timestamp: new Date().toISOString() 
      }
    } catch (error) {
      logger.error('ETL process failed:', {
        message: error.message,
        stack: error.stack
      })
      throw error
    }
  },

  // Clear existing data before ETL run
  clearExistingData: async () => {
    try {
      logger.info('Clearing existing ETL data')

      const tables = [
        'monev_cp_student_resource_access',
        'monev_cp_student_assignment_detail', 
        'monev_cp_student_quiz_detail',
        'monev_cp_student_profile',
        'monev_cp_course_activity_summary',
        'monev_cp_course_summary'
      ]

      for (const table of tables) {
        try {
          await database.query(`DELETE FROM ${table}`)
          logger.info(`Cleared table: ${table}`)
        } catch (tableError) {
          if (tableError.code === 'ER_NO_SUCH_TABLE') {
            logger.warn(`Table ${table} does not exist, skipping clear operation`)
          } else {
            logger.error(`Error clearing table ${table}:`, {
              message: tableError.message,
              code: tableError.code
            })
            throw tableError
          }
        }
      }

      logger.info('Existing ETL data cleared (or tables do not exist)')
    } catch (error) {
      logger.error('Error clearing existing data:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      })
      throw error
    }
  },

  // Fetch data from API with pagination
  fetchDataFromAPI: async (page = 1) => {
    try {
      const url = `${API_CONFIG.baseURL}/export/bulk`
      const params = {
        tables: API_CONFIG.tables.join(','),
        page,
        limit: API_CONFIG.limit
      }

      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${API_CONFIG.token}`
        },
        timeout: 30000 // 30 seconds timeout
      })

      if (!response.data.status) {
        throw new Error(`API returned error: ${response.data.message || 'Unknown error'}`)
      }

      return response.data
    } catch (error) {
      logger.error('Error fetching data from API:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      throw error
    }
  },

  // Process data for a specific table
  processTableData: async (apiTableName) => {
    try {
      const dbTableName = TABLE_MAPPING[apiTableName]
      if (!dbTableName) {
        throw new Error(`No database mapping found for API table: ${apiTableName}`)
      }

      logger.info(`Starting ETL for table: ${apiTableName} -> ${dbTableName}`)
      
      let page = 1
      let totalRecords = 0
      let hasMorePages = true

      while (hasMorePages) {
        logger.info(`Fetching page ${page} for table: ${apiTableName}`)
        
        const apiResponse = await etlCoursePerformanceService.fetchDataFromAPI(page)
        const tableData = apiResponse.data[apiTableName] || []
        
        if (tableData.length === 0) {
          logger.info(`No data found for table ${apiTableName} on page ${page}`)
          break
        }

        // Insert data into database using the mapped table name
        await etlCoursePerformanceService.insertTableData(dbTableName, tableData)
        
        totalRecords += tableData.length
        logger.info(`Processed ${tableData.length} records for ${apiTableName} -> ${dbTableName} (page ${page})`)

        // Check if there are more pages
        const pagination = apiResponse.pagination
        hasMorePages = pagination.has_next && tableData.length === API_CONFIG.limit
        page++

        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      logger.info(`ETL completed for table ${apiTableName} -> ${dbTableName}: ${totalRecords} total records`)
      return { table: apiTableName, dbTable: dbTableName, records: totalRecords }
    } catch (error) {
      logger.error(`ETL failed for table ${apiTableName}:`, error.message)
      throw error
    }
  },

  // Insert data into specific table
  insertTableData: async (tableName, data) => {
    if (!data || data.length === 0) return

    try {
      const columns = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
      const placeholders = columns.map(() => '?').join(', ')
      const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`

      const values = data.map(record => 
        columns.map(col => record[col])
      )

      // Use batch insert for better performance
      for (const valueSet of values) {
        await database.query(query, valueSet)
      }

      logger.info(`Inserted ${data.length} records into ${tableName}`)
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        logger.warn(`Table ${tableName} does not exist, skipping data insertion`)
        logger.warn(`Please run the database setup script to create the required tables`)
      } else {
        logger.error(`Error inserting data into ${tableName}:`, {
          message: error.message,
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage
        })
        throw error
      }
    }
  },

  // Check if it's time to run ETL (only at minute 00 of every hour)
  shouldRunETL: () => {
    const now = new Date()
    const currentMinute = now.getMinutes()
    
    // Only run at minute 00 of every hour
    if (currentMinute === 0) {
      return true
    }
    
    return false
  },

  // Get ETL status and last run info
  getETLStatus: async () => {
    try {
      logger.info("Running ETL status check")

      let lastRun = null
      let isRunning = false

      try {
        // Get latest ETL run
        const latestRunRows = await database.query(`
          SELECT * FROM ${dbConfig.dbNames.main}.monev_cp_fetch_logs ORDER BY id DESC LIMIT 1
        `)
        lastRun = latestRunRows[0] || null

        // Check if any ETL job is currently running (status = 2)
        const runningRows = await database.query(`
          SELECT COUNT(*) as running_count FROM ${dbConfig.dbNames.main}.monev_cp_fetch_logs WHERE status = 2
        `)
        isRunning = runningRows[0]?.running_count > 0
      } catch (tableError) {
        logger.warn('monev_cp_fetch_logs table does not exist yet, creating it...')
        // Table doesn't exist, this is normal for new installations
        lastRun = null
        isRunning = false
      }

      // Check if ETL should run based on time
      const shouldRun = etlCoursePerformanceService.shouldRunETL()

      return {
        status: shouldRun ? 'active' : 'paused',
        lastRun: lastRun ? {
          id: lastRun.id,
          start_date: lastRun.start_date,
          end_date: lastRun.end_date,
          status: lastRun.status === 1 ? 'finished' : (lastRun.status === 2 ? 'inprogress' : 'failed'),
          total_records: lastRun.numrow,
          offset: lastRun.offset
        } : null,
        nextRun: shouldRun ? 'Every hour at minute 0' : 'Paused until next day',
        isRunning,
        shouldRun
      }
    } catch (error) {
      logger.error('Error getting ETL status:', error.message)
      throw error
    }
  },

  getETLHistory: async (limit = 20, offset = 0) => {
    try {
      let total = 0
      let logs = []

      try {
        // Get total logs count
        const [countResult] = await database.query(`
          SELECT COUNT(*) as total FROM ${dbConfig.dbNames.main}.monev_cp_fetch_logs
        `)
        total = countResult?.total ?? countResult[0]?.total ?? 0

        // Get paginated logs
        const rows = await database.query(`
          SELECT * FROM ${dbConfig.dbNames.main}.monev_cp_fetch_logs 
          ORDER BY id DESC 
          LIMIT ${limit} OFFSET ${offset}
        `)

        logs = Array.isArray(rows) ? rows : (rows ? [rows] : [])
      } catch (tableError) {
        logger.warn('monev_cp_fetch_logs table does not exist yet, returning empty history')
        total = 0
        logs = []
      }

      // Format logs
      const formattedLogs = logs.map(log => {
        let duration = null
        if (log.start_date && log.end_date) {
          const start = new Date(log.start_date)
          const end = new Date(log.end_date)
          const diffMs = end - start

          const hours = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0')
          const minutes = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')
          const seconds = String(Math.floor((diffMs % (1000 * 60)) / 1000)).padStart(2, '0')

          duration = `${hours}:${minutes}:${seconds}`
        }

        return {
          id: log.id,
          start_date: log.start_date,
          end_date: log.end_date,
          duration,
          status: log.status === 1 ? 'finished' : (log.status === 2 ? 'inprogress' : 'failed'),
          total_records: log.numrow,
          offset: log.offset,
          created_at: log.created_at ?? null
        }
      })

      const currentPage = Math.floor(offset / limit) + 1
      const totalPages = Math.ceil(total / limit)

      return {
        logs: formattedLogs,
        pagination: {
          total,
          limit,
          offset,
          current_page: currentPage,
          total_pages: totalPages
        }
      }
    } catch (error) {
      logger.error('Error getting ETL logs:', error.message)
      throw error
    }
  },

  // Test API connection
  testAPIConnection: async () => {
    try {
      logger.info('Testing API connection...')
      const response = await etlCoursePerformanceService.fetchDataFromAPI(1)
      logger.info('API connection test successful')
      return {
        success: true,
        message: 'API connection successful',
        data: {
          tables: response.meta?.available_tables || [],
          totalRecords: response.pagination?.total_records || 0
        }
      }
    } catch (error) {
      logger.error('API connection test failed:', error.message)
      return {
        success: false,
        message: error.message
      }
    }
  }
}

module.exports = etlCoursePerformanceService
