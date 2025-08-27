const etlStudentActivitySummaryController = require('../controllers/etlStudentActivitySummaryController')
const validators = require('../validators/etlStudentActivitySummaryValidators')

const routes = [
  {
    method: 'POST', // POST /api/etl-sas/orchestrate - Orchestrate CeLOE + Monev SAS ETL
    path: '/orchestrate',
    handler: etlStudentActivitySummaryController.orchestrateETL,
    options: {
      description: 'Orchestrate CeLOE SAS ETL then Monev SAS ETL',
      notes: 'Runs CeLOE SAS ETL first, polls until completion, then runs Monev SAS ETL and polls until finished',
      tags: ['api', 'etl', 'sas', 'orchestrate'],
      validate: {
        payload: validators.etlTriggerBody
      },
      auth: 'jwt'
    }
  },
  {
    method: 'POST', // POST /api/etl-sas/run - Manually trigger SAS ETL process
    path: '/run',
    handler: etlStudentActivitySummaryController.triggerETL,
    options: {
      description: 'Manually trigger SAS ETL process',
      notes: 'Manually trigger the SAS ETL process to extract, transform, and load student activity data',
      tags: ['api', 'etl', 'sas'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  },
  {
    method: 'POST', // POST /api/etl-sas/clean - Clean local SAS ETL data
    path: '/clean',
    handler: etlStudentActivitySummaryController.cleanLocalData,
    options: {
      description: 'Clean local SAS ETL data',
      notes: 'Clean all SAS ETL data from local database tables',
      tags: ['api', 'etl', 'sas'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET', // GET /api/etl-sas/status - Get SAS ETL status
    path: '/status',
    handler: etlStudentActivitySummaryController.getETLStatus,
    options: {
      description: 'Get SAS ETL process status',
      notes: 'Get the current status and information about SAS ETL processes',
      tags: ['api', 'etl', 'sas'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET', // GET /api/etl-sas/history - Get SAS ETL logs history
    path: '/history',
    handler: etlStudentActivitySummaryController.getETLHistory,
    options: {
      description: 'Get SAS ETL logs history',
      tags: ['api', 'etl', 'sas'],
      validate: {
        query: validators.etlPagination
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET', // GET /api/etl-sas/test-api - Test SAS API connection
    path: '/test-api',
    handler: etlStudentActivitySummaryController.testAPIConnection,
    options: {
      description: 'Test SAS API connection',
      notes: 'Test the connection to the external SAS API for ETL data fetching',
      tags: ['api', 'etl', 'sas'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  }
]

module.exports = routes
