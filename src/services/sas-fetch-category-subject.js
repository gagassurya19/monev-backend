const database = require('../database/connection')
const logger = require('../utils/logger')
const config = require('../../config')
const axios = require('axios')
const LogService = require('./logService')
const RealtimeLogService = require('./realtimeLogService')

class SASFetchCategorySubjectService {
  constructor() {
    this.db = database
    this.batchSize = config.etl?.batchSize || 1000
    this.startTime = Date.now()
    
    // API configuration
    this.apiBaseUrl = process.env.EXTERNAL_API_BASE_URL || 'https://celoe.telkomuniversity.ac.id/api/v1'
    this.apiKey = process.env.EXTERNAL_API_KEY
    
    // Initialize universal services
    this.logService = new LogService()
    this.realtimeLogService = new RealtimeLogService()
    
    // ETL process control properties
    this.isRunning = false
    this.stopRequested = false
    this.currentLogId = null
    this.currentAbortController = null
    this.currentDbOperation = null
    this.processingTimeout = null
    this.processingInterval = null
  }

  /**
   * Initialize the service
   */
  async init() {
    try {
      await this.db.init()
      logger.info('SASFetchCategorySubjectService initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize SASFetchCategorySubjectService:', error.message)
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
   * Add realtime log entry
   */
  async addRealtimeLog(logId, level, message, progress = null) {
    try {
      // Validate level
      const validLevels = ['info', 'warning', 'error', 'debug', 'progress']
      if (!validLevels.includes(level)) {
        logger.error(`Invalid log level: ${level}`)
        return false
      }

      // Use realtime log service
      const result = await this.realtimeLogService.createRealtimeLog(logId, level, message, {
        progress
      })
      
      return result.id
    } catch (error) {
      logger.error(`Failed to add realtime log: ${error.message}`)
      return false
    }
  }

  /**
   * Fetch data from external API with realtime logging
   */
  async fetchExternalApiWithLogging(endpoint, logId, phase, startProgress, endProgress) {
    try {
      const url = `${this.apiBaseUrl}${endpoint}`
      
      await this.addRealtimeLog(logId, 'info', `Starting ${phase} fetch from: ${url}`, startProgress)
      
      const fetchStartTime = Date.now()
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

      const fetchDuration = Date.now() - fetchStartTime
      const data = response.data
      
      if (!data || !data.status || !data.status) {
        await this.addRealtimeLog(logId, 'error', `Invalid API response from ${endpoint}`, null)
        throw new Error('Invalid API response')
      }

      const resultData = data.data || []
      const resultCount = resultData.length

      await this.addRealtimeLog(logId, 'info', `${phase} fetch completed: ${resultCount} records in ${fetchDuration}ms`, endProgress)

      logger.info(`Successfully fetched ${phase} from ${endpoint}: ${resultCount} records`)
      return resultData
    } catch (error) {
      await this.addRealtimeLog(logId, 'error', `${phase} fetch failed: ${error.message}`, null)
      logger.error(`Failed to fetch ${phase} from ${endpoint}:`, error.message)
      throw error
    }
  }

  /**
   * Save categories to database with bulk operations and realtime logging
   */
  async saveCategories(categories, logId) {
    if (!categories || categories.length === 0) {
      await this.addRealtimeLog(logId, 'warning', 'No categories to process', 30)
      return 0
    }

    const totalCount = categories.length
    const batchSize = 100 // Optimized batch size for categories

    await this.addRealtimeLog(logId, 'info', `Starting categories processing: ${totalCount} records`, 30)

    let savedCount = 0
    const overallStartTime = Date.now()

    try {
      // Process categories using bulk upsert
      const batches = this.chunkArray(categories, batchSize)
      let batchNumber = 0
      const totalBatches = batches.length

      for (const batch of batches) {
        // Check for stop request before processing each batch
        if (this.stopRequested) {
          logger.info('ETL process stopped during categories processing')
          await this.addRealtimeLog(logId, 'warning', 'ETL process stopped during categories processing', null)
          break
        }

        batchNumber++
        const batchStartTime = Date.now()

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
          INSERT INTO monev_sas_categories 
          (category_id, category_name, category_site, category_type, category_parent_id) 
          VALUES ${valuesString}
          ON DUPLICATE KEY UPDATE 
              category_name = VALUES(category_name),
              category_site = VALUES(category_site),
              category_type = VALUES(category_type),
              category_parent_id = VALUES(category_parent_id)
        `

        // Execute bulk operation
        await this.db.query(bulkQuery, params)
        savedCount += batch.length

        const batchDuration = Date.now() - batchStartTime
        const progressPercent = Math.round(30 + (savedCount / totalCount) * 20)
        const recordsPerSecond = Math.round(batch.length / (batchDuration / 1000))

        await this.addRealtimeLog(
          logId,
          'info',
          `Categories batch ${batchNumber}/${totalBatches}: ${savedCount}/${totalCount} processed (${recordsPerSecond} records/sec)`,
          progressPercent
        )

        // Small delay to prevent overwhelming the database
        await this.sleep(1)
      }

      const totalProcessingTime = Date.now() - overallStartTime
      const overallRate = Math.round(totalCount / (totalProcessingTime / 1000))

      await this.addRealtimeLog(logId, 'info', `Categories processing completed: ${totalCount} records in ${totalProcessingTime}ms (${overallRate} records/sec)`, 50)

    } catch (error) {
      await this.addRealtimeLog(logId, 'error', `Categories processing failed: ${error.message}`, null)
      logger.error(`Categories processing failed: ${error.message}`)
      throw error
    }

    return savedCount
  }

  /**
   * Save subjects to database with bulk operations and realtime logging
   */
  async saveSubjects(subjects, logId) {
    if (!subjects || subjects.length === 0) {
      await this.addRealtimeLog(logId, 'warning', 'No subjects to process', 75)
      return 0
    }

    const totalCount = subjects.length
    const batchSize = 500 // Optimized batch size for subjects

    await this.addRealtimeLog(logId, 'info', `Starting subjects processing: ${totalCount} records`, 75)

    let savedCount = 0
    const overallStartTime = Date.now()

    try {
      // Process in batches using bulk upsert
      const batches = this.chunkArray(subjects, batchSize)
      let batchNumber = 0
      const totalBatches = batches.length

      for (const batch of batches) {
        // Check for stop request before processing each batch
        if (this.stopRequested) {
          logger.info('ETL process stopped during subjects processing')
          await this.addRealtimeLog(logId, 'warning', 'ETL process stopped during subjects processing', null)
          break
        }

        batchNumber++
        const batchStartTime = Date.now()

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

        // Single bulk upsert query
        const bulkQuery = `
          INSERT INTO monev_sas_subjects 
          (subject_id, subject_code, subject_name, curriculum_year, category_id) 
          VALUES ${valuesString}
          ON DUPLICATE KEY UPDATE 
              subject_code = VALUES(subject_code),
              subject_name = VALUES(subject_name),
              curriculum_year = VALUES(curriculum_year),
              category_id = VALUES(category_id)
        `

        // Execute bulk operation
        await this.db.query(bulkQuery, params)
        savedCount += batch.length

        const batchDuration = Date.now() - batchStartTime
        const progressPercent = Math.round(75 + (savedCount / totalCount) * 20)
        const recordsPerSecond = Math.round(batch.length / (batchDuration / 1000))

        await this.addRealtimeLog(
          logId,
          'info',
          `Subjects processing ${batchNumber}/${totalBatches}: ${savedCount}/${totalCount} processed (${recordsPerSecond} records/sec)`,
          progressPercent
        )

        // Minimal delay for processing
        await this.sleep(1)
      }

      const totalProcessingTime = Date.now() - overallStartTime
      const overallRate = Math.round(totalCount / (totalProcessingTime / 1000))

      await this.addRealtimeLog(logId, 'info', `Subjects processing completed: ${totalCount} records in ${totalProcessingTime}ms (${overallRate} records/sec)`, 95)

    } catch (error) {
      await this.addRealtimeLog(logId, 'error', `Subjects processing failed: ${error.message}`, null)
      logger.error(`Subjects processing failed: ${error.message}`)
      throw error
    }

    return savedCount
  }

  /**
   * Run complete ETL process with realtime logging
   */
  async runEtlProcess() {
    let logId = null

    try {
      // Check if already running
      if (this.isRunning) {
        throw new Error('ETL process is already running')
      }

      // Initialize process state
      this.isRunning = true
      this.stopRequested = false
      this.currentLogId = null
      this.currentAbortController = new AbortController()
      this.currentDbOperation = null
      this.processingTimeout = null
      this.processingInterval = null

      logger.info('Starting ETL SAS Category Subject process')

      // Create log entry
      logId = await this.createEtlLog()
      this.currentLogId = logId

      // Add initial realtime log
      await this.addRealtimeLog(logId, 'info', 'ETL SAS Category Subject process started', 0)

      let totalRecords = 0
      let categoriesSaved = 0
      let subjectsSaved = 0

      // === PHASE 1: Fetch and save categories ===
      await this.addRealtimeLog(logId, 'info', '=== PHASE 1: CATEGORIES PROCESSING ===', 10)
      logger.info('Starting categories processing phase')

      // Check for stop request
      if (this.stopRequested) {
        throw new Error('ETL process stopped by user request during categories phase')
      }

      try {
        const categories = await this.fetchExternalApiWithLogging('/course/category', logId, 'categories', 15, 25)

        // Check for stop request after API call
        if (this.stopRequested) {
          throw new Error('ETL process stopped by user request after fetching categories')
        }

        if (categories.length > 0) {
          categoriesSaved = await this.saveCategories(categories, logId)
          totalRecords += categoriesSaved
          logger.info(`Categories phase completed: Saved ${categoriesSaved} categories`)
        }

      } catch (error) {
        logger.error(`Categories processing failed: ${error.message}`)
        throw error
      }

      // === PHASE 2: Fetch and save subjects ===
      await this.addRealtimeLog(logId, 'info', '=== PHASE 2: SUBJECTS PROCESSING ===', 55)
      logger.info('Starting subjects processing phase')

      // Check for stop request
      if (this.stopRequested) {
        throw new Error('ETL process stopped by user request during subjects phase')
      }

      try {
        const subjects = await this.fetchExternalApiWithLogging('/course/subject', logId, 'subjects', 60, 70)

        // Check for stop request after API call
        if (this.stopRequested) {
          throw new Error('ETL process stopped by user request after fetching subjects')
        }

        if (subjects.length > 0) {
          subjectsSaved = await this.saveSubjects(subjects, logId)
          totalRecords += subjectsSaved
          logger.info(`Subjects phase completed: Saved ${subjectsSaved} subjects`)
        }

      } catch (error) {
        logger.error(`Subjects processing failed: ${error.message}`)
        throw error
      }

      // === COMPLETION ===
      const totalExecutionTime = Date.now() - this.startTime

      // Update log with success
      await this.updateEtlLog(logId, 'finished', totalRecords)
      await this.addRealtimeLog(logId, 'info', `ETL process completed successfully! Total: ${totalRecords} records (${categoriesSaved} categories + ${subjectsSaved} subjects)`, 100)
      
      logger.info(`ETL SAS Category Subject process completed successfully. Total records: ${totalRecords} (Categories: ${categoriesSaved}, Subjects: ${subjectsSaved})`)

      return {
        status: 'success',
        total_records: totalRecords,
        categories_saved: categoriesSaved,
        subjects_saved: subjectsSaved,
        execution_time_ms: totalExecutionTime
      }

    } catch (error) {
      logger.error('ETL SAS Category Subject process failed: ' + error.message)

      // Update log with failure
      if (logId) {
        await this.updateEtlLog(logId, 'failed', 0)
        await this.addRealtimeLog(logId, 'error', `ETL process failed: ${error.message}`, null)
      }

      throw error
    } finally {
      // Always cleanup process state
      this.isRunning = false
      this.currentLogId = null
      this.currentAbortController = null
      this.currentDbOperation = null
      this.processingTimeout = null
      this.processingInterval = null
      this.stopRequested = false
      
      logger.info('ETL process state cleaned up')
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
   * Stop ETL process forcefully and update logs
   */
  async stopEtlProcess() {
    try {
      if (!this.isRunning) {
        throw new Error('ETL process is not currently running')
      }

      logger.info('Force stop ETL process requested')
      
      // Set stop flag immediately
      this.stopRequested = true
      
      // Add realtime log about stop request
      if (this.currentLogId) {
        await this.addRealtimeLog(this.currentLogId, 'warning', 'ETL process stop requested by user', null)
      }
      
      // Force abort any ongoing operations
      if (this.currentAbortController) {
        logger.info('Aborting ongoing operations...')
        this.currentAbortController.abort()
      }
      
      // Clear any pending timeouts/intervals
      if (this.processingTimeout) {
        clearTimeout(this.processingTimeout)
        this.processingTimeout = null
        logger.info('Cleared processing timeout')
      }
      
      if (this.processingInterval) {
        clearInterval(this.processingInterval)
        this.processingInterval = null
        logger.info('Cleared processing interval')
      }
      
      // Force kill any ongoing database operations
      if (this.currentDbOperation) {
        try {
          // Try to kill the current database connection/operation
          if (this.db && this.db.connection) {
            // Kill any long-running queries
            await this.db.query('KILL QUERY ?', [this.db.connection.threadId])
            logger.info('Killed ongoing database query')
          }
        } catch (dbError) {
          logger.warn('Could not kill database operation:', dbError.message)
        }
      }
      
      // Wait a bit for cleanup to complete
      await this.sleep(500)
      
      // Update log status to stopped with force stop information
      if (this.currentLogId) {
        try {
          await this.updateEtlLog(this.currentLogId, 'stopped', 0)
          await this.addRealtimeLog(
            this.currentLogId, 
            'warning', 
            'ETL process forcefully stopped by user request', 
            null
          )
          
          // Add detailed stop information
          await this.addRealtimeLog(
            this.currentLogId,
            'info',
            `Process stopped at: ${new Date().toISOString()}. All operations aborted.`,
            null
          )
        } catch (logError) {
          logger.warn('Could not update logs during stop:', logError.message)
        }
      }
      
      // Reset all running state and flags
      this.isRunning = false
      this.currentLogId = null
      this.stopRequested = false
      this.currentAbortController = null
      this.currentDbOperation = null
      
      logger.info('ETL process forcefully stopped and cleaned up successfully')
      
      return {
        status: 'force_stopped',
        message: 'ETL process forcefully stopped and all operations aborted',
        stopped_at: new Date().toISOString(),
        cleanup_performed: true,
        operations_aborted: true
      }
      
    } catch (error) {
      logger.error('Failed to stop ETL process:', error.message)
      
      // Even if there's an error, try to force cleanup
      try {
        this.isRunning = false
        this.stopRequested = true
        this.currentLogId = null
        
        if (this.currentAbortController) {
          this.currentAbortController.abort()
        }
        
        if (this.processingTimeout) clearTimeout(this.processingTimeout)
        if (this.processingInterval) clearInterval(this.processingInterval)
        
        logger.info('Emergency cleanup performed despite error')
      } catch (cleanupError) {
        logger.error('Emergency cleanup also failed:', cleanupError.message)
      }
      
      throw error
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

module.exports = SASFetchCategorySubjectService
