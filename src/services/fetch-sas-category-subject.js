const database = require('../database/connection')
const logger = require('../utils/logger')
const config = require('../../config')
const axios = require('axios')
const LogService = require('./logService')
const RealtimeLogService = require('./realtimeLogService')

class FetchSASCategorySubjectService {
  constructor() {
    this.db = database
    this.batchSize = config.etl?.batchSize || 1000
    this.startTime = Date.now()
    this.monevDb = config.database.dbNames.main || 'monev_db'
    
    // API configuration
    this.apiBaseUrl = process.env.CELOE_API_BASE_URL || 'https://celoe.telkomuniversity.ac.id/api/v1'
    this.apiKey = process.env.CELOE_API_KEY
    
    // Initialize universal services
    this.logService = new LogService()
    this.realtimeLogService = new RealtimeLogService()
  }

  /**
   * Initialize the service
   */
  async init() {
    try {
      await this.db.init()
      logger.info('FetchSASCategorySubjectService initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize FetchSASCategorySubjectService:', error.message)
      throw error
    }
  }

  /**
   * Create initial log entry for ETL process
   */
  async createEtlLog() {
    try {
      const logEntry = await this.logService.createLog('fetch_category_subject', {
        startDate: new Date(),
        status: 'running',
        totalRecords: 0,
        offset: 0
      })

      logger.info(`Created ETL log entry with ID: ${logEntry.id}`)
      return logEntry.id
    } catch (error) {
      logger.error('Failed to create ETL log:', error.message)
      throw error
    }
  }

  /**
   * Update ETL log with final status
   */
  async updateEtlLog(logId, status, totalRecords) {
    try {
      const endDate = new Date()
      const logEntry = await this.logService.getLogById(logId)
      
      if (!logEntry) {
        throw new Error(`Log entry with ID ${logId} not found`)
      }

      const duration = this.logService.calculateDuration(logEntry.start_date, endDate)

      await this.logService.updateLog(logId, {
        endDate,
        duration,
        status,
        totalRecords
      })

      logger.info(`Updated ETL log ${logId} with status: ${status}, records: ${totalRecords}`)
    } catch (error) {
      logger.error('Failed to update ETL log:', error.message)
      throw error
    }
  }

  /**
   * Get ETL logs with pagination
   */
  async getEtlLogs(limit = 5, offset = 0) {
    try {
      return await this.logService.getLogsByType('fetch_category_subject', limit, offset)
    } catch (error) {
      logger.error('Failed to get ETL logs:', error.message)
      throw error
    }
  }

  /**
   * Fetch data from external API
   */
  async fetchExternalApi(endpoint) {
    try {
      const url = `${this.apiBaseUrl}${endpoint}`
      
      logger.info(`Fetching data from: ${url}`)
      
      const response = await axios({
        method: 'GET',
        url,
        headers: {
          'celoe-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 30 seconds
        validateStatus: (status) => status === 200
      })

      const data = response.data
      
      if (!data || !data.status || !data.status) {
        throw new Error('Invalid API response')
      }

      logger.info(`Successfully fetched data from ${endpoint}: ${data.data?.length || 0} records`)
      return data.data || []
    } catch (error) {
      logger.error(`Failed to fetch from ${endpoint}:`, error.message)
      throw error
    }
  }

  /**
   * Fetch data from external API with detailed logging
   */
  async fetchExternalApiWithLogging(endpoint, logId, startProgress, endProgress) {
    try {
      const url = `${this.apiBaseUrl}${endpoint}`
      const fetchStartTime = Date.now()

      // Log initial connection attempt
      await this.addRealtimeLog(logId, 'info', `Establishing connection to: ${url}`, startProgress)
      await this.addRealtimeLog(logId, 'debug', 'Request timeout set to: 30 seconds', startProgress + 1)

      await this.addRealtimeLog(logId, 'info', 'Sending HTTP GET request...', startProgress + 2)

      const response = await axios({
        method: 'GET',
        url,
        headers: {
          'celoe-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000,
        validateStatus: (status) => status === 200
      })

      const fetchDuration = Date.now() - fetchStartTime
      const downloadSize = response.headers['content-length'] || 0

      // Log response details
      await this.addRealtimeLog(logId, 'info', `Received HTTP response: ${response.status}`, startProgress + 3)
      await this.addRealtimeLog(logId, 'debug', `Response time: ${fetchDuration}ms`, startProgress + 4)
      await this.addRealtimeLog(logId, 'debug', `Content-Type: ${response.headers['content-type']}`, startProgress + 5)
      await this.addRealtimeLog(logId, 'debug', `Download size: ${Math.round(downloadSize / 1024 * 100) / 100} KB`, startProgress + 6)

      await this.addRealtimeLog(logId, 'info', 'Parsing JSON response...', endProgress - 1)

      const data = response.data

      if (!data) {
        await this.addRealtimeLog(logId, 'error', 'JSON parsing failed: Invalid or empty response', null)
        throw new Error('Invalid JSON response')
      }

      if (!data.status || !data.status) {
        await this.addRealtimeLog(logId, 'error', 'API Error: Response status is false or missing', null)
        throw new Error('Invalid API response status')
      }

      const resultData = data.data || []
      const resultCount = resultData.length

      await this.addRealtimeLog(logId, 'info', `JSON parsing successful: ${resultCount} records found`, endProgress)
      await this.addRealtimeLog(logId, 'debug', 'API response validation passed', endProgress)

      // Log additional response metadata if available
      if (data.message) {
        await this.addRealtimeLog(logId, 'debug', `API message: ${data.message}`, endProgress)
      }

      return resultData
    } catch (error) {
      await this.addRealtimeLog(logId, 'error', `API fetch failed: ${error.message}`, null)
      throw error
    }
  }

  /**
   * Save categories to database with bulk operations
   */
  async saveCategories(categories, logId) {
    if (!categories || categories.length === 0) {
      await this.addRealtimeLog(logId, 'warning', 'No categories to process', 50)
      return 0
    }

    const totalCount = categories.length
    const batchSize = 100 // Optimized batch size for categories

    await this.addRealtimeLog(logId, 'info', '=== CATEGORIES DATABASE BULK INSERTION STARTED ===', 29)
    await this.addRealtimeLog(logId, 'info', `Processing ${totalCount} categories using bulk INSERT ON DUPLICATE KEY UPDATE`, 30)
    await this.addRealtimeLog(logId, 'info', `Batch size optimized to ${batchSize} for bulk operations`, 30.5)

    let savedCount = 0
    const overallStartTime = Date.now()

    try {
      // Process categories using bulk upsert
      const batches = this.chunkArray(categories, batchSize)
      let batchNumber = 0
      const totalBatches = batches.length

      for (const batch of batches) {
        batchNumber++
        const batchStartTime = Date.now()

        await this.addRealtimeLog(logId, 'info', `Processing bulk batch ${batchNumber}/${totalBatches} (${batch.length} categories)`, null)

        // Build bulk upsert query
        const valuesArray = []
        const params = []

        for (const category of batch) {
          valuesArray.push('(?, ?, ?, ?, ?)')
          params.push(
            category.category_id,
            category.category_name,
            category.category_site,
            category.category_type,
            category.category_parent_id
          )
        }

        const valuesString = valuesArray.join(', ')

        // Single bulk upsert query
        const bulkQuery = `
          INSERT INTO ${this.monevDb}.monev_sas_categories 
          (category_id, category_name, category_site, category_type, category_parent_id) 
          VALUES ${valuesString}
          ON DUPLICATE KEY UPDATE 
              category_name = VALUES(category_name),
              category_site = VALUES(category_site),
              category_type = VALUES(category_type),
              category_parent_id = VALUES(category_parent_id)
        `

        await this.addRealtimeLog(logId, 'debug', `Executing bulk upsert for category batch ${batchNumber} with ${batch.length} records`, null)

        // Execute bulk operation
        const result = await this.db.query(bulkQuery, params)
        // For INSERT ... ON DUPLICATE KEY UPDATE, affectedRows counts both INSERT attempts and UPDATEs
        // We count actual records processed, not affectedRows
        savedCount += batch.length

        const batchDuration = Date.now() - batchStartTime
        const progressPercent = Math.round(30 + (savedCount / totalCount) * 20)
        const recordsPerSecond = Math.round(batch.length / (batchDuration / 1000))

        await this.addRealtimeLog(
          logId,
          'info',
          `Category bulk batch ${batchNumber} completed: ${savedCount}/${totalCount} processed (${recordsPerSecond} records/sec)`,
          progressPercent
        )

        // Small delay to prevent overwhelming the database
        await this.sleep(1)
      }

      const totalProcessingTime = Date.now() - overallStartTime
      const overallRate = Math.round(totalCount / (totalProcessingTime / 1000))

      await this.addRealtimeLog(logId, 'info', '=== CATEGORIES DATABASE BULK INSERTION COMPLETED ===', 50)
      await this.addRealtimeLog(logId, 'info', `Successfully processed ${totalCount} categories in ${totalProcessingTime}ms`, 50)
      await this.addRealtimeLog(logId, 'info', `Categories performance: ${overallRate} categories/sec using ${totalBatches} bulk operations`, 50)

    } catch (error) {
      await this.addRealtimeLog(logId, 'error', '=== CATEGORIES DATABASE BULK INSERTION FAILED ===', null)
      await this.addRealtimeLog(logId, 'error', `Categories bulk processing failed: ${error.message}`, null)
      throw error
    }

    return savedCount
  }

  /**
   * Save subjects to database with bulk operations
   */
  async saveSubjects(subjects, logId) {
    if (!subjects || subjects.length === 0) {
      await this.addRealtimeLog(logId, 'warning', 'No subjects to process', 95)
      return 0
    }

    const totalCount = subjects.length

    // For large datasets (>5000), use ultra-fast bulk method
    if (totalCount > 5000) {
      await this.addRealtimeLog(logId, 'info', '=== ULTRA-FAST BULK PROCESSING MODE ACTIVATED ===', 74)
      await this.addRealtimeLog(logId, 'info', `Large dataset detected (${totalCount} subjects), using optimized bulk operations`, 75)
      return this.saveSubjectsBulkUltraFast(subjects, logId)
    } else {
      // Use standard batch processing for smaller datasets
      return this.saveSubjectsBulkStandard(subjects, logId)
    }
  }

  /**
   * Ultra-fast bulk processing for large datasets
   */
  async saveSubjectsBulkUltraFast(subjects, logId) {
    const totalCount = subjects.length
    const batchSize = 1000 // Much larger batches for bulk operations

    await this.addRealtimeLog(logId, 'info', '=== SUBJECTS DATABASE BULK INSERTION STARTED ===', 75)
    await this.addRealtimeLog(logId, 'info', `Processing ${totalCount} subjects using bulk INSERT ON DUPLICATE KEY UPDATE`, 76)
    await this.addRealtimeLog(logId, 'info', `Batch size optimized to ${batchSize} for maximum performance`, 77)

    let savedCount = 0
    const overallStartTime = Date.now()

    try {
      // Process in large batches using bulk upsert
      const batches = this.chunkArray(subjects, batchSize)
      let batchNumber = 0
      const totalBatches = batches.length

      for (const batch of batches) {
        batchNumber++
        const batchStartTime = Date.now()

        await this.addRealtimeLog(logId, 'info', `Processing bulk batch ${batchNumber}/${totalBatches} (${batch.length} subjects)`, null)

        // Build bulk upsert query
        const valuesArray = []
        const params = []

        for (const subject of batch) {
          valuesArray.push('(?, ?, ?, ?, ?)')
          params.push(
            subject.subject_id,
            subject.subject_code,
            subject.subject_name,
            subject.curriculum_year,
            subject.category_id
          )
        }

        const valuesString = valuesArray.join(', ')

        // Single bulk upsert query - much faster than individual INSERTs/UPDATEs
        const bulkQuery = `
          INSERT INTO ${this.monevDb}.monev_sas_subjects 
          (subject_id, subject_code, subject_name, curriculum_year, category_id) 
          VALUES ${valuesString}
          ON DUPLICATE KEY UPDATE 
              subject_code = VALUES(subject_code),
              subject_name = VALUES(subject_name),
              curriculum_year = VALUES(curriculum_year),
              category_id = VALUES(category_id)
        `

        await this.addRealtimeLog(logId, 'debug', `Executing bulk upsert for ${batchNumber} batch with ${batch.length} records`, null)

        // Execute bulk operation
        await this.db.query(bulkQuery, params)
        savedCount += batch.length

        const batchDuration = Date.now() - batchStartTime
        const progressPercent = Math.round(75 + (savedCount / totalCount) * 20)
        const recordsPerSecond = Math.round(batch.length / (batchDuration / 1000))

        await this.addRealtimeLog(
          logId,
          'info',
          `Bulk batch ${batchNumber} completed: ${savedCount}/${totalCount} processed (${recordsPerSecond} records/sec)`,
          progressPercent
        )

        // Progress milestones for large datasets
        if (batchNumber % 5 === 0 || batchNumber === totalBatches) {
          const overallElapsed = Date.now() - overallStartTime
          const avgBatchTime = Math.round(overallElapsed / batchNumber)
          const estimatedRemaining = Math.round((totalBatches - batchNumber) * avgBatchTime / 1000)

          await this.addRealtimeLog(
            logId,
            'info',
            `Bulk progress: ${batchNumber}/${totalBatches} batches, avg ${avgBatchTime}ms/batch, ~${estimatedRemaining}s remaining`,
            null
          )
        }

        // Minimal delay for ultra-fast processing
        await this.sleep(1)
      }

      const totalProcessingTime = Date.now() - overallStartTime
      const overallRate = Math.round(totalCount / (totalProcessingTime / 1000))

      await this.addRealtimeLog(logId, 'info', '=== ULTRA-FAST BULK INSERTION COMPLETED ===', 95)
      await this.addRealtimeLog(logId, 'info', `Successfully processed ${totalCount} subjects in ${totalProcessingTime}ms`, 95)
      await this.addRealtimeLog(logId, 'info', `Ultra-fast performance: ${overallRate} subjects/sec, ${totalBatches} bulk operations`, 95)

    } catch (error) {
      await this.addRealtimeLog(logId, 'error', '=== BULK INSERTION FAILED ===', null)
      await this.addRealtimeLog(logId, 'error', `Bulk processing failed: ${error.message}`, null)
      throw error
    }

    return savedCount
  }

  /**
   * Standard bulk processing for smaller datasets
   */
  async saveSubjectsBulkStandard(subjects, logId) {
    const totalCount = subjects.length
    const batchSize = 250 // Optimized batch size for standard processing

    await this.addRealtimeLog(logId, 'info', '=== SUBJECTS DATABASE INSERTION STARTED ===', 74)
    await this.addRealtimeLog(logId, 'info', `Processing ${totalCount} subjects using optimized batch operations`, 75)
    await this.addRealtimeLog(logId, 'info', `Batch size: ${batchSize} (optimized for standard datasets)`, 76)

    let savedCount = 0
    const overallStartTime = Date.now()

    try {
      const batches = this.chunkArray(subjects, batchSize)
      let batchNumber = 0
      const totalBatches = batches.length

      for (const batch of batches) {
        batchNumber++
        const batchStartTime = Date.now()

        await this.addRealtimeLog(logId, 'info', `Processing batch ${batchNumber}/${totalBatches} (${batch.length} subjects)`, null)

        // Build bulk upsert for this batch
        const valuesArray = []
        const params = []

        for (const subject of batch) {
          valuesArray.push('(?, ?, ?, ?, ?)')
          params.push(
            subject.subject_id,
            subject.subject_code,
            subject.subject_name,
            subject.curriculum_year,
            subject.category_id
          )
        }

        const valuesString = valuesArray.join(', ')

        // Single bulk upsert query
        const bulkQuery = `
          INSERT IGNORE INTO ${this.monevDb}.monev_sas_subjects 
          (subject_id, subject_code, subject_name, curriculum_year, category_id) 
          VALUES ${valuesString}
        `

        const result = await this.db.query(bulkQuery, params)
        // For INSERT ... ON DUPLICATE KEY UPDATE, affectedRows counts both INSERT attempts and UPDATEs
        // We count actual records processed, not affectedRows
        savedCount += batch.length

        const batchDuration = Date.now() - batchStartTime
        const progressPercent = Math.round(75 + (savedCount / totalCount) * 20)
        const recordsPerSecond = Math.round(batch.length / (batchDuration / 1000))

        await this.addRealtimeLog(
          logId,
          'info',
          `Batch ${batchNumber} completed: ${savedCount}/${totalCount} processed (${recordsPerSecond} records/sec)`,
          progressPercent
        )

        await this.sleep(2) // 2ms delay
      }

      const totalProcessingTime = Date.now() - overallStartTime
      const overallRate = Math.round(totalCount / (totalProcessingTime / 1000))

      await this.addRealtimeLog(logId, 'info', '=== SUBJECTS DATABASE INSERTION COMPLETED ===', 95)
      await this.addRealtimeLog(logId, 'info', `Successfully processed ${totalCount} subjects in ${totalProcessingTime}ms`, 95)
      await this.addRealtimeLog(logId, 'info', `Performance: ${overallRate} subjects/sec using ${totalBatches} batch operations`, 95)

    } catch (error) {
      await this.addRealtimeLog(logId, 'error', '=== SUBJECTS DATABASE INSERTION FAILED ===', null)
      await this.addRealtimeLog(logId, 'error', `Batch processing failed: ${error.message}`, null)
      throw error
    }

    return savedCount
  }

  /**
   * Run complete ETL process with real-time logging
   */
  async runEtlProcess() {
    let logId = null

    try {
      logger.info('Starting ETL SAS process')

      // Create log entry
      logId = await this.createEtlLog()

      // Add real-time log: ETL process started
      await this.addRealtimeLog(logId, 'info', 'ETL SAS process started', 0)

      let totalRecords = 0
      let categoriesSaved = 0
      let subjectsSaved = 0

      // === PHASE 1: Fetch and save categories ===
      await this.addRealtimeLog(logId, 'info', '=== PHASE 1: CATEGORIES PROCESSING ===', 5)
      await this.addRealtimeLog(logId, 'info', 'Initializing categories fetch from external API...', 10)
      logger.info('Starting categories processing phase')

      try {
        // Detailed fetch logging for categories
        const categoryFetchStart = Date.now()
        await this.addRealtimeLog(logId, 'info', 'Connecting to API endpoint: https://celoe.telkomuniversity.ac.id/api/v1/course/category', 12)
        await this.addRealtimeLog(logId, 'info', 'Sending HTTP request with authentication headers...', 14)

        const categories = await this.fetchExternalApiWithLogging('/course/category', logId, 15, 22)

        const categoryFetchDuration = Date.now() - categoryFetchStart
        const categoriesCount = categories.length

        await this.addRealtimeLog(logId, 'info', `Categories fetch completed in ${categoryFetchDuration}ms`, 23)
        await this.addRealtimeLog(logId, 'info', `Total categories received: ${categoriesCount}`, 24)
        await this.addRealtimeLog(logId, 'info', `Average fetch time per category: ${Math.round(categoryFetchDuration / Math.max(categoriesCount, 1))}ms`, 25)

        if (categoriesCount > 0) {
          // Log sample category data for verification
          const sampleCategory = categories[0]
          await this.addRealtimeLog(logId, 'debug', `Sample category data: ID=${sampleCategory.category_id}, Name=${sampleCategory.category_name}`, 26)
        }

        await this.addRealtimeLog(logId, 'info', `Starting batch processing for ${categoriesCount} categories...`, 28)
        categoriesSaved = await this.saveCategories(categories, logId)
        totalRecords += categoriesSaved

        await this.addRealtimeLog(logId, 'info', `Categories phase completed: ${categoriesSaved}/${categoriesCount} records processed`, 50)
        logger.info(`Categories phase completed: Saved ${categoriesSaved} categories`)

      } catch (error) {
        await this.addRealtimeLog(logId, 'error', `Categories processing failed: ${error.message}`, null)
        throw error
      }

      // === PHASE 2: Fetch and save subjects ===
      await this.addRealtimeLog(logId, 'info', '=== PHASE 2: SUBJECTS PROCESSING ===', 52)
      await this.addRealtimeLog(logId, 'info', 'Initializing subjects fetch from external API...', 55)
      logger.info('Starting subjects processing phase')

      try {
        // Detailed fetch logging for subjects
        const subjectFetchStart = Date.now()
        await this.addRealtimeLog(logId, 'info', 'Connecting to API endpoint: https://celoe.telkomuniversity.ac.id/api/v1/course/subject', 57)
        await this.addRealtimeLog(logId, 'info', 'Sending HTTP request with authentication headers...', 59)
        await this.addRealtimeLog(logId, 'info', 'Waiting for server response... (this may take longer for large datasets)', 61)

        const subjects = await this.fetchExternalApiWithLogging('/course/subject', logId, 62, 67)

        const subjectFetchDuration = Date.now() - subjectFetchStart
        const subjectsCount = subjects.length

        await this.addRealtimeLog(logId, 'info', `Subjects fetch completed in ${subjectFetchDuration}ms`, 68)
        await this.addRealtimeLog(logId, 'info', `Total subjects received: ${subjectsCount}`, 69)
        await this.addRealtimeLog(logId, 'info', `Average fetch time per subject: ${Math.round(subjectFetchDuration / Math.max(subjectsCount, 1))}ms`, 70)

        if (subjectsCount > 0) {
          // Log sample subject data for verification
          const sampleSubject = subjects[0]
          await this.addRealtimeLog(logId, 'debug', `Sample subject data: ID=${sampleSubject.subject_id}, Code=${sampleSubject.subject_code}, Name=${sampleSubject.subject_name}`, 71)

          // Log data size analysis
          await this.addRealtimeLog(logId, 'info', `Data size analysis: ${Math.round(JSON.stringify(subjects).length / 1024 * 100) / 100} KB of subject data received`, 72)
        }

        await this.addRealtimeLog(logId, 'info', `Starting batch processing for ${subjectsCount} subjects...`, 74)
        await this.addRealtimeLog(logId, 'info', 'Initiating database insertion process for subjects...', 74.5)
        subjectsSaved = await this.saveSubjects(subjects, logId)
        totalRecords += subjectsSaved

        await this.addRealtimeLog(logId, 'info', `Subjects phase completed: ${subjectsSaved}/${subjectsCount} records processed`, 95)
        logger.info(`Subjects phase completed: Saved ${subjectsSaved} subjects`)

      } catch (error) {
        await this.addRealtimeLog(logId, 'error', `Subjects processing failed: ${error.message}`, null)
        throw error
      }

      // === COMPLETION ===
      await this.addRealtimeLog(logId, 'info', '=== ETL PROCESS COMPLETION ===', 97)

      // Calculate total execution time
      const totalExecutionTime = Date.now() - this.startTime
      await this.addRealtimeLog(logId, 'info', `Total execution time: ${totalExecutionTime}ms`, 98)
      await this.addRealtimeLog(logId, 'info', `Processing rate: ${Math.round(totalRecords / (totalExecutionTime / 1000))} records/second`, 99)

      // Update log with success
      await this.updateEtlLog(logId, 'finished', totalRecords)
      await this.addRealtimeLog(logId, 'info', `ETL SAS process completed successfully! Total: ${totalRecords} records processed (${categoriesSaved} categories + ${subjectsSaved} subjects)`, 100)

      logger.info(`ETL SAS process completed successfully. Total records: ${totalRecords} (Categories: ${categoriesSaved}, Subjects: ${subjectsSaved})`)

      return {
        status: 'success',
        total_records: totalRecords,
        categories_saved: categoriesSaved,
        subjects_saved: subjectsSaved,
        execution_time_ms: totalExecutionTime
      }

    } catch (error) {
      logger.error('ETL SAS process failed: ' + error.message)

      // Add real-time error log
      if (logId) {
        await this.addRealtimeLog(logId, 'error', `ETL SAS process failed: ${error.message}`, null)
        await this.updateEtlLog(logId, 'failed', 0)
      }

      throw error
    }
  }

  /**
   * Check if ETL process is currently running
   */
  async isEtlRunning() {
    try {
      return await this.logService.isEtlRunning('fetch_category_subject')
    } catch (error) {
      logger.error('Failed to check ETL running status:', error.message)
      return false
    }
  }

  /**
   * Add a new real-time log entry
   */
  async addRealtimeLog(logId, level, message, progress = null) {
    try {
      // Validate level
      const validLevels = ['info', 'warning', 'error', 'debug', 'progress']
      if (!validLevels.includes(level)) {
        logger.error(`Invalid log level: ${level}. Must be one of: ${validLevels.join(', ')}`)
        return false
      }

      // Validate that log_id exists
      const logExists = await this.logService.getLogById(logId)
      if (!logExists) {
        logger.error(`ETL log with ID ${logId} does not exist`)
        return false
      }

      // Use universal realtime log service
      const result = await this.realtimeLogService.createRealtimeLog(logId, level, message, {
        progress
      })
      
      logger.debug(`Realtime log inserted successfully with ID: ${result.id}`)
      return result.id

    } catch (error) {
      logger.error(`Exception in addRealtimeLog: ${error.message}`)
      // Continue execution even if logging fails
      return false
    }
  }



  /**
   * Helper to chunk an array
   */
  chunkArray(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * Helper to sleep for a given number of milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = FetchSASCategorySubjectService