const Joi = require("joi");
const tpEtlApiController = require("../controllers/tpEtlApiController");

const routes = [
  // TP ETL Summary routes
  {
    method: "GET",
    path: "/summary",
    handler: tpEtlApiController.getSummaryData,
    options: {
      auth: "jwt",
      description: "Get TP ETL Summary data with pagination",
      notes:
        "Retrieve paginated TP ETL summary data with optional search (username, firstname, lastname, email)",
      tags: ["tp-etl", "api"],
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          search: Joi.string().optional(),
          sort_by: Joi.string().default("id"),
          sort_order: Joi.string().valid("asc", "desc").default("desc"),
          kampusId: Joi.string().optional(),
          fakultasId: Joi.string().optional(),
          prodiId: Joi.string().optional(),
          mataKuliahId: Joi.number().integer().optional(),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean(),
          status: Joi.number(),
          message: Joi.string(),
          timestamp: Joi.string(),
          data: Joi.array().items(Joi.object()),
          pagination: Joi.object({
            current_page: Joi.number(),
            limit: Joi.number(),
            total_records: Joi.number(),
            total_pages: Joi.number(),
            has_next_page: Joi.boolean(),
            has_prev_page: Joi.boolean(),
            next_page: Joi.number().allow(null),
            prev_page: Joi.number().allow(null),
          }),
        }),
      },
    },
  },

  // TP ETL Detail routes
  {
    method: "GET",
    path: "/detail",
    handler: tpEtlApiController.getDetailData,
    options: {
      auth: "jwt",
      description: "Get TP ETL Detail data with pagination and filters",
      notes:
        "Retrieve paginated TP ETL detail data with optional user_id, course_id filters, and search (component, action, target)",
      tags: ["tp-etl", "api"],
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          user_id: Joi.number().integer().optional(),
          course_id: Joi.number().integer().optional(),
          search: Joi.string().optional(),
          sort_by: Joi.string().default("id"),
          sort_order: Joi.string().valid("asc", "desc").default("desc"),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean(),
          status: Joi.number(),
          message: Joi.string(),
          timestamp: Joi.string(),
          data: Joi.array().items(Joi.object()),
          pagination: Joi.object({
            current_page: Joi.number(),
            limit: Joi.number(),
            total_records: Joi.number(),
            total_pages: Joi.number(),
            has_next_page: Joi.boolean(),
            has_prev_page: Joi.boolean(),
            next_page: Joi.number().allow(null),
            prev_page: Joi.number().allow(null),
          }),
        }),
      },
    },
  },

  // TP ETL Detail by User ID and Course ID route
  {
    method: "GET",
    path: "/detail/user/{userId}/course/{courseId}",
    handler: tpEtlApiController.getDetailByUserIdCourseId,
    options: {
      auth: "jwt",
      description: "Get TP ETL Detail by User ID and Course ID",
      notes:
        "Retrieve aggregated TP ETL detail data for a specific user and course with activity counts",
      tags: ["tp-etl", "api"],
      validate: {
        params: Joi.object({
          userId: Joi.number().integer().min(1).required(),
          courseId: Joi.number().integer().min(1).required(),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean(),
          status: Joi.number(),
          message: Joi.string(),
          timestamp: Joi.string(),
          data: Joi.object({
            user_id: Joi.number(),
            username: Joi.string(),
            firstname: Joi.string(),
            lastname: Joi.string(),
            email: Joi.string(),
            course_id: Joi.number(),
            course_name: Joi.string(),
            course_shortname: Joi.string(),
            total_activities: Joi.number(),
            quiz_logs: Joi.number(),
            forum_logs: Joi.number(),
            assign_logs: Joi.number(),
            last_activity_date: Joi.string().allow(null),
            first_activity_date: Joi.string().allow(null),
          }),
        }),
      },
    },
  },

  // TP ETL User Courses route
  {
    method: "GET",
    path: "/user-courses",
    handler: tpEtlApiController.getUserCourses,
    options: {
      auth: "jwt",
      description: "Get TP ETL User Courses",
      notes:
        "Retrieve user courses data grouped by course_id with activity statistics. Optional filter: user_id",
      tags: ["tp-etl", "api"],
      validate: {
        query: Joi.object({
          user_id: Joi.number().integer().optional(),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean(),
          status: Joi.number(),
          message: Joi.string(),
          timestamp: Joi.string(),
          data: Joi.array().items(
            Joi.object({
              course_id: Joi.number(),
              course_name: Joi.string(),
              course_shortname: Joi.string(),
              total_activities: Joi.number(),
              last_activity_date: Joi.alternatives().try(
                Joi.string(),
                Joi.date(),
                Joi.valid(null)
              ),
              first_activity_date: Joi.alternatives().try(
                Joi.string(),
                Joi.date(),
                Joi.valid(null)
              ),
            })
          ),
        }),
      },
    },
  },
];

module.exports = routes;
