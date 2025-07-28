const Joi = require('joi')
const coursePerformanceController = require('../controllers/course-performance')
const validators = require('../validators/CPValidators')

const routes = [
  {
    method: 'GET',
    path: '/course-performance/courses',
    handler: coursePerformanceController.getCourse,
    options: {
      description: 'Get course',
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
    path: '/course-performance/{course_id}/activities',
    handler: coursePerformanceController.getCourseActivities,
    options: {
        description: 'Get activities by course_id',
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
    path: '/course-performance/{course_id}/{activity_type}/{activity_id}',
    handler: coursePerformanceController.getDetailActivity,
    options: {
        description: 'Get detail activities student',
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
  }
]

module.exports = routes
