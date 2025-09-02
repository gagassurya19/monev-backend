const TpEtlSummaryModel = require("../models/TpEtlSummaryModel");
const TpEtlDetailModel = require("../models/TpEtlDetailModel");
const TpEtlLogModel = require("../models/TpEtlLogModel");
const database = require("../database/connection");
const logger = require("../utils/logger");
const ResponseService = require("../services/responseService");

const tpEtlApiController = {
  // Get TP ETL Summary data with pagination
  getSummaryData: async (request, h) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sort_by = "id",
        sort_order = "desc",
      } = request.query;

      logger.info(`Getting TP ETL Summary data with params:`, {
        page,
        limit,
        search,
        sort_by,
        sort_order,
      });

      const result = await TpEtlSummaryModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sort_by,
        sort_order,
      });

      return h
        .response(
          ResponseService.pagination(
            result.data,
            result.pagination,
            "TP ETL Summary data retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting TP ETL Summary data:", error);
      return h
        .response(
          ResponseService.internalError("Failed to get TP ETL Summary data")
        )
        .code(500);
    }
  },

  // Get TP ETL Detail data with pagination and filters
  getDetailData: async (request, h) => {
    try {
      const {
        page = 1,
        limit = 10,
        user_id,
        course_id,
        search = "",
        sort_by = "id",
        sort_order = "desc",
      } = request.query;

      logger.info(`Getting TP ETL Detail data with params:`, {
        page,
        limit,
        user_id,
        course_id,
        search,
        sort_by,
        sort_order,
      });

      const result = await TpEtlDetailModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        user_id: user_id ? parseInt(user_id) : undefined,
        course_id: course_id ? parseInt(course_id) : undefined,
        search,
        sort_by,
        sort_order,
      });

      return h
        .response(
          ResponseService.pagination(
            result.data,
            result.pagination,
            "TP ETL Detail data retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting TP ETL Detail data:", error);
      return h
        .response(
          ResponseService.internalError("Failed to get TP ETL Detail data")
        )
        .code(500);
    }
  },

  // Get TP ETL Latest Log
  getLatestLog: async (request, h) => {
    try {
      logger.info("Getting TP ETL Latest Log");

      const query = `
				SELECT * FROM monev_tp_etl_logs 
				ORDER BY id DESC 
				LIMIT 1
			`;

      const result = await database.query(query);

      if (result && result.length > 0) {
        return h
          .response(
            ResponseService.success(
              result[0],
              "TP ETL Latest Log retrieved successfully"
            )
          )
          .code(200);
      } else {
        return h.response(ResponseService.notFound("No logs found")).code(404);
      }
    } catch (error) {
      logger.error("Error getting TP ETL Latest Log:", error);
      return h
        .response(
          ResponseService.internalError("Failed to get TP ETL Latest Log")
        )
        .code(500);
    }
  },

  // Get User Courses
  getUserCourses: async (request, h) => {
    try {
      const { user_id, course_id } = request.query;

      logger.info("Getting TP ETL User Courses with params:", {
        user_id,
        course_id,
      });

      const result = await TpEtlDetailModel.getUserCourses({
        user_id: user_id ? parseInt(user_id) : undefined,
        course_id: course_id ? parseInt(course_id) : undefined,
      });

      return h
        .response(
          ResponseService.success(
            result,
            "TP ETL User Courses retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting TP ETL User Courses:", error);
      return h
        .response(
          ResponseService.internalError("Failed to get TP ETL User Courses")
        )
        .code(500);
    }
  },

  // Get TP ETL Summary by User ID
  getSummaryByUserId: async (request, h) => {
    try {
      const { userId } = request.params;

      logger.info("Getting TP ETL Summary by User ID:", { userId });

      const result = await TpEtlSummaryModel.getByUserId(userId);

      if (result) {
        return h
          .response(
            ResponseService.success(
              result,
              "TP ETL Summary by User ID retrieved successfully"
            )
          )
          .code(200);
      } else {
        return h
          .response(
            ResponseService.notFound(
              "TP ETL Summary not found for this user ID"
            )
          )
          .code(404);
      }
    } catch (error) {
      logger.error("Error getting TP ETL Summary by User ID:", error);
      return h
        .response(
          ResponseService.internalError(
            "Failed to get TP ETL Summary by User ID"
          )
        )
        .code(500);
    }
  },

  // Get TP ETL Detail by User ID and Course ID
  getDetailByUserIdCourseId: async (request, h) => {
    try {
      const { userId, courseId } = request.params;

      logger.info("Getting TP ETL Detail by User ID and Course ID:", {
        userId,
        courseId,
      });

      const result = await TpEtlDetailModel.getByUserIdCourseId(
        userId,
        courseId
      );

      if (result) {
        return h
          .response(
            ResponseService.success(
              result,
              "TP ETL Detail by User ID and Course ID retrieved successfully"
            )
          )
          .code(200);
      } else {
        return h
          .response(
            ResponseService.notFound(
              "TP ETL Detail not found for this user ID and course ID"
            )
          )
          .code(404);
      }
    } catch (error) {
      logger.error(
        "Error getting TP ETL Detail by User ID and Course ID:",
        error
      );
      return h
        .response(
          ResponseService.internalError(
            "Failed to get TP ETL Detail by User ID and Course ID"
          )
        )
        .code(500);
    }
  },
};

module.exports = tpEtlApiController;
