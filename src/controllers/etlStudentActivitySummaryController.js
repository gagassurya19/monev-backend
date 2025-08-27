const Boom = require('@hapi/boom')
const etlStudentActivitySummaryService = require('../services/etlStudentActivitySummaryService')
const logger = require('../utils/logger')

const etlStudentActivitySummaryController = {
  // Orchestrate CeLOE SAS ETL then Monev SAS ETL
  orchestrateETL: async (request, h) => {
    const celoeApiController = require('./celoeApiController')
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const { start_date: startDate = '2024-01-01', concurrency = 4 } = request.payload || {}
    const { normalizeDateYMD } = require('../utils/helpers')
    const normalizedStartDate = normalizeDateYMD(startDate)
    const orchestrationId = `orc_sas_${Date.now()}`
    const steps = [{ name: 'celoe', status: 'running', startedAt: new Date().toISOString() }]

    // Minimal mock of h to capture controller response values
    const makeH = () => ({
      response: (val) => ({
        code: (statusCode) => ({ value: val, statusCode })
      })
    })

    // Run orchestration in background
    setImmediate(async () => {
      const bgSteps = steps
      try {
        // Step 1: CeLOE SAS ETL via controller
        const step1 = bgSteps[0]
        await celoeApiController.runSASETL({ payload: { start_date: normalizedStartDate, concurrency } }, makeH())

        let attempts = 0
        while (attempts < 180) {
          const statusResult = await celoeApiController.getSASETLStatus({}, makeH())
          const payload = statusResult?.value || statusResult
          const lastRun = payload?.data?.last_run || payload?.last_run
          // SAS ETL uses "status" field with "completed" value, not status_code
          const status = lastRun?.status
          if (status === 'completed') {
            step1.status = 'finished'
            step1.finishedAt = new Date().toISOString()
            break
          }
          if (status === 'failed' || status === 'error') throw new Error('CeLOE SAS ETL failed')
          attempts += 1
          await sleep(5000)
        }
        if (attempts >= 180) throw new Error('CeLOE SAS ETL timeout')

        // Step 2: Monev SAS ETL using local service
        logger.info('Starting Monev SAS ETL after CeLOE finished', { orchestrationId })
        const step2 = { name: 'monev', status: 'running', startedAt: new Date().toISOString() }
        bgSteps.push(step2)

        await etlStudentActivitySummaryService.runETL(normalizedStartDate, concurrency)

        attempts = 0
        while (attempts < 180) {
          const status = await etlStudentActivitySummaryService.getETLStatus()
          const isRunning = status?.isRunning
          const lastStatus = status?.lastRun?.status
          if (isRunning === false && lastStatus) {
            if (lastStatus !== 'finished') throw new Error('Monev SAS ETL failed')
            step2.status = 'finished'
            step2.finishedAt = new Date().toISOString()
            break
          }
          attempts += 1
          await sleep(5000)
        }
        if (attempts >= 180) throw new Error('Monev SAS ETL timeout')

        logger.info('SAS ETL Orchestration completed', { orchestrationId })
      } catch (error) {
        const last = (bgSteps[bgSteps.length - 1]) || bgSteps[0]
        if (last) {
          last.status = 'failed'
          last.finishedAt = new Date().toISOString()
          last.error = error?.message || String(error)
        }
        logger.error('SAS ETL Orchestration failed', { orchestrationId, error: error?.message || String(error) })
      }
    })

    // Return immediately while background job runs
    return h.response({
      success: true,
      message: 'SAS ETL Orchestration started',
      orchestrationId,
      steps
    }).code(202)
  },

  // Manually trigger SAS ETL process
  triggerETL: async (request, h) => {
    try {
      const { start_date: startDate, concurrency = 4 } = request.payload || {}

      logger.info('Manual SAS ETL trigger requested', {
        webhookToken: request.auth.credentials.token,
        start_date: startDate,
        concurrency
      })

      const result = await etlStudentActivitySummaryService.runETL(startDate, concurrency)

      return h.response({
        message: 'SAS ETL process completed successfully',
        result,
        parameters: {
          start_date: startDate,
          concurrency
        }
      }).code(200)
    } catch (error) {
      logger.error('Manual SAS ETL trigger failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('SAS ETL process failed')
    }
  },

  // Clean local SAS ETL data
  cleanLocalData: async (request, h) => {
    try {
      logger.info('Manual SAS ETL data cleanup requested', {
        webhookToken: request.auth.credentials.token
      })

      const result = await etlStudentActivitySummaryService.cleanLocalData()

      return h.response({
        message: 'SAS ETL data cleanup completed successfully',
        result
      }).code(200)
    } catch (error) {
      logger.error('Manual SAS ETL data cleanup failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('SAS ETL data cleanup failed')
    }
  },

  // Get SAS ETL status
  getETLStatus: async (request, h) => {
    try {
      const status = await etlStudentActivitySummaryService.getETLStatus()

      return h.response({
        status
      }).code(200)
    } catch (error) {
      logger.error('Get SAS ETL status failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get SAS ETL status')
    }
  },

  getETLHistory: async (request, h) => {
    try {
      logger.info('Get SAS ETL log history')

      const { limit, offset, type_run: typeRun = 'fetch_student_activity_summary' } = request.query
      const result = await etlStudentActivitySummaryService.getETLHistory(limit, offset, typeRun)

      return h.response({
        status: true,
        message: 'Get SAS ETL history completed successfully',
        data: result
      }).code(200)
    } catch (error) {
      logger.error('Get SAS ETL history failed:', error.message)
      return h.response({
        status: false,
        message: 'Failed to get SAS ETL logs history',
        error: error.message
      })
    }
  },

  // Test SAS API connection
  testAPIConnection: async (request, h) => {
    try {
      logger.info('Testing SAS API connection requested')

      const result = await etlStudentActivitySummaryService.testAPIConnection()

      return h.response({
        status: true,
        message: result.success ? 'SAS API connection test successful' : 'SAS API connection test failed',
        data: result
      }).code(result.success ? 200 : 500)
    } catch (error) {
      logger.error('SAS API connection test failed:', error.message)
      return h.response({
        status: false,
        message: 'SAS API connection test failed',
        error: error.message
      }).code(500)
    }
  }
}

module.exports = etlStudentActivitySummaryController
