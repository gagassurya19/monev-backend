const Joi = require("joi");
const spEtlApiController = require("../controllers/spEtlApiController");

const routes = [
  {
    method: "GET",
    path: "/summaries",
    handler: spEtlApiController.getSummaryDataWithPagination,
    options: {
      description: "Get SP ETL summaries",
      tags: ["sp-etl", "api"],
      validate: {
        query: Joi.object({
          page: Joi.number().default(1),
          limit: Joi.number().default(10),
          search: Joi.string().default(""),
          sort_by: Joi.string().default("created_at"),
          sort_order: Joi.string().default("desc"),
          kampusId: Joi.string().optional(),
          fakultasId: Joi.string().optional(),
          prodiId: Joi.string().optional(),
          mataKuliahId: Joi.number().integer().optional(),
        }),
      },
      auth: "jwt",
    },
  },
  {
    method: "GET",
    path: "/user-all-course",
    handler: spEtlApiController.getUserAllCourse,
    options: {
      description: "Get SP ETL user all course",
      tags: ["sp-etl", "api"],
      validate: {
        query: Joi.object({
          user_id: Joi.number().default(0),
          course_id: Joi.number().default(0),
        }),
      },
      auth: "jwt",
    },
  },
  {
    method: "GET",
    path: "/details",
    handler: spEtlApiController.getDetailDataWithPagination,
    options: {
      description: "Get SP ETL detail data with pagination",
      tags: ["sp-etl", "api"],
      validate: {
        query: Joi.object({
          user_id: Joi.number().default(0),
          course_id: Joi.number().default(0),
          page: Joi.number().default(1),
          limit: Joi.number().default(10),
          search: Joi.string().default(""),
          sort_by: Joi.string().default("created_at"),
          sort_order: Joi.string().default("desc"),
        }),
      },
      auth: "jwt",
    },
  },
  {
    method: "GET",
    path: "/module-type-summary",
    handler: spEtlApiController.getModuleTypeSummary,
    options: {
      description: "Get SP ETL module type summary",
      tags: ["sp-etl", "api"],
      validate: {
        query: Joi.object({
          user_id: Joi.number().default(0),
          course_id: Joi.number().default(0),
        }),
      },
      auth: "jwt",
    },
  },
];

module.exports = routes;
