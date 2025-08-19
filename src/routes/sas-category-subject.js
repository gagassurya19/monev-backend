const Joi = require('joi')
const sasFetchCategorySubjectController = require('../controllers/sas-fetch-category-subject')

const routes = [
  // Test endpoint
  {
    method: 'GET',
    path: '/test-connection',
    handler: sasFetchCategorySubjectController.testConnection,
    options: {
      description: 'sas-category-subject | Test database connection',
      tags: ['api', 'sas-category-subject'],
      auth: 'jwt'
    }
  },

  // Filter endpoints
  {
    method: 'GET',
    path: '/filter/fakultas',
    handler: sasFetchCategorySubjectController.getFakultas,
    options: {
      description: 'sas-category-subject | Get filter fakultas',
      tags: ['api', 'sas-category-subject'],
      validate: {
        query: Joi.object({
          search: Joi.string().description('search fakultas'),
          page: Joi.number().description('page number'),
          limit: Joi.number().description('limit number')
        })
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/filter/prodi',
    handler: sasFetchCategorySubjectController.getProdiByFakultas,
    options: {
      description: 'sas-category-subject | Get filter prodi',
      tags: ['api', 'sas-category-subject'],
      validate: {
        query: Joi.object({
          fakultas: Joi.string().description('id_fakultas'),
          kampus: Joi.string().description('kampus: bdg | jkt | pwt | sby'),
          search: Joi.string().description('search prodi'),
          page: Joi.number().description('page number'),
          limit: Joi.number().description('limit number')
        })
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/filter/matkul',
    handler: sasFetchCategorySubjectController.getMatkulByProdi,
    options: {
      description: 'sas-category-subject | Get filter mata kuliah',
      tags: ['api', 'sas-category-subject'],
      validate: {
        query: Joi.object({
          prodi: Joi.string().description('id_prodi'),
          search: Joi.string().description('search matkul'),
          page: Joi.number().description('page number'),
          limit: Joi.number().description('limit number')
        })
      },
      auth: 'jwt'
    }
  },

  // ETL endpoints
  {
    method: 'POST',
    path: '/category-subject/run',
    handler: sasFetchCategorySubjectController.triggerSASCategorySubjectETL,
    options: {
      description: 'sas-category-subject | Trigger ETL process for fetching categories and subjects',
      tags: ['api', 'sas-category-subject'],
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/category-subject/logs',
    handler: sasFetchCategorySubjectController.getSASCategorySubjectLogs,
    options: {
      description: 'sas-category-subject | Get ETL logs history for category and subject fetching',
      tags: ['api', 'sas-category-subject'],
      validate: {
        query: Joi.object({
          limit: Joi.number().description('Number of logs to return'),
          offset: Joi.number().description('Number of logs to skip')
        })
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/{logId}',
    handler: sasFetchCategorySubjectController.getRealtimeCategorySubjectLogs,
    options: {
      description: 'sas-category-subject | Get detailed logs for specific ETL run',
      tags: ['api', 'sas-category-subject'],
      validate: {
        params: Joi.object({
          logId: Joi.number().required().description('ETL log ID')
        }),
        query: Joi.object({
          limit: Joi.number().description('Number of logs to return'),
          offset: Joi.number().description('Number of logs to skip')
        })
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/logs/{logId}/realtime',
    handler: sasFetchCategorySubjectController.streamRealtimeCategorySubjectLogs,
    options: {
      description: 'sas-category-subject | Stream real-time logs for specific ETL run',
      tags: ['api', 'sas-category-subject'],
      validate: {
        params: Joi.object({
          logId: Joi.number().required().description('ETL log ID')
        })
      },
      auth: 'jwt'
    }
  }
]

module.exports = routes
