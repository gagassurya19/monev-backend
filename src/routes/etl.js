const etlController = require('../controllers/etlController')
const validators = require('../validators/etlValidators')

const routes = [
  {
    method: 'POST', // POST /api/etl/run - Manually trigger ETL process
    path: '/etl/run',
    handler: etlController.triggerETL,
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
    method: 'GET', // GET /api/etl/status - Get ETL status
    path: '/etl/logs/status',
    handler: etlController.getETLStatus,
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
    path: '/etl/logs/history',
    handler: etlController.getETLHistory,
    options: {
      description: 'Get ETL logs history',
      tags: ['api', 'etl'],
      validate: {
        query: validators.etlPagination
      },
      auth: 'jwt'
    }
  }
]

module.exports = routes
