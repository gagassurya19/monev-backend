const cron = require('node-cron')
const etlService = require('./etlService')
const logger = require('../utils/logger')

class CronService {
  constructor () {
    this.etlTask = null
    this.isETLRunning = false
  }

  // Initialize and start cron jobs
  initialize () {
    logger.info('Initializing cron jobs')

    // Schedule ETL to run every hour at minute 0
    this.etlTask = cron.schedule('0 * * * *', async () => {
      if (this.isETLRunning) {
        logger.warn('ETL process is already running, skipping this scheduled run')
        return
      }

      try {
        this.isETLRunning = true
        logger.info('Starting scheduled ETL process')

        await etlService.runETL()

        logger.info('Scheduled ETL process completed successfully')
      } catch (error) {
        logger.error('Scheduled ETL process failed:', error.message)
      } finally {
        this.isETLRunning = false
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Jakarta' // Adjust timezone as needed
    })

    logger.info('ETL cron job scheduled to run every hour at minute 0')
  }

  // Start the cron jobs
  start () {
    if (this.etlTask) {
      this.etlTask.start()
      logger.info('Cron jobs started')
    }
  }

  // Stop the cron jobs
  stop () {
    if (this.etlTask) {
      this.etlTask.stop()
      logger.info('Cron jobs stopped')
    }
  }

  // Destroy cron jobs
  destroy () {
    if (this.etlTask) {
      this.etlTask.destroy()
      this.etlTask = null
      logger.info('Cron jobs destroyed')
    }
  }

  // Get cron status
  getStatus () {
    return {
      etlScheduled: !!this.etlTask,
      etlRunning: this.etlTask ? this.etlTask.getStatus() : 'not scheduled',
      isETLCurrentlyRunning: this.isETLRunning,
      schedule: '0 * * * * (Every hour at minute 0)'
    }
  }
}

// Create singleton instance
const cronService = new CronService()

module.exports = cronService
