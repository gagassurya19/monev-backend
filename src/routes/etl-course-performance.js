const etlCoursePerformanceController = require('../controllers/etlCoursePerformanceController')
const validators = require('../validators/etlCoursePerformanceValidators')

const routes = [
  {
    method: 'POST', // POST /api/etl/run - Manually trigger ETL process
    path: '/run',
    handler: etlCoursePerformanceController.triggerETL,
    options: {
      description: 'Manually trigger ETL process',
      notes: 'Manually trigger the ETL process to extract, transform, and load data from Moodle',
      tags: ['api', 'etl'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  },
  {
    method: 'POST', // POST /api/etl/clean - Clean local CP ETL data
    path: '/clean',
    handler: etlCoursePerformanceController.cleanLocalData,
    options: {
      description: 'Clean local CP ETL data',
      notes: 'Clean all CP ETL data from local database tables',
      tags: ['api', 'etl'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET', // GET /api/etl/status - Get ETL status
    path: '/status',
    handler: etlCoursePerformanceController.getETLStatus,
    options: {
      description: 'Get ETL process status',
      notes: 'Get the current status and information about ETL processes',
      tags: ['api', 'etl'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET', // GET /api/etl/logs - Get ETL logs history
    path: '/history',
    handler: etlCoursePerformanceController.getETLHistory,
    options: {
      description: 'Get ETL logs history',
      tags: ['api', 'etl'],
      validate: {
        query: validators.etlPagination
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET', // GET /api/etl/test-api - Test API connection
    path: '/test-api',
    handler: etlCoursePerformanceController.testAPIConnection,
    options: {
      description: 'Test API connection',
      notes: 'Test the connection to the external API for ETL data fetching',
      tags: ['api', 'etl'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  }
]

module.exports = routes
