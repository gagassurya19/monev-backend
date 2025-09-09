const database = require("../database/connection");
const logger = require("../utils/logger");
const ResponseService = require("../services/responseService");
const UdlEtlLogModel = require("../models/UdlEtlLogModel");

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
      const result = await UdlEtlLogModel.getStatus();

      return h
        .response(ResponseService.success(result, result.message))
        .code(200);
    } catch (error) {
      logger.error("Error getting UDL ETL status:", error);
      return h
        .response(ResponseService.internalError("Failed to get UDL ETL status"))
        .code(500);
    }
  },
  runUdlEtl: async (request, h) => {
    try {
      // TODO: Implement UDL ETL run functionality
      return h
        .response(
          ResponseService.success(
            null,
            "UDL ETL run functionality not implemented"
          )
        )
        .code(501);
    } catch (error) {
      logger.error("Error running UDL ETL:", error);
      return h
        .response(ResponseService.internalError("Failed to run UDL ETL"))
        .code(500);
    }
  },
  stopUdlEtl: async (request, h) => {
    try {
      // TODO: Implement UDL ETL stop functionality
      return h
        .response(
          ResponseService.success(
            null,
            "UDL ETL stop functionality not implemented"
          )
        )
        .code(501);
    } catch (error) {
      logger.error("Error stopping UDL ETL:", error);
      return h
        .response(ResponseService.internalError("Failed to stop UDL ETL"))
        .code(500);
    }
  },
};

module.exports = udlEtlApiController;
