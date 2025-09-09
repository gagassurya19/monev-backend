const database = require("../database/connection");
const logger = require("../utils/logger");
const ResponseService = require("../services/responseService");
const UdlEtlLogModel = require("../models/UdlEtlLogModel");
const cronService = require("../services/cronService");

const udlEtlApiController = {
  getUdlEtlLogs: async (request, h) => {
    try {
      const { page, limit, sort_by, sort_order } = request.query;

      const { filters } = request.query;

      const result = await UdlEtlLogModel.getLogsWithPagination(
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
            "UDL ETL logs retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting UDL ETL logs:", error);
      return h
        .response(ResponseService.internalError("Failed to get UDL ETL logs"))
        .code(500);
    }
  },
  getUdlEtlStatus: async (request, h) => {
    try {
      const status = cronService.getUDLETLStatus();
      return h
        .response(
          ResponseService.success(
            status,
            "UDL ETL status retrieved successfully"
          )
        )
        .code(200);
    } catch (error) {
      logger.error("Error getting UDL ETL status:", error);
      return h
        .response(ResponseService.internalError("Failed to get UDL ETL status"))
        .code(500);
    }
  },

  // Start UDL ETL continuously
  startUdlEtlContinuous: async (request, h) => {
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

      // Debug logging
      console.log("UDL ETL Controller - Parsed params:", {
        intervalSeconds,
        retryIntervalSeconds,
      });

      const result = cronService.startUdlEtlContinuous(
        intervalSeconds,
        retryIntervalSeconds
      );
      return h
        .response(ResponseService.success(result, result.message))
        .code(200);
    } catch (error) {
      logger.error("Error starting UDL ETL continuously:", error);
      return h
        .response(
          ResponseService.internalError("Failed to start UDL ETL continuously")
        )
        .code(500);
    }
  },

  // Stop UDL ETL continuously
  stopUdlEtlContinuous: async (request, h) => {
    try {
      const result = cronService.stopUdlEtlContinuous();
      return h
        .response(ResponseService.success(result, result.message))
        .code(200);
    } catch (error) {
      logger.error("Error stopping UDL ETL continuously:", error);
      return h
        .response(
          ResponseService.internalError("Failed to stop UDL ETL continuously")
        )
        .code(500);
    }
  },
};

module.exports = udlEtlApiController;
