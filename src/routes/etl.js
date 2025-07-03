const etlController = require('../controllers/etlController');
const validators = require('../validators/etlValidators');

const routes = [
  {
    method: 'POST',
    path: '/etl/run',
    handler: etlController.triggerETL,
    options: {
      description: 'Manually trigger ETL process',
      notes: 'Manually trigger the ETL process to extract, transform, and load data from Moodle',
      tags: ['api', 'etl'],
      validate: {
        query: validators.etlQuerySchema
      },
      auth: 'webhook',
    }
  },
  {
    method: 'GET',
    path: '/etl/status',
    handler: etlController.getETLStatus,
    options: {
      description: 'Get ETL process status',
      notes: 'Get the current status and information about ETL processes',
      tags: ['api', 'etl'],
      validate: {
        query: validators.etlQuerySchema
      },
      auth: 'webhook'
    }
  }
];

module.exports = routes; 