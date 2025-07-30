const Joi = require('joi')
const studentActivitySummaryController = require('../controllers/student-activity-summary')

const routes = [
  {
    method: 'GET',
    path: '/filter/fakultas',
    handler: studentActivitySummaryController.getFakultas,
    options: {
      description: 'student-activity-summary | Get filter fakultas',
      tags: ['api', 'student-activity-summary'],
      validate: {
        query: Joi.object({
            // kampus: Joi.string().description('get fakultas with kampus: bdg | jkt | pwt | sby')
        })
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/filter/prodi',
    handler: studentActivitySummaryController.getProdiByFakultas,
    options: {
      description: 'student-activity-summary | Get filter prodi',
      tags: ['api', 'student-activity-summary'],
      validate: {
        query: Joi.object({
            fakultas: Joi.string().description('id_fakultas'),
            kampus: Joi.string().description('kampus: bdg | jkt | pwt | sby')
        })
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/filter/matkul',
    handler: studentActivitySummaryController.getMatkulByProdi,
    options: {
      description: 'student-activity-summary | Get filter mata kuliah',
      tags: ['api', 'student-activity-summary'],
      validate: {
        query: Joi.object({
            prodi: Joi.string().description('id_prodi')
        })
      },
      auth: 'jwt'
    }
  },
  
  // ETL

  {
    method: 'GET',
    path: '/etl/status',
    handler: studentActivitySummaryController.getStatusETLLastRun,
    options: {
        description: 'student-activity-summary | Get status of the last etl run',
        tags: ['api', 'student-activity-summary'],
        auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/etl/history',
    handler: studentActivitySummaryController.getHistoryETLRun,
    options: {
        description: 'student-activity-summary | Get history of the last etl run',
        tags: ['api', 'student-activity-summary'],
        validate: {
            query: Joi.object({
                limit: Joi.number(),
                offset: Joi.number()
            })
        },
        auth: 'jwt'
    }
  },
]

module.exports = routes
