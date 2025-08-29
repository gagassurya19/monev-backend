const celoeApiController = require('../controllers/celoeApiController')
const validators = require('../validators/celoeApiValidators')

const routes = [
  // ===== SAS (Student Activity Summary) ETL Routes =====
  {
    method: 'POST',
    path: '/sas/etl/run',
    handler: celoeApiController.runSASETL,
    options: {
      description: 'Run SAS ETL pipeline on external CELOE API',
      notes: 'Proxy endpoint to start SAS ETL pipeline on the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'sas'],
      validate: {
        payload: validators.sasETLRun
      },
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: '/sas/etl/clean',
    handler: celoeApiController.cleanSASETL,
    options: {
      description: 'Clean SAS ETL data on external CELOE API',
      notes: 'Proxy endpoint to clean all SAS ETL data on the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'sas'],
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: '/sas/etl/stop_pipeline',
    handler: celoeApiController.stopSASETL,
    options: {
      description: 'Stop SAS ETL pipeline on external CELOE API',
      notes: 'Proxy endpoint to stop running SAS ETL pipeline on the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'sas'],
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/sas/etl/logs',
    handler: celoeApiController.getSASETLLogs,
    options: {
      description: 'Get SAS ETL logs from external CELOE API',
      notes: 'Proxy endpoint to get SAS ETL logs with pagination from the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'sas'],
      validate: {
        query: validators.sasETLLogs
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/sas/etl/status',
    handler: celoeApiController.getSASETLStatus,
    options: {
      description: 'Get SAS ETL status from external CELOE API',
      notes: 'Proxy endpoint to get SAS ETL status from the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'sas'],
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/sas/etl/export',
    handler: celoeApiController.exportSASETLData,
    options: {
      description: 'Export SAS ETL data from external CELOE API',
      notes: 'Proxy endpoint to export SAS ETL data with pagination and filtering from the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'sas'],
      validate: {
        query: validators.sasETLExport
      },
      auth: 'jwt'
    }
  },

  // ===== CP (Course Performance) ETL Routes =====
  {
    method: 'POST',
    path: '/cp/etl/run',
    handler: celoeApiController.runCPETL,
    options: {
      description: 'Run CP ETL pipeline on external CELOE API',
      notes: 'Proxy endpoint to start CP ETL pipeline on the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'cp'],
      validate: {
        payload: validators.cpETLRun
      },
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: '/cp/etl/clean',
    handler: celoeApiController.cleanCPETL,
    options: {
      description: 'Clean CP ETL data on external CELOE API',
      notes: 'Proxy endpoint to clean all CP ETL data on the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'cp'],
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: '/cp/etl/stop_pipeline',
    handler: celoeApiController.stopCPETL,
    options: {
      description: 'Stop CP ETL pipeline on external CELOE API',
      notes: 'Proxy endpoint to stop running CP ETL pipeline on the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'cp'],
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/cp/etl/logs',
    handler: celoeApiController.getCPETLLogs,
    options: {
      description: 'Get CP ETL logs from external CELOE API',
      notes: 'Proxy endpoint to get CP ETL logs with pagination from the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'cp'],
      validate: {
        query: validators.cpETLLogs
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/cp/etl/status',
    handler: celoeApiController.getCPETLStatus,
    options: {
      description: 'Get CP ETL status from external CELOE API',
      notes: 'Proxy endpoint to get CP ETL status from the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'cp'],
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/cp/etl/export',
    handler: celoeApiController.exportCPETLData,
    options: {
      description: 'Export CP ETL data from external CELOE API',
      notes: 'Proxy endpoint to export CP ETL data with pagination and table filtering from the external CELOE API',
      tags: ['api', 'celoe', 'etl', 'cp'],
      validate: {
        query: validators.cpETLExport
      },
      auth: 'jwt'
    }
  }
]

module.exports = routes 