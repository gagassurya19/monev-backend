const coursePerformanceController = require('../controllers/course-performance')
const validators = require('../validators/CPValidators')

const routes = [
  {
    method: 'GET',
    path: '/course',
    handler: coursePerformanceController.getCourse,
    options: {
      description: 'Get course',
      notes: 'Get the course',
      tags: ['api', 'course-performance'],
      validate: {
        query: validators.cpQuerySchema
      },
      auth: 'jwt'
    }
  },
]

module.exports = routes
