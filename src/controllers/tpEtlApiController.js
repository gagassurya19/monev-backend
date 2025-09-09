const TpEtlSummaryModel = require("../models/TpEtlSummaryModel");
const TpEtlDetailModel = require("../models/TpEtlDetailModel");
const TpEtlLogModel = require("../models/TpEtlLogModel");
const cronService = require("../services/cronService");
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
        kampusId,
        fakultasId,
        prodiId,
        mataKuliahId,
      } = request.query;

      logger.info(`Getting TP ETL Summary data with params:`, {
        page,
        limit,
        search,
        sort_by,
        sort_order,
        kampusId,
        fakultasId,
        prodiId,
        mataKuliahId,
      });

      const filters = {};
      if (kampusId) filters.kampusId = kampusId;
      if (fakultasId) filters.fakultasId = fakultasId;
      if (prodiId) filters.prodiId = prodiId;
      if (mataKuliahId) filters.mataKuliahId = mataKuliahId;

      const result = await TpEtlSummaryModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sort_by,
        sort_order,
        filters,
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

  // Get User Courses
  getUserCourses: async (request, h) => {
    try {
      const { user_id } = request.query;

      logger.info("Getting TP ETL User Courses with params:", {
        user_id,
      });

      const result = await TpEtlDetailModel.getUserCourses({
        user_id: user_id ? parseInt(user_id) : undefined,
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

  getTpEtlLogs: async (request, h) => {
    try {
      const { page, limit, sort_by, sort_order } = request.query;
      const { filters } = request.query;

      logger.info(`Getting TP ETL Logs with params:`, {
        page,
        limit,
        sort_by,
        sort_order,
        filters,
      });

      const result = await TpEtlLogModel.getLogsWithPagination(
        page,
        limit,
        sort_by,
        sort_order,
        filters
      );

      return h
        .response(
          ResponseService.pagination(
            result.data,
            result.pagination,
            "TP ETL logs retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting TP ETL Logs:", error);
      return h
        .response(ResponseService.internalError("Failed to get TP ETL Logs"))
        .code(500);
    }
  },

  // Get TP ETL Status
  getTpEtlStatus: async (request, h) => {
    try {
      const status = cronService.getTPETLStatus();
      return h
        .response(
          ResponseService.success(
            status,
            "TP ETL status retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting TP ETL status:", error);
      return h
        .response(ResponseService.internalError("Failed to get TP ETL status"))
        .code(500);
    }
  },

  // Start TP ETL continuously
  startTpEtlContinuous: async (request, h) => {
    try {
      // Get parameters from payload only
      const payloadParams = request.payload || {};
      const interval = payloadParams.interval;
      const retry_interval = payloadParams.retry_interval;

      // Convert to numbers if provided (in seconds)
      const intervalSeconds = interval ? parseInt(interval) : null;
      const retryIntervalSeconds = retry_interval
        ? parseInt(retry_interval)
        : null;

      const result = cronService.startTpEtlContinuous(
        intervalSeconds,
        retryIntervalSeconds
      );
      return h
        .response(ResponseService.success(result, result.message))
        .code(200);
    } catch (error) {
      logger.error("Error starting TP ETL continuously:", error);
      return h
        .response(
          ResponseService.internalError("Failed to start TP ETL continuously")
        )
        .code(500);
    }
  },

  // Stop TP ETL continuously
  stopTpEtlContinuous: async (request, h) => {
    try {
      const result = cronService.stopTpEtlContinuous();
      return h
        .response(ResponseService.success(result, result.message))
        .code(200);
    } catch (error) {
      logger.error("Error stopping TP ETL continuously:", error);
      return h
        .response(
          ResponseService.internalError("Failed to stop TP ETL continuously")
        )
        .code(500);
    }
  },
};

module.exports = tpEtlApiController;
