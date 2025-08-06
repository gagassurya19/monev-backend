const celoeApiController = require('../controllers/celoeApiController')
const validators = require('../validators/celoeApiValidators')

const routes = [
  {
    method: 'GET',
    path: '/cp/etl/status',
    handler: celoeApiController.getETLStatus,
    options: {
      description: 'Get ETL status from external CELOE API',
      notes: 'Proxy endpoint to get ETL status from the external CELOE API',
      tags: ['api', 'celoe', 'etl'],
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/cp/etl/logs',
    handler: celoeApiController.getETLLogs,
    options: {
      description: 'Get ETL logs from external CELOE API',
      notes: 'Proxy endpoint to get ETL logs with pagination from the external CELOE API',
      tags: ['api', 'celoe', 'etl'],
      validate: {
        query: validators.celoeApiPagination
      },
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: '/cp/etl/run',
    handler: celoeApiController.runETL,
    options: {
      description: 'Run ETL process on external CELOE API',
      notes: 'Proxy endpoint to trigger ETL process on the external CELOE API',
      tags: ['api', 'celoe', 'etl'],
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: '/cp/etl/run-incremental',
    handler: celoeApiController.runIncrementalETL,
    options: {
      description: 'Run incremental ETL process on external CELOE API',
      notes: 'Proxy endpoint to trigger incremental ETL process on the external CELOE API',
      tags: ['api', 'celoe', 'etl'],
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: '/cp/etl/clear-stuck',
    handler: celoeApiController.clearStuckETL,
    options: {
      description: 'Clear stuck ETL processes on external CELOE API',
      notes: 'Proxy endpoint to clear stuck ETL processes on the external CELOE API',
      tags: ['api', 'celoe', 'etl'],
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: '/cp/etl/force-clear',
    handler: celoeApiController.forceClearETL,
    options: {
      description: 'Force clear all inprogress ETL processes on external CELOE API',
      notes: 'Proxy endpoint to force clear all inprogress ETL processes on the external CELOE API',
      tags: ['api', 'celoe', 'etl'],
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/cp/etl/debug',
    handler: celoeApiController.getDebugETL,
    options: {
      description: 'Get debug ETL status from external CELOE API',
      notes: 'Proxy endpoint to get debug ETL status from the external CELOE API',
      tags: ['api', 'celoe', 'etl'],
      auth: 'jwt'
    }
  }
]

module.exports = routes 