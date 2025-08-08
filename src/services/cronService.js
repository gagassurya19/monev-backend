const cron = require('node-cron')
const etlCoursePerformanceService = require('./etlCoursePerformanceService')
const FetchSASCategorySubjectService = require('./fetch-sas-category-subject')
const logger = require('../utils/logger')

class CronService {
  constructor () {
    this.etlCoursePerformanceTask = null
    this.sasCategorySubjectTask = null
    this.isETLCoursePerformanceRunning = false
    this.isSASCategorySubjectRunning = false
    
    // Load configuration from environment variables
    this.config = {
      timezone: process.env.CRON_TIMEZONE || 'Asia/Jakarta',
      enabled: process.env.CRON_ENABLED === 'true',
      
      // ETL Course Performance settings
      etlCoursePerformance: {
        enabled: process.env.ETL_COURSE_PERFORMANCE_ENABLED === 'true',
        schedule: process.env.ETL_COURSE_PERFORMANCE_SCHEDULE || '0 * * * *',
        description: process.env.ETL_COURSE_PERFORMANCE_DESCRIPTION || 'Every hour at minute 0',
        timeout: parseInt(process.env.ETL_COURSE_PERFORMANCE_TIMEOUT) || 1800000,
        maxWaitTime: parseInt(process.env.ETL_COURSE_PERFORMANCE_MAX_WAIT_TIME) || 1800000
      },
      
      // SAS Category Subject settings
      sasCategorySubject: {
        enabled: process.env.SAS_CATEGORY_SUBJECT_ENABLED === 'true',
        schedule: process.env.SAS_CATEGORY_SUBJECT_SCHEDULE || '0 * * * *',
        description: process.env.SAS_CATEGORY_SUBJECT_DESCRIPTION || 'Every hour at minute 0',
        timeout: parseInt(process.env.SAS_CATEGORY_SUBJECT_TIMEOUT) || 1800000,
        maxWaitTime: parseInt(process.env.SAS_CATEGORY_SUBJECT_MAX_WAIT_TIME) || 1800000
      }
    }
  }

  // Initialize and start cron jobs
  initialize () {
    if (!this.config.enabled) {
      logger.info('Cron jobs disabled via CRON_ENABLED=false')
      return
    }

    logger.info('Initializing cron jobs for multiple ETL services')

    // Schedule ETL Course Performance if enabled
    if (this.config.etlCoursePerformance.enabled) {
      this.etlCoursePerformanceTask = cron.schedule(this.config.etlCoursePerformance.schedule, async () => {
        await this.runETLCoursePerformance()
      }, {
        scheduled: true,
        timezone: this.config.timezone
      })
      logger.info(`ETL Course Performance cron job scheduled: ${this.config.etlCoursePerformance.description}`)
    } else {
      logger.info('ETL Course Performance cron job disabled via ETL_COURSE_PERFORMANCE_ENABLED=false')
    }

    // Schedule SAS Category Subject if enabled
    if (this.config.sasCategorySubject.enabled) {
      this.sasCategorySubjectTask = cron.schedule(this.config.sasCategorySubject.schedule, async () => {
        await this.runSASCategorySubject()
      }, {
        scheduled: true,
        timezone: this.config.timezone
      })
      logger.info(`SAS Category Subject cron job scheduled: ${this.config.sasCategorySubject.description}`)
    } else {
      logger.info('SAS Category Subject cron job disabled via SAS_CATEGORY_SUBJECT_ENABLED=false')
    }

    logger.info('Multiple ETL cron jobs initialization completed')
  }

  // Run ETL Course Performance with proper waiting logic
  async runETLCoursePerformance() {
    // Check if ETL should run based on time (only at minute 00)
    if (!etlCoursePerformanceService.shouldRunETL()) {
      logger.info('ETL Course Performance process skipped - not minute 00')
      return
    }

    // If ETL is already running, wait for it to finish
    if (this.isETLCoursePerformanceRunning) {
      logger.warn('ETL Course Performance process is already running, waiting for it to finish...')
      
      // Wait for current process to finish (max wait time from config)
      let waitTime = 0
      const maxWaitTime = this.config.etlCoursePerformance.maxWaitTime
      
      while (this.isETLCoursePerformanceRunning && waitTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
        waitTime += 10000
        logger.info(`Waiting for ETL Course Performance process to finish... (${Math.round(waitTime / 1000)}s)`)
      }
      
      if (this.isETLCoursePerformanceRunning) {
        logger.error(`ETL Course Performance process is still running after ${Math.round(maxWaitTime / 1000)}s, skipping this scheduled run`)
        return
      }
      
      logger.info('Previous ETL Course Performance process finished, proceeding with new run')
    }

    try {
      this.isETLCoursePerformanceRunning = true
      logger.info('Starting scheduled ETL Course Performance process')

      // Set timeout for the ETL process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('ETL Course Performance process timeout')), this.config.etlCoursePerformance.timeout)
      })

      const etlPromise = etlCoursePerformanceService.runETL()
      
      await Promise.race([etlPromise, timeoutPromise])

      logger.info('Scheduled ETL Course Performance process completed successfully')
    } catch (error) {
      logger.error('Scheduled ETL Course Performance process failed:', {
        message: error.message,
        stack: error.stack
      })
    } finally {
      this.isETLCoursePerformanceRunning = false
    }
  }

  // Run SAS Category Subject with proper waiting logic
  async runSASCategorySubject() {
    // Check if it's minute 00 (same logic as ETL Course Performance)
    const now = new Date()
    const currentMinute = now.getMinutes()
    
    if (currentMinute !== 0) {
      logger.info('SAS Category Subject process skipped - not minute 00')
      return
    }

    // If SAS process is already running, wait for it to finish
    if (this.isSASCategorySubjectRunning) {
      logger.warn('SAS Category Subject process is already running, waiting for it to finish...')
      
      // Wait for current process to finish (max wait time from config)
      let waitTime = 0
      const maxWaitTime = this.config.sasCategorySubject.maxWaitTime
      
      while (this.isSASCategorySubjectRunning && waitTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
        waitTime += 10000
        logger.info(`Waiting for SAS Category Subject process to finish... (${Math.round(waitTime / 1000)}s)`)
      }
      
      if (this.isSASCategorySubjectRunning) {
        logger.error(`SAS Category Subject process is still running after ${Math.round(maxWaitTime / 1000)}s, skipping this scheduled run`)
        return
      }
      
      logger.info('Previous SAS Category Subject process finished, proceeding with new run')
    }

    try {
      this.isSASCategorySubjectRunning = true
      logger.info('Starting scheduled SAS Category Subject process')

      const sasService = new FetchSASCategorySubjectService()
      await sasService.init()
      
      // Set timeout for the SAS process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SAS Category Subject process timeout')), this.config.sasCategorySubject.timeout)
      })

      const sasPromise = sasService.runEtlProcess()
      
      await Promise.race([sasPromise, timeoutPromise])

      logger.info('Scheduled SAS Category Subject process completed successfully')
    } catch (error) {
      logger.error('Scheduled SAS Category Subject process failed:', {
        message: error.message,
        stack: error.stack
      })
    } finally {
      this.isSASCategorySubjectRunning = false
    }
  }

  // Start the cron jobs
  start () {
    if (this.config.etlCoursePerformance.enabled && this.etlCoursePerformanceTask) {
      this.etlCoursePerformanceTask.start()
      logger.info('ETL Course Performance cron job started')
    }
    
    if (this.config.sasCategorySubject.enabled && this.sasCategorySubjectTask) {
      this.sasCategorySubjectTask.start()
      logger.info('SAS Category Subject cron job started')
    }
    
    logger.info('All enabled cron jobs started')
  }

  // Stop the cron jobs
  stop () {
    if (this.etlCoursePerformanceTask) {
      this.etlCoursePerformanceTask.stop()
      logger.info('ETL Course Performance cron job stopped')
    }
    
    if (this.sasCategorySubjectTask) {
      this.sasCategorySubjectTask.stop()
      logger.info('SAS Category Subject cron job stopped')
    }
    
    logger.info('All cron jobs stopped')
  }

  // Destroy cron jobs
  destroy () {
    if (this.etlCoursePerformanceTask) {
      this.etlCoursePerformanceTask.destroy()
      this.etlCoursePerformanceTask = null
      logger.info('ETL Course Performance cron job destroyed')
    }
    
    if (this.sasCategorySubjectTask) {
      this.sasCategorySubjectTask.destroy()
      this.sasCategorySubjectTask = null
      logger.info('SAS Category Subject cron job destroyed')
    }
    
    logger.info('All cron jobs destroyed')
  }

  // Get cron status for all services
  getStatus () {
    const shouldRunETL = etlCoursePerformanceService.shouldRunETL()
    const now = new Date()
    const currentMinute = now.getMinutes()
    const shouldRunSAS = currentMinute === 0
    
    return {
      // Configuration
      config: {
        enabled: this.config.enabled,
        timezone: this.config.timezone,
        etlCoursePerformance: this.config.etlCoursePerformance,
        sasCategorySubject: this.config.sasCategorySubject
      },
      
      // ETL Course Performance Status
      etlCoursePerformanceScheduled: !!this.etlCoursePerformanceTask,
      etlCoursePerformanceRunning: this.etlCoursePerformanceTask ? this.etlCoursePerformanceTask.getStatus() : 'not scheduled',
      isETLCoursePerformanceCurrentlyRunning: this.isETLCoursePerformanceRunning,
      
      // SAS Category Subject Status
      sasCategorySubjectScheduled: !!this.sasCategorySubjectTask,
      sasCategorySubjectRunning: this.sasCategorySubjectTask ? this.sasCategorySubjectTask.getStatus() : 'not scheduled',
      isSASCategorySubjectCurrentlyRunning: this.isSASCategorySubjectRunning,
      
      // General Status
      schedule: '0 * * * * (Every hour at minute 0)',
      shouldRunETL,
      shouldRunSAS,
      status: (shouldRunETL || shouldRunSAS) ? 'active' : 'paused (not minute 00)',
      currentMinute
    }
  }
}

// Create singleton instance
const cronService = new CronService()

module.exports = cronService
