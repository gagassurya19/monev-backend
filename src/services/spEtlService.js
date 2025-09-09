const celoeApiGatewayService = require("./celoeapiGatewayService");
const logger = require("../utils/logger");
const database = require("../database/connection");
const SpEtlSummaryModel = require("../models/SpEtlSummaryModel");
const SpEtlDetailModel = require("../models/SpEtlDetailModel");

const enumStatus = {
  IN_PROGRESS: "in_progress",
  SUCCESS: "success",
  FAILED: "failed",
};

const enumTypeRun = {
  EXECUTE_RUN_SP_ETL: "execute_run_sp_etl",
  EXECUTE_SP_ETL_SUMMARY: "execute_sp_etl_summary",
  EXECUTE_SP_ETL_DETAIL: "execute_sp_etl_detail",
};

const spEtlService = {
  runCronSpEtl: async () => {
    // Declare variables at function scope level to access in catch block
    let startTime;
    let logId;
    let totalSummaryRecords = 0;
    let totalDetailRecords = 0;
    let finalOffset = 0;

    try {
      logger.info("Starting complete SP ETL process sequence...");

      // Create initial log entry
      startTime = new Date();
      logId = await spEtlService.createLogSpEtlLogs(
        enumTypeRun.EXECUTE_RUN_SP_ETL,
        startTime,
        enumStatus.IN_PROGRESS,
        null,
        null
      );

      // Step 1: Run main SP ETL process
      logger.info("=== Step 1: Running main SP ETL process ===");
      await spEtlService.runSpEtl(logId);
      logger.info("Main SP ETL process completed successfully");

      // Step 2: Run SP ETL Summary process
      logger.info("=== Step 2: Running SP ETL Summary process ===");
      const summaryResult = await spEtlService.runSpEtlSummary(
        logId,
        startTime
      );
      totalSummaryRecords = summaryResult.totalProcessed || 0;
      logger.info("SP ETL Summary process completed successfully");

      // Step 3: Run SP ETL Detail process
      logger.info("=== Step 3: Running SP ETL Detail process ===");
      const detailResult = await spEtlService.runSpEtlDetail(logId, startTime);
      totalDetailRecords = detailResult.totalProcessed || 0;
      finalOffset = detailResult.finalOffset || 0;
      logger.info("SP ETL Detail process completed successfully");

      logger.info(
        "=== Complete SP ETL process sequence finished successfully ==="
      );

      // Calculate final duration
      const endTime = new Date();
      const finalDuration = spEtlService.calculateDuration(startTime, endTime);

      // Calculate total records (summary + detail)
      const totalRecords = totalSummaryRecords + totalDetailRecords;

      // Update final log status with aggregated data
      await spEtlService.updateLogSpEtlLogs(
        logId,
        enumTypeRun.EXECUTE_RUN_SP_ETL,
        endTime,
        finalDuration,
        enumStatus.SUCCESS,
        totalRecords,
        finalOffset
      );
    } catch (error) {
      logger.error("SP ETL process sequence failed:", error.message);

      // Calculate duration on error
      const errorTime = new Date();
      const errorDuration = spEtlService.calculateDuration(
        startTime,
        errorTime
      );

      // Update log status on error
      try {
        await spEtlService.updateLogSpEtlLogs(
          logId,
          enumTypeRun.EXECUTE_RUN_SP_ETL,
          errorTime,
          errorDuration,
          enumStatus.FAILED,
          totalSummaryRecords + totalDetailRecords,
          finalOffset
        );
      } catch (logError) {
        logger.error("Failed to update log status:", logError.message);
      }
    }
  },

  runSpEtl: async (logId) => {
    try {
      logger.info("Starting SP ETL process...");

      const response = await celoeApiGatewayService.runSPETL();

      // Check if response is empty or has error structure
      if (!response) {
        throw new Error("API returned empty response");
      }

      // Check if response has error structure
      if (response.error || response.success === false) {
        throw new Error(
          `API returned error response: ${response.message || "Unknown error"}`
        );
      }

      // Check if response has success flag
      if (response.success !== true) {
        throw new Error(
          `API response indicates failure: ${
            response.message || "Unknown failure"
          }`
        );
      }

      // Validate required fields
      if (!response.log_id || !response.extraction_date) {
        throw new Error(
          "API response missing required fields: log_id or extraction_date"
        );
      }

      return response;
    } catch (error) {
      logger.error("SP ETL process failed:", error.message);
      throw error;
    }
  },

  runSpEtlSummary: async (logId, startTime) => {
    try {
      logger.info("Starting SP ETL summary process...");

      const batchSize = 100;
      let offset = 0;
      let hasMoreData = true;
      let totalProcessed = 0;
      let allData = [];

      // Loop until all data is exported
      while (hasMoreData) {
        logger.info(
          `Processing batch with offset: ${offset}, batch size: ${batchSize}`
        );

        const response = await celoeApiGatewayService.exportSPETLData(
          batchSize,
          "sp_etl_summary",
          offset
        );

        // Check if response is empty or has error structure
        if (!response) {
          logger.error("API returned empty response");
          break;
        }

        // Check if response has error structure
        if (
          response.error ||
          response.message === "Bad Request" ||
          response.success === false
        ) {
          logger.error("API returned error response:", response);
          break;
        }

        // Check if response has success flag
        if (response.success !== true) {
          logger.error("API response indicates failure:", response);
          break;
        }

        if (response && response.success) {
          const { export_info, data, next_offset } = response;

          if (export_info && data && Array.isArray(data)) {
            // Add current batch data to collection
            allData = allData.concat(data);
            totalProcessed += data.length;

            // Check if there's more data to fetch
            hasMoreData =
              export_info.has_more_data && !export_info.export_completed;

            if (hasMoreData) {
              // Update offset for next batch
              offset = next_offset;

              // Add small delay to avoid overwhelming the API
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } else {
            logger.error("Invalid response structure from API");
            logger.error("Expected: export_info object and data array");
            logger.error("Received:", {
              hasExportInfo: !!export_info,
              hasData: !!data,
              dataIsArray: Array.isArray(data),
              dataLength: data?.length,
              exportInfo: export_info,
            });
            break;
          }
        } else if (response && Array.isArray(response)) {
          // Fallback: API might return data directly as array
          allData = allData.concat(response);
          totalProcessed += response.length;
          hasMoreData = false; // No pagination info available
        } else {
          logger.error(`API request failed: Invalid response structure`);
          logger.error(`Response:`, JSON.stringify(response, null, 2));
          break;
        }
      }

      // Process all collected data with bulk insert
      if (allData.length > 0) {
        try {
          const result = await SpEtlSummaryModel.bulkInsert(allData);
          logger.info(
            `SP ETL summary bulk insert completed: ${result.message}`
          );
        } catch (bulkError) {
          logger.error("Bulk insert failed with details:", {
            error: bulkError.message,
            stack: bulkError.stack,
            dataLength: allData.length,
            firstRecord: allData[0],
          });
          throw bulkError; // Re-throw to be caught by outer catch
        }

        // Update log status for summary completion
        await spEtlService.updateLogSpEtlLogs(
          logId,
          enumTypeRun.EXECUTE_SP_ETL_SUMMARY,
          new Date(),
          null, // duration will be calculated later
          enumStatus.IN_PROGRESS, // Keep as in_progress until duration is calculated
          totalProcessed,
          offset
        );
      } else {
        logger.warn("No data received from API");
      }

      // Update final status with duration for summary
      const summaryEndTime = new Date();
      const summaryDuration = spEtlService.calculateDuration(
        startTime,
        summaryEndTime
      );
      await spEtlService.updateLogSpEtlLogs(
        logId,
        enumTypeRun.EXECUTE_SP_ETL_SUMMARY,
        summaryEndTime,
        summaryDuration,
        enumStatus.SUCCESS,
        totalProcessed,
        offset
      );

      // Return summary data
      return {
        totalProcessed,
        finalOffset: offset,
      };
    } catch (error) {
      logger.error("SP ETL summary process failed:", error.message);

      // Update log status on error
      try {
        await spEtlService.updateLogSpEtlLogs(
          logId,
          enumTypeRun.EXECUTE_SP_ETL_SUMMARY,
          new Date(),
          null,
          enumStatus.FAILED,
          totalProcessed,
          offset
        );
      } catch (logError) {
        logger.error("Failed to update log status:", logError.message);
      }

      // Re-throw the error to stop the process
      throw error;
    }
  },

  runSpEtlDetail: async (logId, startTime) => {
    try {
      logger.info("Starting SP ETL detail process...");

      const batchSize = 100;
      let offset = 0;
      let hasMoreData = true;
      let totalProcessed = 0;
      let allData = [];

      // Loop until all data is exported
      while (hasMoreData) {
        logger.info(
          `Processing detail batch with offset: ${offset}, batch size: ${batchSize}`
        );

        const response = await celoeApiGatewayService.exportSPETLData(
          batchSize,
          "sp_etl_detail",
          offset
        );

        // Check if response is empty or has error structure
        if (!response) {
          logger.error("API returned empty response");
          break;
        }

        // Check if response has error structure
        if (
          response.error ||
          response.message === "Bad Request" ||
          response.success === false
        ) {
          logger.error("API returned error response:", response);
          break;
        }

        // Check if response has success flag
        if (response.success !== true) {
          logger.error("API response indicates failure:", response);
          break;
        }

        if (response && response.success) {
          const { export_info, data, next_offset } = response;

          if (export_info && data && Array.isArray(data)) {
            // Add current batch data to collection
            allData = allData.concat(data);
            totalProcessed += data.length;

            // Check if there's more data to fetch
            hasMoreData =
              export_info.has_more_data && !export_info.export_completed;

            if (hasMoreData) {
              // Update offset for next batch
              offset = next_offset;

              // Add small delay to avoid overwhelming the API
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } else {
            logger.error("Invalid response structure from API for detail data");
            logger.error("Expected: export_info object and data array");
            logger.error("Received:", {
              hasExportInfo: !!export_info,
              hasData: !!data,
              dataIsArray: Array.isArray(data),
              dataLength: data?.length,
              exportInfo: export_info,
            });
            break;
          }
        } else if (response && Array.isArray(response)) {
          // Fallback: API might return data directly as array
          allData = allData.concat(response);
          totalProcessed += response.length;
          hasMoreData = false; // No pagination info available
        } else {
          logger.error(`API request failed: Invalid response structure`);
          logger.error(`Response:`, JSON.stringify(response, null, 2));
          break;
        }
      }

      // Process all collected data with bulk insert
      if (allData.length > 0) {
        try {
          const result = await SpEtlDetailModel.bulkInsert(allData);
          logger.info(`SP ETL detail bulk insert completed: ${result.message}`);

          // Update log status for detail completion
          await spEtlService.updateLogSpEtlLogs(
            logId,
            enumTypeRun.EXECUTE_SP_ETL_DETAIL,
            new Date(),
            null, // duration will be calculated later
            enumStatus.IN_PROGRESS, // Keep as in_progress until duration is calculated
            totalProcessed,
            offset
          );
        } catch (bulkError) {
          logger.error("Bulk insert failed with details:", {
            error: bulkError.message,
            stack: bulkError.stack,
            dataLength: allData.length,
            firstRecord: allData[0],
          });
          throw bulkError; // Re-throw to be caught by outer catch
        }
      } else {
        logger.warn("No detail data received from API");

        // Update log status for detail completion even with no data
        await spEtlService.updateLogSpEtlLogs(
          logId,
          enumTypeRun.EXECUTE_SP_ETL_DETAIL,
          new Date(),
          null, // duration will be calculated later
          enumStatus.IN_PROGRESS, // Keep as in_progress until duration is calculated
          0,
          offset
        );
      }

      // Update final status with duration for detail
      const detailEndTime = new Date();
      const detailDuration = spEtlService.calculateDuration(
        startTime,
        detailEndTime
      );
      await spEtlService.updateLogSpEtlLogs(
        logId,
        enumTypeRun.EXECUTE_SP_ETL_DETAIL,
        detailEndTime,
        detailDuration,
        enumStatus.SUCCESS,
        totalProcessed,
        offset
      );

      // Return detail data
      return {
        totalProcessed,
        finalOffset: offset,
      };
    } catch (error) {
      logger.error("SP ETL detail process failed:", error.message);

      // Update log status on error
      try {
        await spEtlService.updateLogSpEtlLogs(
          logId,
          enumTypeRun.EXECUTE_SP_ETL_DETAIL,
          new Date(),
          null,
          enumStatus.FAILED,
          totalProcessed,
          offset
        );
      } catch (logError) {
        logger.error("Failed to update detail log status:", logError.message);
      }

      // Re-throw the error to stop the process
      throw error;
    }
  },

  createLogSpEtlLogs: async (
    typeRun,
    startDate,
    status,
    totalRecords,
    offset
  ) => {
    try {
      const query = `INSERT INTO monev_sp_etl_logs (type_run, start_date, status, total_records, offset) VALUES (?, ?, ?, ?, ?)`;
      const values = [typeRun, startDate, status, totalRecords, offset];
      const result = await database.query(query, values);

      // Extract insertId from the result
      const insertId = result.insertId || result[0]?.insertId;
      if (!insertId) {
        throw new Error("Failed to get insert ID from database result");
      }

      return insertId;
    } catch (error) {
      logger.error("SP ETL log entry creation failed:", error.message);
      throw error;
    }
  },

  updateLogSpEtlLogs: async (
    logId,
    typeRun,
    endDate,
    duration,
    status,
    totalRecords,
    offset
  ) => {
    try {
      // Build dynamic update query based on provided parameters
      const updateFields = [];
      const values = [];

      if (typeRun !== undefined) {
        updateFields.push("type_run = ?");
        values.push(typeRun);
      }

      if (endDate !== undefined) {
        updateFields.push("end_date = ?");
        values.push(endDate);
      }

      if (duration !== undefined) {
        updateFields.push("duration = ?");
        values.push(duration);
      }

      if (status !== undefined) {
        updateFields.push("status = ?");
        values.push(status);
      }

      if (totalRecords !== undefined) {
        updateFields.push("total_records = ?");
        values.push(totalRecords);
      }

      if (offset !== undefined) {
        updateFields.push("offset = ?");
        values.push(offset);
      }

      if (updateFields.length === 0) {
        logger.warn("No fields to update for SP ETL log");
        return;
      }

      values.push(logId);

      const query = `UPDATE monev_sp_etl_logs SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;

      logger.info(`Updating SP ETL log ${logId}:`, {
        typeRun,
        endDate,
        duration,
        status,
        totalRecords,
        offset,
        updateFields,
      });

      const result = await database.query(query, values);

      return result;
    } catch (error) {
      logger.error("SP ETL log entry update failed:", error.message);
      throw error; // Re-throw the error to stop the process
    }
  },

  getLogSpEtlLogs: async (logId) => {
    try {
      const query = `SELECT * FROM monev_sp_etl_logs WHERE id = ?`;
      const values = [logId];
      const result = await database.query(query, values);

      return result;
    } catch (error) {
      logger.error("SP ETL log entry retrieval failed:", error.message);
      throw error; // Re-throw the error to stop the process
    }
  },

  calculateDuration: (startTime, endTime) => {
    const duration = endTime - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  },
};

module.exports = spEtlService;
