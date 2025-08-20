const Joi = require('joi')

const sharedFilters = {
  university: Joi.string().allow('').optional().description('University name'),
  fakultas_id: Joi.alternatives(Joi.string(), Joi.number()).allow('').optional().description('Faculty ID'),
  prodi_id: Joi.alternatives(Joi.string(), Joi.number()).allow('').optional().description('Program ID'),
  subject_ids: Joi.string().allow('').optional().description('Comma-separated subject IDs'),
  date_start: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().description('Start date (YYYY-MM-DD)'),
  date_end: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().description('End date (YYYY-MM-DD)')
}

const SASSummaryValidators = {
  chartQuery: Joi.object({
    ...sharedFilters,
    group_by: Joi.string().valid('kampus', 'fakultas', 'prodi', 'subject').default('fakultas')
  }),

  statsQuery: Joi.object({
    ...sharedFilters
  }),

  tableQuery: Joi.object({
    ...sharedFilters,
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort_by: Joi.string().valid(
      'site', 'fakultas', 'program_studi', 'num_teacher', 'num_student',
      'file', 'video', 'forum', 'quiz', 'assignment', 'url', 'sum',
      'avg_activity_per_student_per_day'
    ).default('sum'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow('').optional()
  })
}

module.exports = SASSummaryValidators


