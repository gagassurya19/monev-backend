const sasSummaryController = require('../controllers/sasSummaryController')
const validators = require('../validators/SASSummaryValidators')

const routes = [
  {
    method: 'GET',
    path: '/chart',
    handler: sasSummaryController.getChart,
    options: {
      description: 'SAS | Chart aggregation',
      tags: ['api', 'sas', 'summary'],
      validate: { query: validators.chartQuery },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/stats',
    handler: sasSummaryController.getStats,
    options: {
      description: 'SAS | Stats overview',
      tags: ['api', 'sas', 'summary'],
      validate: { query: validators.statsQuery },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/table',
    handler: sasSummaryController.getTable,
    options: {
      description: 'SAS | Summary table (paginated)',
      tags: ['api', 'sas', 'summary'],
      validate: { query: validators.tableQuery },
      auth: 'jwt'
    }
  }
]

module.exports = routes


