const Joi = require('joi')
const coursePerformanceController = require('../controllers/course-performance')
const validators = require('../validators/CPValidators')

const routes = [
  {
    method: 'GET',
    path: '/courses',
    handler: coursePerformanceController.getCourse,
    options: {
      description: 'course-performance | Get course',
      notes: 'Get the course',
      tags: ['api', 'course-performance'],
      validate: {
        query: validators.cpGetCourseSchema
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/{course_id}/activities',
    handler: coursePerformanceController.getCourseActivities,
    options: {
        description: 'course-performance | Get activities by course_id',
        tags: ['api', 'course-performance'],
        validate: {
            params: Joi.object({
                course_id: Joi.number().required().description('ID of the course')
              }),
            query: validators.cpGetCourseSchema
        },
        auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/{course_id}/{activity_type}/{activity_id}',
    handler: coursePerformanceController.getDetailActivity,
    options: {
        description: 'course-performance | Get detail activities student',
        tags: ['api', 'course-performance'],
        validate: {
            params: Joi.object({
                course_id: Joi.number().required().description("ID of the course"),
                activity_type: Joi.string().required().description('activity type: quiz | assign | resource'),
                activity_id: Joi.number().required().description('ID of the activity')
            }),
            query: validators.cpGetDetailCourseActivitySchema
        }
    }
  },

  // ETL

  {
    method: 'GET',
    path: '/etl/status',
    handler: coursePerformanceController.getStatusETLLastRun,
    options: {
      description: 'course-performance | Get ETL status',
      tags: ['api', 'course-performance'],
      validate: {
        query: validators.etlTokenOnly
      },
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/etl/history',
    handler: coursePerformanceController.getHistoryETLRun,
    options: {
      description: 'course-performance | Get ETL history',
      tags: ['api', 'course-performance'],
      validate: {
        query: validators.etlPagination
      },
      auth: 'jwt'
    }
  }
]

module.exports = routes
