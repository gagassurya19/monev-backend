const Joi = require('joi')

const cpValidators = {
  cpGetCourseSchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Token'),
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    dosen_pengampu: Joi.string(),
    activity_type: Joi.string(),
    sort_by: Joi.string(),
    sort_order: Joi.string()
  }),
  cpGetCourseActivitiesSchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Token'),
    page: Joi.number(),
    limit: Joi.number(),
    activity_type: Joi.string(),
    activity_id: Joi.string(),
    section: Joi.string()
  }),
  cpGetDetailCourseActivitySchema: Joi.object({
    token: Joi.string()
      .required()
      .description('Token'),
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    program_studi: Joi.string(),
    sort_by: Joi.string(),
    sort_order: Joi.string()
  })
}

module.exports = cpValidators
