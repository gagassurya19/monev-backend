const celoeApiGatewayService = require('./celoeapiGatewayService')
const logger = require('../utils/logger')
const database = require('../database/connection')
const dbConfig = require('../../config/database')

// Database table names for CP data
const CP_TABLES = [
  'cp_student_profile',
  'cp_course_summary', 
  'cp_activity_summary',
  'cp_student_quiz_detail',
  'cp_student_assignment_detail',
  'cp_student_resource_access'
]

// Mapping from API table names to database table names
const TABLE_MAPPING = {
  'cp_student_profile': 'monev_cp_student_profile',
  'cp_course_summary': 'monev_cp_course_summary',
  'cp_activity_summary': 'monev_cp_activity_summary',
  'cp_student_quiz_detail': 'monev_cp_student_quiz_detail',
  'cp_student_assignment_detail': 'monev_cp_student_assignment_detail',
  'cp_student_resource_access': 'monev_cp_student_resource_access'
}

const etlCoursePerformanceService = {
  // Main ETL function that runs all ETL operations
  runETL: async () => {
    const startTime = new Date()
    let logId = null
    
    try {
      logger.info('Starting CP ETL process from new API')

      // Create log entry for this ETL run
      logId = await etlCoursePerformanceService.createLogEntry(startTime, 2) // status 2 = inprogress

      // Clear existing data for fresh ETL run
      await etlCoursePerformanceService.clearExistingData()

      // Run concurrent ETL operations for all tables
      const etlPromises = CP_TABLES.map(table => 
        etlCoursePerformanceService.processTableData(table)
      )

      const results = await Promise.all(etlPromises)
      
      // Calculate total records processed
      const totalRecords = results.reduce((sum, result) => sum + result.records, 0)
      
      // Update log entry with success status
      await etlCoursePerformanceService.updateLogEntry(logId, 1, totalRecords, startTime) // status 1 = finished

      logger.info('CP ETL process completed successfully')
      return { 
        success: true, 
        message: 'CP ETL process completed successfully', 
        timestamp: new Date().toISOString(),
        totalRecords,
        results
      }
    } catch (error) {
      logger.error('CP ETL process failed:', {
        message: error.message,
        stack: error.stack
      })
      
      // Update log entry with failure status
      if (logId) {
        await etlCoursePerformanceService.updateLogEntry(logId, 3, 0, startTime) // status 3 = failed
      }
      
      throw error
    }
  },

  // Create a new log entry in monev_cp_fetch_logs
  createLogEntry: async (startTime, status = 2) => {
    try {
      const query = `
        INSERT INTO monev_cp_fetch_logs 
        (start_date, status, offset, numrow) 
        VALUES (?, ?, ?, ?)
      `
      const result = await database.query(query, [
        startTime,
        status,
        0, // offset
        0  // numrow
      ])
      
      logger.info(`Created log entry with ID: ${result.insertId}`)
      return result.insertId
    } catch (error) {
      logger.error('Failed to create log entry:', error.message)
      return null
    }
  },

  // Update an existing log entry
  updateLogEntry: async (logId, status, numrow = 0, startTime) => {
    if (!logId) return
    
    try {
      const endTime = new Date()
      
      const query = `
        UPDATE monev_cp_fetch_logs 
        SET end_date = ?, status = ?, numrow = ?
        WHERE id = ?
      `
      
      const result = await database.query(query, [
        endTime,
        status,
        numrow,
        logId
      ])
      
      logger.info(`Updated log entry ${logId} with status ${status}, records: ${numrow}, affected rows: ${result.affectedRows}`)
    } catch (error) {
      logger.error('Failed to update log entry:', error.message)
    }
  },

  // Clear existing data before ETL run
  clearExistingData: async () => {
    try {
      logger.info('Clearing existing CP ETL data')

      const tables = [
        'monev_cp_student_resource_access',
        'monev_cp_student_assignment_detail', 
        'monev_cp_student_quiz_detail',
        'monev_cp_student_profile',
        'monev_cp_activity_summary',
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

      logger.info('Existing CP ETL data cleared (or tables do not exist)')
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
  fetchDataFromAPI: async (limit = 100, offset = 0, table = null, tables = null) => {
    try {
      logger.info(`Fetching CP data from API: limit=${limit}, offset=${offset}, table=${table || 'all'}`)
      
      const result = await celoeApiGatewayService.exportCPETLData(limit, offset, table, tables, false)
      
      if (!result.success) {
        throw new Error(`API returned error: ${result.error || 'Unknown error'}`)
      }

      return result
    } catch (error) {
      logger.error('Error fetching CP data from API:', {
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
      
      // Fetch all data for this table in one call since the new API returns all data
      const apiResponse = await etlCoursePerformanceService.fetchDataFromAPI(1000, 0, apiTableName)
      
      // Handle new response structure
      let tableData = []
      if (apiResponse.tables && apiResponse.tables[apiTableName]) {
        tableData = apiResponse.tables[apiTableName].rows || []
        logger.info(`Received ${tableData.length} records for table ${apiTableName}`)
      } else {
        logger.warn(`No data found for table ${apiTableName} in API response`)
        return { table: apiTableName, dbTable: dbTableName, records: 0 }
      }

      if (tableData.length === 0) {
        logger.info(`No data to process for table ${apiTableName}`)
        return { table: apiTableName, dbTable: dbTableName, records: 0 }
      }

      // Insert data into database using the mapped table name
      await etlCoursePerformanceService.insertTableData(dbTableName, tableData)
      
      logger.info(`ETL completed for table ${apiTableName} -> ${dbTableName}: ${tableData.length} total records`)
      return { table: apiTableName, dbTable: dbTableName, records: tableData.length }
    } catch (error) {
      logger.error(`ETL failed for table ${apiTableName}:`, error.message)
      throw error
    }
  },

  // Insert data into specific table
  insertTableData: async (tableName, data) => {
    if (!data || data.length === 0) return

    try {
      // Get table structure to know which columns exist
      const tableStructureResult = await database.query(`DESCRIBE ${tableName}`)
      const tableStructure = Array.isArray(tableStructureResult) ? tableStructureResult : (tableStructureResult && tableStructureResult[0] ? tableStructureResult[0] : [])
      const existingColumns = tableStructure.map(col => col.Field)
      
      logger.info(`Table ${tableName} has columns: ${existingColumns.join(', ')}`)
      
      // Filter data to only include existing columns
      const filteredData = data.map(record => {
        const filteredRecord = {}
        Object.keys(record).forEach(key => {
          if (existingColumns.includes(key)) {
            filteredRecord[key] = record[key]
          } else {
            logger.debug(`Filtering out column ${key} for table ${tableName}`)
          }
        })
        return filteredRecord
      })
      
      if (filteredData.length === 0) {
        logger.warn(`No valid data after filtering for table ${tableName}`)
        return
      }
      
      const columns = Object.keys(filteredData[0]).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
      const placeholders = columns.map(() => '?').join(', ')
      const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`

      const values = filteredData.map(record => 
        columns.map(col => record[col])
      )

      // Use batch insert for better performance
      for (const valueSet of values) {
        await database.query(query, valueSet)
      }

      logger.info(`Inserted ${filteredData.length} records into ${tableName}`)
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
      logger.info("Running CP ETL status check")

      let lastRun = null
      let isRunning = false

      try {
        // Get latest ETL run
        const latestRunRows = await database.query(`
          SELECT * FROM monev_cp_fetch_logs ORDER BY id DESC LIMIT 1
        `)
        lastRun = latestRunRows[0] || null

        // Check if any ETL job is currently running (status = 2)
        const runningRows = await database.query(`
          SELECT COUNT(*) as running_count FROM monev_cp_fetch_logs WHERE status = 2
        `)
        isRunning = runningRows[0]?.running_count > 0
      } catch (tableError) {
        logger.warn('Error accessing monev_cp_fetch_logs table:', tableError.message)
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
      logger.error('Error getting CP ETL status:', error.message)
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
          SELECT COUNT(*) as total FROM monev_cp_fetch_logs
        `)
        total = countResult?.total ?? countResult[0]?.total ?? 0

        // Get paginated logs
        const rows = await database.query(`
          SELECT * FROM monev_cp_fetch_logs 
          ORDER BY id DESC 
          LIMIT ${limit} OFFSET ${offset}
        `)

        logs = Array.isArray(rows) ? rows : (rows ? [rows] : [])
      } catch (tableError) {
        logger.warn('Error accessing monev_cp_fetch_logs table:', tableError.message)
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
      logger.error('Error getting CP ETL logs:', error.message)
      throw error
    }
  },

  // Test API connection
  testAPIConnection: async () => {
    try {
      logger.info('Testing CP API connection...')
      
      // Test by getting CP ETL status
      const statusResult = await celoeApiGatewayService.getCPETLStatus()
      
      // Test by fetching a small amount of data
      const exportResult = await celoeApiGatewayService.exportCPETLData(1, 0, 'cp_student_profile', null, true)
      
      logger.info('CP API connection test successful')
      return {
        success: true,
        message: 'CP API connection successful',
        data: {
          status: statusResult,
          export: exportResult,
          availableTables: CP_TABLES
        }
      }
    } catch (error) {
      logger.error('CP API connection test failed:', error.message)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Clean local CP ETL data
  cleanLocalData: async () => {
    try {
      logger.info('Cleaning local CP ETL data')
      
      const tables = Object.values(TABLE_MAPPING)
      const results = {
        tables: {},
        totalAffected: 0,
        timestamp: new Date().toISOString()
      }

      for (const table of tables) {
        try {
          // Get count before deletion
          const countResult = await database.query(`SELECT COUNT(*) as count FROM ${table}`)
          const countBefore = countResult[0]?.count || 0
          
          // Delete all data
          await database.query(`DELETE FROM ${table}`)
          
          results.tables[table] = countBefore
          results.totalAffected += countBefore
          
          logger.info(`Cleared table: ${table}, deleted ${countBefore} records`)
        } catch (tableError) {
          if (tableError.code === 'ER_NO_SUCH_TABLE') {
            logger.warn(`Table ${table} does not exist, skipping clean operation`)
            results.tables[table] = 0
          } else {
            logger.error(`Error cleaning table ${table}:`, {
              message: tableError.message,
              code: tableError.code
            })
            throw tableError
          }
        }
      }

      logger.info(`Local CP ETL data cleaned successfully. Total records deleted: ${results.totalAffected}`)
      
      return {
        success: true,
        message: 'Local CP ETL data cleaned successfully',
        summary: results
      }
    } catch (error) {
      logger.error('Error cleaning local CP ETL data:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      })
      throw error
    }
  }
}

module.exports = etlCoursePerformanceService
