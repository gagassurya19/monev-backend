const celoeApiGatewayService = require('./celoeapiGatewayService')
const logger = require('../utils/logger')
const database = require('../database/connection')

// Database table names for SAS data
const SAS_TABLES = [
  'sas_activity_counts_etl',
  'sas_user_activity_etl',
  'sas_user_counts_etl'
]

// Mapping from API table names to database table names
const TABLE_MAPPING = {
  'sas_courses': 'monev_sas_courses',
  'sas_activity_counts_etl': 'monev_sas_activity_counts_etl',
  'sas_user_activity_etl': 'monev_sas_user_activity_etl',
  'sas_user_counts_etl': 'monev_sas_user_counts_etl'
}

const etlStudentActivitySummaryService = {
  // Check if required tables exist
  checkTablesExist: async () => {
    const requiredTables = Object.values(TABLE_MAPPING)
    const missingTables = []
    
    for (const table of requiredTables) {
      try {
        await database.query(`SELECT 1 FROM ${table} LIMIT 1`)
        logger.info(`Table ${table} exists`)
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          missingTables.push(table)
          logger.warn(`Table ${table} does not exist`)
        } else {
          logger.error(`Error checking table ${table}:`, error.message)
        }
      }
    }
    
    if (missingTables.length > 0) {
      logger.error(`Missing tables: ${missingTables.join(', ')}`)
      logger.error('Please run the database migration script: scripts/create_sas_tables.sql')
      throw new Error(`Missing required tables: ${missingTables.join(', ')}`)
    }
    
    return true
  },

  // Main ETL function that runs all ETL operations
  runETL: async () => {
    const startTime = new Date()
    let logId = null
    
    try {
      logger.info('Starting SAS ETL process from new API')

      // Check if required tables exist
      await etlStudentActivitySummaryService.checkTablesExist()

      // Create log entry for this ETL run
      logId = await etlStudentActivitySummaryService.createLogEntry(startTime, 'running') // status 2 = inprogress

      // Clear existing data for fresh ETL run
      await etlStudentActivitySummaryService.clearExistingData()

      // For SAS API, we fetch all data at once and distribute it to appropriate tables
      // The API returns data in a single array, not separated by table
      const allData = await etlStudentActivitySummaryService.fetchAllSASData()
      
      if (!allData || Object.values(allData).every(arr => arr.length === 0)) {
        logger.warn('No SAS data received from API')
        await etlStudentActivitySummaryService.updateLogEntry(logId, 'finished', 0, startTime)
        return { 
          success: true, 
          message: 'SAS ETL process completed - no data to process', 
          timestamp: new Date().toISOString(),
          totalRecords: 0,
          results: []
        }
      }

      logger.info(`Received data for ${Object.keys(allData).length} tables from API`)

      // Process and distribute data to appropriate tables
      const results = await etlStudentActivitySummaryService.processAllSASData(allData)
      
      // Calculate total records processed
      const totalRecords = results.reduce((sum, result) => sum + result.records, 0)
      
      // Update log entry with success status
      await etlStudentActivitySummaryService.updateLogEntry(logId, 'finished', totalRecords, startTime) // status 1 = finished

      logger.info('SAS ETL process completed successfully')
      return { 
        success: true, 
        message: 'SAS ETL process completed successfully', 
        timestamp: new Date().toISOString(),
        totalRecords,
        results
      }
    } catch (error) {
      logger.error('SAS ETL process failed:', {
        message: error.message,
        stack: error.stack
      })
      
      // Update log entry with failure status
      if (logId) {
        await etlStudentActivitySummaryService.updateLogEntry(logId, 'failed', 0, startTime) // status 3 = failed
      }
      
      throw error
    }
  },

  // Create a new log entry in monev_sas_logs
  createLogEntry: async (startTime, status = 'running') => {
    try {
      const query = `
        INSERT INTO monev_sas_logs 
        (type_run, start_date, status, offset) 
        VALUES (?, ?, ?, ?)
      `
      const result = await database.query(query, [
        'fetch_student_activity_summary',
        startTime,
        status,
        0 // offset
      ])
      
      logger.info(`Created SAS log entry with ID: ${result.insertId}`)
      return result.insertId
    } catch (error) {
      logger.error('Failed to create SAS log entry:', error.message)
      return null
    }
  },

  // Update an existing log entry
  updateLogEntry: async (logId, status, numrow = 0, startTime) => {
    if (!logId) return
    
    try {
      const endTime = new Date()
      
      // Calculate duration
      const durationMs = endTime - startTime
      const hours = String(Math.floor(durationMs / (1000 * 60 * 60))).padStart(2, '0')
      const minutes = String(Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')
      const seconds = String(Math.floor((durationMs % (1000 * 60)) / 1000)).padStart(2, '0')
      const duration = `${hours}:${minutes}:${seconds}`
      
      const query = `
        UPDATE monev_sas_logs 
        SET end_date = ?, status = ?, duration = ?, total_records = ?
        WHERE id = ?
      `
      
      const result = await database.query(query, [
        endTime,
        status,
        duration,
        numrow,
        logId
      ])
      
      logger.info(`Updated SAS log entry ${logId} with status ${status}, records: ${numrow}, duration: ${duration}, affected rows: ${result.affectedRows}`)
    } catch (error) {
      logger.error('Failed to update SAS log entry:', error.message)
    }
  },

  // Clear existing data before ETL run
  clearExistingData: async () => {
    try {
      logger.info('Clearing existing SAS ETL data')

      // Delete tables in correct order to respect foreign key constraints
      // Child tables first, then parent tables
      const tables = [
        'monev_sas_user_activity_etl',    // References monev_sas_courses
        'monev_sas_activity_counts_etl',  // No foreign key constraints
        'monev_sas_user_counts_etl',      // No foreign key constraints
        'monev_sas_courses'               // Parent table, delete last
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

      logger.info('Existing SAS ETL data cleared (or tables do not exist)')
    } catch (error) {
      logger.error('Error clearing existing SAS data:', {
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
  fetchDataFromAPI: async (limit = 100, offset = 0, date = null, courseId = null) => {
    try {
      logger.info(`Fetching SAS data from API: limit=${limit}, offset=${offset}, date=${date || 'all'}, courseId=${courseId || 'all'}`)
      
      const result = await celoeApiGatewayService.exportSASETLData(limit, offset, date, courseId)
      
      if (!result.status) {
        throw new Error(`API returned error: ${result.error || 'Unknown error'}`)
      }

      return result
    } catch (error) {
      logger.error('Error fetching SAS data from API:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      throw error
    }
  },

  // Fetch all SAS data from API
  fetchAllSASData: async () => {
    try {
      logger.info('Fetching all SAS data from API')
      
      let allData = {}
      let offset = 0
      let hasMoreData = true
      const limit = 100 // Fetch 100 records at a time

      while (hasMoreData) {
        logger.info(`Fetching SAS data, offset: ${offset}`)
        
        const apiResponse = await etlStudentActivitySummaryService.fetchDataFromAPI(limit, offset)
        
        if (!apiResponse.status || !apiResponse.data) {
          logger.warn('Invalid API response, stopping data fetch')
          break
        }

        // Handle the new nested response structure
        const responseData = apiResponse.data
        
        // Initialize allData structure if this is the first batch
        if (offset === 0) {
          allData = {
            sas_user_activity_etl: [],
            sas_activity_counts_etl: [],
            sas_user_counts_etl: [],
            sas_courses: []
          }
        }

        // Extract data from each table section
        if (responseData.sas_user_activity_etl && responseData.sas_user_activity_etl.rows) {
          allData.sas_user_activity_etl = allData.sas_user_activity_etl.concat(responseData.sas_user_activity_etl.rows)
        }
        
        if (responseData.sas_activity_counts_etl && responseData.sas_activity_counts_etl.rows) {
          allData.sas_activity_counts_etl = allData.sas_activity_counts_etl.concat(responseData.sas_activity_counts_etl.rows)
        }
        
        if (responseData.sas_user_counts_etl && responseData.sas_user_counts_etl.rows) {
          allData.sas_user_counts_etl = allData.sas_user_counts_etl.concat(responseData.sas_user_counts_etl.rows)
        }
        
        if (responseData.sas_courses && responseData.sas_courses.rows) {
          allData.sas_courses = allData.sas_courses.concat(responseData.sas_courses.rows)
        }

        logger.info(`Received data at offset ${offset}:`, {
          user_activity: responseData.sas_user_activity_etl?.rows?.length || 0,
          activity_counts: responseData.sas_activity_counts_etl?.rows?.length || 0,
          user_counts: responseData.sas_user_counts_etl?.rows?.length || 0,
          courses: responseData.sas_courses?.rows?.length || 0
        })
        
        // Check if there are more data based on the new response structure
        hasMoreData = apiResponse.has_next && (
          (responseData.sas_user_activity_etl?.hasNext) ||
          (responseData.sas_activity_counts_etl?.hasNext) ||
          (responseData.sas_user_counts_etl?.hasNext) ||
          (responseData.sas_courses?.hasNext)
        )
        
        offset += limit

        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Log total records fetched for each table
      logger.info(`Total SAS data fetched:`, {
        user_activity: allData.sas_user_activity_etl.length,
        activity_counts: allData.sas_activity_counts_etl.length,
        user_counts: allData.sas_user_counts_etl.length,
        courses: allData.sas_courses.length
      })
      
      return allData
    } catch (error) {
      logger.error('Error fetching all SAS data:', error.message)
      throw error
    }
  },

  // Fetch course information from CELOE API
  fetchCourseInformation: async (courseIds) => {
    try {
      logger.info(`Fetching course information for ${courseIds.length} courses`)
      
      // Use the celoeApiGatewayService to get course information
      // This should call an endpoint that returns complete course details
      const courseInfoPromises = courseIds.map(async (courseId) => {
        try {
          // Try to get course info from a course-specific endpoint
          const response = await celoeApiGatewayService.getCourseInfo(courseId)
          if (response && response.status && response.data) {
            return {
              course_id: parseInt(courseId),
              subject_id: response.data.subject_id || `SUBJ_${courseId}`,
              course_name: response.data.course_name || `Course ${courseId}`,
              course_shortname: response.data.course_shortname || `C${courseId}`,
              faculty_id: response.data.faculty_id || 1,
              program_id: response.data.program_id || 1,
              visible: response.data.visible || 1,
              created_at: new Date(),
              updated_at: new Date()
            }
          }
        } catch (error) {
          logger.warn(`Failed to fetch course info for course_id ${courseId}:`, error.message)
        }
        
        // Fallback to placeholder values if API call fails
        return {
          course_id: parseInt(courseId),
          subject_id: `SUBJ_${courseId}`,
          course_name: `Course ${courseId}`,
          course_shortname: `C${courseId}`,
          faculty_id: 1,
          program_id: 1,
          visible: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
      
      const courseResults = await Promise.all(courseInfoPromises)
      logger.info(`Successfully fetched course information for ${courseResults.length} courses`)
      
      return courseResults
    } catch (error) {
      logger.error('Error fetching course information:', error.message)
      // Return placeholder values as fallback
      return courseIds.map(courseId => ({
        course_id: parseInt(courseId),
        subject_id: `SUBJ_${courseId}`,
        course_name: `Course ${courseId}`,
        course_shortname: `C${courseId}`,
        faculty_id: 1,
        program_id: 1,
        visible: 1,
        created_at: new Date(),
        updated_at: new Date()
      }))
    }
  },

  // Process all SAS data and distribute to appropriate tables
  processAllSASData: async (allData) => {
    try {
      logger.info('Processing and distributing SAS data to appropriate tables')
      
      const results = []
      
      // First, process courses from the API response
      if (allData.sas_courses && allData.sas_courses.length > 0) {
        logger.info(`Processing ${allData.sas_courses.length} courses from API response`)
        
        // Transform course data to match database schema
        const courses = allData.sas_courses.map(course => ({
          course_id: parseInt(course.course_id),
          subject_id: course.subject_id,
          course_name: course.course_name,
          course_shortname: course.course_shortname,
          faculty_id: parseInt(course.faculty_id) || 1,
          program_id: parseInt(course.program_id) || 1,
          visible: parseInt(course.visible) || 1,
          created_at: new Date(course.created_at) || new Date(),
          updated_at: new Date(course.updated_at) || new Date()
        }))
        
        // Insert courses first
        await etlStudentActivitySummaryService.insertTableData('monev_sas_courses', courses)
        results.push({ table: 'sas_courses', dbTable: 'monev_sas_courses', records: courses.length })
        logger.info(`Successfully inserted ${courses.length} courses`)
      } else {
        logger.warn('No course data found in API response')
        results.push({ table: 'sas_courses', dbTable: 'monev_sas_courses', records: 0 })
      }
      
      // Now process each table type in the correct order
      for (const tableName of SAS_TABLES) {
        const dbTableName = TABLE_MAPPING[tableName]
        if (!dbTableName) {
          logger.warn(`No database mapping found for table: ${tableName}`)
          continue
        }

        logger.info(`Processing data for table: ${tableName} -> ${dbTableName}`)
        
        if (tableName === 'sas_user_activity_etl') {
          // Insert user activity data directly from API response
          if (allData.sas_user_activity_etl && allData.sas_user_activity_etl.length > 0) {
            const userActivityData = allData.sas_user_activity_etl.map(record => ({
              course_id: parseInt(record.course_id),
              num_teachers: parseInt(record.num_teachers) || 0,
              num_students: parseInt(record.num_students) || 0,
              file_views: parseInt(record.file_views) || 0,
              video_views: parseInt(record.video_views) || 0,
              forum_views: parseInt(record.forum_views) || 0,
              quiz_views: parseInt(record.quiz_views) || 0,
              assignment_views: parseInt(record.assignment_views) || 0,
              url_views: parseInt(record.url_views) || 0,
              total_views: parseInt(record.total_views) || 0,
              avg_activity_per_student_per_day: parseFloat(record.avg_activity_per_student_per_day) || 0,
              active_days: parseInt(record.active_days) || 0,
              extraction_date: record.extraction_date,
              created_at: new Date(record.created_at) || new Date(),
              updated_at: new Date(record.updated_at) || new Date()
            }))
            
            await etlStudentActivitySummaryService.insertTableData(dbTableName, userActivityData)
            results.push({ table: tableName, dbTable: dbTableName, records: userActivityData.length })
          } else {
            logger.warn(`No data found for ${tableName}`)
            results.push({ table: tableName, dbTable: dbTableName, records: 0 })
          }
        } else if (tableName === 'sas_activity_counts_etl') {
          // Insert activity counts data directly from API response
          if (allData.sas_activity_counts_etl && allData.sas_activity_counts_etl.length > 0) {
            const activityCounts = allData.sas_activity_counts_etl.map(record => ({
              courseid: parseInt(record.courseid),
              file_views: parseInt(record.file_views) || 0,
              video_views: parseInt(record.video_views) || 0,
              forum_views: parseInt(record.forum_views) || 0,
              quiz_views: parseInt(record.quiz_views) || 0,
              assignment_views: parseInt(record.assignment_views) || 0,
              url_views: parseInt(record.url_views) || 0,
              active_days: parseInt(record.active_days) || 0,
              extraction_date: record.extraction_date,
              created_at: new Date(record.created_at) || new Date(),
              updated_at: new Date(record.updated_at) || new Date()
            }))
            
            await etlStudentActivitySummaryService.insertTableData(dbTableName, activityCounts)
            results.push({ table: tableName, dbTable: dbTableName, records: activityCounts.length })
          } else {
            logger.warn(`No data found for ${tableName}`)
            results.push({ table: tableName, dbTable: dbTableName, records: 0 })
          }
        } else if (tableName === 'sas_user_counts_etl') {
          // Insert user counts data directly from API response
          if (allData.sas_user_counts_etl && allData.sas_user_counts_etl.length > 0) {
            const userCounts = allData.sas_user_counts_etl.map(record => ({
              courseid: parseInt(record.courseid),
              num_students: parseInt(record.num_students) || 0,
              num_teachers: parseInt(record.num_teachers) || 0,
              extraction_date: record.extraction_date,
              created_at: new Date(record.created_at) || new Date(),
              updated_at: new Date(record.updated_at) || new Date()
            }))
            
            await etlStudentActivitySummaryService.insertTableData(dbTableName, userCounts)
            results.push({ table: tableName, dbTable: dbTableName, records: userCounts.length })
          } else {
            logger.warn(`No data found for ${tableName}`)
            results.push({ table: tableName, dbTable: dbTableName, records: 0 })
          }
        } else {
          // For other tables, skip for now
          logger.info(`Skipping table ${tableName} - no data mapping implemented yet`)
          results.push({ table: tableName, dbTable: dbTableName, records: 0 })
        }
      }

      return results
    } catch (error) {
      logger.error('Error processing SAS data:', error.message)
      throw error
    }
  },

  // Insert data into specific table
  insertTableData: async (tableName, data) => {
    if (!data || data.length === 0) {
      logger.warn(`No data to insert into ${tableName}`)
      return
    }

    try {
      logger.info(`Preparing to insert ${data.length} records into ${tableName}`)
      logger.info(`First record sample:`, JSON.stringify(data[0], null, 2))
      
      const columns = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
      logger.info(`Columns to insert:`, columns)
      
      const placeholders = columns.map(() => '?').join(', ')
      const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`
      logger.info(`Insert query:`, query)

      const values = data.map(record => 
        columns.map(col => record[col])
      )
      
      logger.info(`First value set:`, values[0])

      // Use batch insert for better performance
      for (let i = 0; i < values.length; i++) {
        const valueSet = values[i]
        logger.info(`Inserting record ${i + 1}/${values.length} into ${tableName}:`, valueSet)
        
        const result = await database.query(query, valueSet)
        logger.info(`Insert result for record ${i + 1}:`, result)
      }

      logger.info(`Successfully inserted ${data.length} records into ${tableName}`)
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
          sqlMessage: error.sqlMessage,
          stack: error.stack
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
      logger.info("Running SAS ETL status check")

      let lastRun = null
      let isRunning = false

      try {
        // Get latest ETL run
        const latestRunRows = await database.query(`
          SELECT * FROM monev_sas_logs ORDER BY id DESC LIMIT 1
        `)
        lastRun = latestRunRows[0] || null

        // Check if any ETL job is currently running (status = 2)
        const runningRows = await database.query(`
          SELECT COUNT(*) as running_count FROM monev_sas_logs WHERE status = 'running'
        `)
        isRunning = runningRows[0]?.running_count > 0
      } catch (tableError) {
        logger.warn('Error accessing monev_sas_logs table:', tableError.message)
        lastRun = null
        isRunning = false
      }

      // Check if ETL should run based on time
      const shouldRun = etlStudentActivitySummaryService.shouldRunETL()

      return {
        status: shouldRun ? 'active' : 'paused',
        lastRun: lastRun ? {
          id: lastRun.id,
          start_date: lastRun.start_date,
          end_date: lastRun.end_date,
          status: lastRun.status === 'finished' ? 'finished' : (lastRun.status === 'running' ? 'inprogress' : 'failed'),
          offset: lastRun.offset
        } : null,
        nextRun: shouldRun ? 'Every hour at minute 0' : 'Paused until next day',
        isRunning,
        shouldRun
      }
    } catch (error) {
      logger.error('Error getting SAS ETL status:', error.message)
      throw error
    }
  },

  getETLHistory: async (limit = 20, offset = 0, type_run = 'fetch_student_activity_summary') => {
    try {
      let total = 0
      let logs = []

      try {
        // Build WHERE clause for filtering
        let whereClause = 'WHERE type_run = ?'
        let whereParams = [type_run]

        // Get total logs count with filter
        const countQuery = `
          SELECT COUNT(*) as total FROM monev_sas_logs ${whereClause}
        `
        const [countResult] = await database.query(countQuery, whereParams)
        total = countResult?.total ?? countResult[0]?.total ?? 0

        // Get paginated logs with filter
        const logsQuery = `
          SELECT * FROM monev_sas_logs 
          ${whereClause}
          ORDER BY id DESC 
          LIMIT ${limit} OFFSET ${offset}
        `
        const rows = await database.query(logsQuery, whereParams)

        logs = Array.isArray(rows) ? rows : (rows ? [rows] : [])
      } catch (tableError) {
        logger.warn('Error accessing monev_sas_logs table:', tableError.message)
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
          type_run: log.type_run,
          start_date: log.start_date,
          end_date: log.end_date,
          duration,
          status: log.status === 'finished' ? 'finished' : (log.status === 'running' ? 'inprogress' : 'failed'),
          total_records: log.total_records,
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
        },
        filter: { type_run }
      }
    } catch (error) {
      logger.error('Error getting SAS ETL logs:', error.message)
      throw error
    }
  },

  // Test API connection
  testAPIConnection: async () => {
    try {
      logger.info('Testing SAS API connection...')
      
      // Test by getting SAS ETL status
      const statusResult = await celoeApiGatewayService.getSASETLStatus()
      
      // Test by fetching a small amount of data
      const exportResult = await celoeApiGatewayService.exportSASETLData(1, 0)
      
      logger.info('SAS API connection test successful')
      return {
        success: true,
        message: 'SAS API connection successful',
        data: {
          status: statusResult,
          export: exportResult,
          availableTables: SAS_TABLES
        }
      }
    } catch (error) {
      logger.error('SAS API connection test failed:', error.message)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Clean local SAS ETL data
  cleanLocalData: async () => {
    try {
      logger.info('Cleaning local SAS ETL data')
      
      const tables = [
        'monev_sas_user_activity_etl',    // References monev_sas_courses
        'monev_sas_activity_counts_etl',  // No foreign key constraints
        'monev_sas_user_counts_etl',      // No foreign key constraints
        'monev_sas_courses'               // Parent table, delete last
      ]

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

      logger.info(`Local SAS ETL data cleaned successfully. Total records deleted: ${results.totalAffected}`)
      
      return {
        success: true,
        message: 'Local SAS ETL data cleaned successfully',
        summary: results
      }
    } catch (error) {
      logger.error('Error cleaning local SAS ETL data:', {
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

module.exports = etlStudentActivitySummaryService
