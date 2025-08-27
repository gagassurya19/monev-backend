const Boom = require('@hapi/boom')
const { EtlCoursePerformanceService } = require('../services')
const logger = require('../utils/logger')
const database = require('../database/connection')

const etlCoursePerformanceController = {
  // Orchestrate CeLOE ETL then Monev ETL CP
  orchestrateETL: async (request, h) => {
    const celoeApiController = require('./celoeApiController')
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const { start_date = '2024-01-01', concurrency = 4 } = request.payload || {}
    const { normalizeDateYMD } = require('../utils/helpers')
    const normalizedStartDate = normalizeDateYMD(start_date)
    const orchestrationId = `orc_${Date.now()}`
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
        // Step 1: CeLOE ETL via controller
        const step1 = bgSteps[0]
        await celoeApiController.runCPETL({ payload: { start_date: normalizedStartDate, concurrency } }, makeH())

        let attempts = 0
        while (attempts < 180) {
          const statusResult = await celoeApiController.getCPETLStatus({}, makeH())
          const payload = statusResult?.value || statusResult
          const lastRun = payload?.data?.last_run || payload?.last_run
          const code = lastRun?.status_code
          if (code === 1) {
            step1.status = 'finished'
            step1.finishedAt = new Date().toISOString()
            break
          }
          if (code === 3) throw new Error('CeLOE ETL failed')
          attempts += 1
          await sleep(5000)
        }
        if (attempts >= 180) throw new Error('CeLOE ETL timeout')

        // Step 2: Monev ETL CP using local service
        logger.info('Starting Monev ETL after CeLOE finished', { orchestrationId })
        const step2 = { name: 'monev', status: 'running', startedAt: new Date().toISOString() }
        bgSteps.push(step2)

        await EtlCoursePerformanceService.runETL(normalizedStartDate, concurrency)

        attempts = 0
        while (attempts < 180) {
          const status = await EtlCoursePerformanceService.getETLStatus()
          const isRunning = status?.isRunning
          const lastStatus = status?.lastRun?.status
          if (isRunning === false && lastStatus) {
            if (lastStatus !== 'finished') throw new Error('Monev ETL failed')
            step2.status = 'finished'
            step2.finishedAt = new Date().toISOString()
            break
          }
          attempts += 1
          await sleep(5000)
        }
        if (attempts >= 180) throw new Error('Monev ETL timeout')

        logger.info('ETL Orchestration completed', { orchestrationId })
      } catch (error) {
        const last = (bgSteps[bgSteps.length - 1]) || bgSteps[0]
        if (last) {
          last.status = 'failed'
          last.finishedAt = new Date().toISOString()
          last.error = error?.message || String(error)
        }
        logger.error('ETL Orchestration failed', { orchestrationId, error: error?.message || String(error) })
      }
    })

    // Return immediately while background job runs
    return h.response({
      success: true,
      message: 'Orchestration started',
      orchestrationId,
      steps
    }).code(202)
  },
  // Manually trigger ETL process
  triggerETL: async (request, h) => {
    try {
      const { start_date, concurrency = 4 } = request.payload || {}
      
      logger.info('Manual ETL trigger requested', {
        webhookToken: request.auth.credentials.token,
        start_date,
        concurrency
      })

      const result = await EtlCoursePerformanceService.runETL(start_date, concurrency)

      return h.response({
        message: 'ETL process completed successfully',
        result,
        parameters: {
          start_date,
          concurrency
        }
      }).code(200)
    } catch (error) {
      logger.error('Manual ETL trigger failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('ETL process failed')
    }
  },

  // Clean local CP ETL data
  cleanLocalData: async (request, h) => {
    try {
      logger.info('Manual CP ETL data cleanup requested', {
        webhookToken: request.auth.credentials.token
      })

      const result = await EtlCoursePerformanceService.cleanLocalData()

      return h.response({
        message: 'CP ETL data cleanup completed successfully',
        result
      }).code(200)
    } catch (error) {
      logger.error('Manual CP ETL data cleanup failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('CP ETL data cleanup failed')
    }
  },

  // Get ETL status
  getETLStatus: async (request, h) => {
    try {
      const status = await EtlCoursePerformanceService.getETLStatus()

      return h.response({
        status
      }).code(200)
    } catch (error) {
      logger.error('Get ETL status failed:', error.message)
      if (error.isBoom) throw error
      throw Boom.badImplementation('Failed to get ETL status')
    }
  },

  getETLHistory: async (request, h) => {
    try {
      logger.info('Get log history')

      const { limit, offset } = request.query;
      const result = await EtlCoursePerformanceService.getETLHistory(limit, offset)

      return h.response({
        status: true,
        message: "Get ETL history completed successfully",
        data: result,
      }).code(200)
    } catch (error) {
      logger.error("Get ETL history failed:", error.message)
      return h.response({
        status: false,
        message: "Failed to get ETL logs history",
        error: error.message
      })
    }
  },

  // Test API connection
  testAPIConnection: async (request, h) => {
    try {
      logger.info('Testing API connection requested')

      const result = await EtlCoursePerformanceService.testAPIConnection()

      return h.response({
        status: true,
        message: result.success ? 'API connection test successful' : 'API connection test failed',
        data: result
      }).code(result.success ? 200 : 500)
    } catch (error) {
      logger.error('API connection test failed:', error.message)
      return h.response({
        status: false,
        message: 'API connection test failed',
        error: error.message
      }).code(500)
    }
  }
}

module.exports = etlCoursePerformanceController
