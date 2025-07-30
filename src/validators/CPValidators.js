const Joi = require('joi')

const cpValidators = {
  cpGetCourseSchema: Joi.object({
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    dosen_pengampu: Joi.string(),
    activity_type: Joi.string(),
    sort_by: Joi.string(),
    sort_order: Joi.string()
  }),
  cpGetCourseActivitiesSchema: Joi.object({
    page: Joi.number(),
    limit: Joi.number(),
    activity_type: Joi.string(),
    activity_id: Joi.string(),
    section: Joi.string()
  }),
  cpGetDetailCourseActivitySchema: Joi.object({
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    program_studi: Joi.string(),
    sort_by: Joi.string(),
    sort_order: Joi.string()
  }),
  etlTokenOnly: Joi.object({}),
  etlPagination: Joi.object({
    page: Joi.number(),
    limit: Joi.number()
  })
}

module.exports = cpValidators
