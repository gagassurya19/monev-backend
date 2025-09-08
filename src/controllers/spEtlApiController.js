const Boom = require("@hapi/boom");
const SpEtlDetailModel = require("../models/SpEtlDetailModel");
const SpEtlSummaryModel = require("../models/SpEtlSummaryModel");
const ResponseService = require("../services/responseService");
const logger = require("../utils/logger");

const spEtlApiController = {
  // Get summary data with pagination
  getSummaryDataWithPagination: async (request, h) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sort_by = "created_at",
        sort_order = "DESC",
        kampusId,
        fakultasId,
        prodiId,
        mataKuliahId,
      } = request.query;

      const filters = {};
      if (kampusId) filters.kampusId = kampusId;
      if (fakultasId) filters.fakultasId = fakultasId;
      if (prodiId) filters.prodiId = prodiId;
      if (mataKuliahId) filters.mataKuliahId = mataKuliahId;

      const result = await SpEtlSummaryModel.getAllDataWithPagination(
        parseInt(page),
        parseInt(limit),
        search,
        sort_by,
        sort_order,
        filters
      );

      return h
        .response(
          ResponseService.pagination(
            result.data,
            result.pagination,
            "SP ETL Summary data retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error(
        "Error getting SP ETL summary data with pagination:",
        error.message
      );
      return h
        .response(
          ResponseService.internalError(
            "Failed to retrieve SP ETL summary data"
          )
        )
        .code(500);
    }
  },

  getUserAllCourse: async (request, h) => {
    try {
      const { user_id, course_id } = request.query;

      // Convert course_id to number, handle 0 as special case
      const courseId =
        course_id !== undefined ? parseInt(course_id) : undefined;

      const summary = await SpEtlDetailModel.getUserCourseSummary({
        user_id: user_id ? parseInt(user_id) : undefined,
        course_id: courseId,
      });

      return h
        .response(
          ResponseService.success(
            summary,
            "User course summary retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting user course summary:", error.message);
      return h
        .response(
          ResponseService.internalError(
            "Failed to retrieve user course summary"
          )
        )
        .code(500);
    }
  },

  getDetailDataWithPagination: async (request, h) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sort_by = "created_at",
        sort_order = "DESC",
        user_id = 0,
        course_id = 0,
      } = request.query;
      const result = await SpEtlDetailModel.getAllDataWithPagination(
        parseInt(page),
        parseInt(limit),
        search,
        sort_by,
        sort_order,
        parseInt(user_id) || 0,
        parseInt(course_id) || 0
      );
      return h
        .response(
          ResponseService.pagination(
            result.data,
            result.pagination,
            "SP ETL Detail data retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error(
        "Error getting SP ETL detail data with pagination:",
        error.message
      );
      return h
        .response(
          ResponseService.internalError("Failed to retrieve SP ETL detail data")
        )
        .code(500);
    }
  },

  getModuleTypeSummary: async (request, h) => {
    try {
      const { user_id, course_id } = request.query;
      const summary = await SpEtlDetailModel.getModuleTypeSummary({
        user_id,
        course_id,
      });
      return h
        .response(
          ResponseService.success(
            summary,
            "Module type summary retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting module type summary:", error.message);
      return h
        .response(
          ResponseService.internalError(
            "Failed to retrieve module type summary"
          )
        )
        .code(500);
    }
  },
};

module.exports = spEtlApiController;
