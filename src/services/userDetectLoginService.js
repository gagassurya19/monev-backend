const celoeApiGatewayService = require("./celoeapiGatewayService");
const logger = require("../utils/logger");
const UdlEtlLogModel = require("../models/UdlEtlLogModel");
const UdlEtlModel = require("../models/UdlEtlModel");

const enumStatus = {
  IN_PROGRESS: "in_progress",
  SUCCESS: "success",
  FAILED: "failed",
};

const enumTypeRun = {
  EXECUTE_RUN_UDL_ETL: "execute_run_udl_etl",
  EXECUTE_EXPORT_DATA: "excute_export_data",
};

const userDetectLoginService = {
  runCron: async function () {
    let logId = null;
    let startTime = new Date();

    try {
      // Step 1: Create log entry with type "execute_run_udl_etl"
      logger.info("Starting User Detect Login cron job...");
      const initialLogData = {
        type_run: enumTypeRun.EXECUTE_RUN_UDL_ETL,
        start_date: startTime,
        status: enumStatus.IN_PROGRESS,
        total_records: 0,
        offset: 0,
      };

      const logResult = await UdlEtlLogModel.create(initialLogData);
      logId = logResult.insertId;
      logger.info(`Created initial log entry with ID: ${logId}`);

      // Step 2: Run UDL ETL
      logger.info("Running UDL ETL...");
      const etlResponse = await userDetectLoginService.runEtl();

      // Step 3: Update log to "execute_export_data" type
      logger.info("Updating log to export data type...");
      await UdlEtlLogModel.update(logId, {
        type_run: enumTypeRun.EXECUTE_EXPORT_DATA,
        status: enumStatus.IN_PROGRESS,
      });

      // Step 4: Run Export data
      logger.info("Running Export Data...");
      const exportResponse = await userDetectLoginService.runExportData(logId);

      // Step 5: Update log with success status and end_date
      const endTime = new Date();
      const duration = endTime - startTime;
      const durationSeconds = Math.floor(duration / 1000);
      const durationFormatted = `${Math.floor(durationSeconds / 60)}m ${
        durationSeconds % 60
      }s`;

      await UdlEtlLogModel.update(logId, {
        end_date: endTime,
        duration: durationFormatted,
        duration_seconds: durationSeconds,
        status: enumStatus.SUCCESS,
        total_records: exportResponse.total_processed || 0,
      });

      logger.info("User Detect Login cron job completed successfully!");
      logger.info(`Total duration: ${durationFormatted}`);

      return {
        success: true,
        log_id: logId,
        etl_response: etlResponse,
        export_response: exportResponse,
        duration: durationFormatted,
        duration_seconds: durationSeconds,
        message: "User Detect Login cron job completed successfully",
      };
    } catch (error) {
      logger.error("Error running User Detect Login cron job:", error);

      // Update log with failed status if log was created
      if (logId) {
        try {
          const endTime = new Date();
          const duration = endTime - startTime;
          const durationSeconds = Math.floor(duration / 1000);
          const durationFormatted = `${Math.floor(durationSeconds / 60)}m ${
            durationSeconds % 60
          }s`;

          await UdlEtlLogModel.update(logId, {
            end_date: endTime,
            duration: durationFormatted,
            duration_seconds: durationSeconds,
            status: enumStatus.FAILED,
            total_records: 0,
          });
        } catch (logUpdateError) {
          logger.error("Error updating failed log:", logUpdateError);
        }
      }

      throw error;
    }
  },

  runEtl: async function () {
    try {
      const response = await celoeApiGatewayService.runUDLETL();
      return response;
    } catch (error) {
      logger.error("Error running UDL ETL:", error);
      throw error;
    }
  },

  runExportData: async function (existingLogId = null) {
    let logId = existingLogId;
    let startTime = new Date();
    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;

    try {
      // Step 1: Create log entry if not provided
      if (!logId) {
        logger.info("Starting UDL ETL Export Data process...");
        const logData = {
          type_run: enumTypeRun.EXECUTE_EXPORT_DATA,
          start_date: startTime,
          status: enumStatus.IN_PROGRESS,
          total_records: 0,
          offset: 0,
        };

        const logResult = await UdlEtlLogModel.create(logData);
        logId = logResult.insertId;
        logger.info(`Created log entry with ID: ${logId}`);
      } else {
        logger.info(`Using existing log entry with ID: ${logId}`);
      }

      // Step 2: Process data with pagination
      let currentPage = 1;
      const limit = 100;
      let hasNextPage = true;
      let totalRecords = 0;

      while (hasNextPage) {
        try {
          logger.info(`Processing page ${currentPage} with limit ${limit}...`);

          // Fetch data from API
          const response = await celoeApiGatewayService.exportUDLETLData(
            currentPage,
            limit
          );

          if (!response || !response.success || !response.data) {
            throw new Error(
              `Invalid response from API for page ${currentPage}`
            );
          }

          const { data, pagination, export_info } = response;

          // Update total records on first page
          if (currentPage === 1) {
            totalRecords = pagination.total_records;
            await UdlEtlLogModel.update(logId, {
              total_records: totalRecords,
              offset: 0,
            });
            logger.info(`Total records to process: ${totalRecords}`);
          }

          // Process each record in the current page
          logger.info(
            `Processing ${data.length} records from page ${currentPage}...`
          );

          for (const record of data) {
            try {
              // Prepare data for upsert
              const upsertData = {
                user_id: parseInt(record.user_id),
                username: record.username,
                firstname: record.firstname,
                lastname: record.lastname,
                email: record.email,
                lastaccess: parseInt(record.lastaccess) || 0,
                formatted_lastaccess: record.formatted_lastaccess,
                lastlogin: parseInt(record.lastlogin) || 0,
                formatted_lastlogin: record.formatted_lastlogin,
                currentlogin: parseInt(record.currentlogin) || 0,
                formatted_currentlogin: record.formatted_currentlogin,
                lastip: record.lastip,
                auth: record.auth,
                firstaccess: parseInt(record.firstaccess) || 0,
                formatted_firstaccess: record.formatted_firstaccess,
                role_id: parseInt(record.role_id) || null,
                role_name: record.role_name,
                role_shortname: record.role_shortname,
                archetype: record.archetype,
                course_id: parseInt(record.course_id) || null,
                all_role_ids: Array.isArray(record.all_role_ids)
                  ? JSON.stringify(record.all_role_ids)
                  : record.all_role_ids,
                all_role_names: Array.isArray(record.all_role_names)
                  ? JSON.stringify(record.all_role_names)
                  : record.all_role_names,
                all_role_shortnames: Array.isArray(record.all_role_shortnames)
                  ? JSON.stringify(record.all_role_shortnames)
                  : record.all_role_shortnames,
                all_archetypes: Array.isArray(record.all_archetypes)
                  ? JSON.stringify(record.all_archetypes)
                  : record.all_archetypes,
                all_course_ids: record.all_course_ids || null,
                total_courses: parseInt(record.total_courses) || 0,
                activity_hour: parseInt(record.activity_hour),
                activity_date: record.activity_date,
                login_count: parseInt(record.login_count) || 1,
                extraction_date: record.extraction_date,
              };

              // Upsert the record
              const upsertResult = await UdlEtlModel.upsert(upsertData);

              if (upsertResult.action === "created") {
                totalCreated++;
              } else if (upsertResult.action === "updated") {
                totalUpdated++;
              }

              totalProcessed++;
            } catch (recordError) {
              logger.error(
                `Error processing record ${record.user_id}:`,
                recordError
              );
              // Continue with next record
            }
          }

          // Update log with current progress
          await UdlEtlLogModel.update(logId, {
            offset: totalProcessed,
          });

          logger.info(
            `Page ${currentPage} completed. Processed: ${totalProcessed}/${totalRecords}`
          );

          // Check if there are more pages
          hasNextPage = pagination.has_next_page;
          if (hasNextPage) {
            currentPage++;
            // Add small delay to avoid overwhelming the API
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (pageError) {
          logger.error(`Error processing page ${currentPage}:`, pageError);
          throw pageError;
        }
      }

      // Step 3: Update log with progress (but not final status - that's handled by runCron)
      const endTime = new Date();
      const duration = endTime - startTime;
      const durationSeconds = Math.floor(duration / 1000);
      const durationFormatted = `${Math.floor(durationSeconds / 60)}m ${
        durationSeconds % 60
      }s`;

      // Only update progress, not final status
      await UdlEtlLogModel.update(logId, {
        total_records: totalProcessed,
      });

      logger.info(`UDL ETL Export Data completed successfully!`);
      logger.info(`Total processed: ${totalProcessed}`);
      logger.info(`Total created: ${totalCreated}`);
      logger.info(`Total updated: ${totalUpdated}`);
      logger.info(`Duration: ${durationFormatted}`);

      return {
        success: true,
        log_id: logId,
        total_processed: totalProcessed,
        total_created: totalCreated,
        total_updated: totalUpdated,
        duration: durationFormatted,
        duration_seconds: durationSeconds,
        message: "UDL ETL Export Data completed successfully",
      };
    } catch (error) {
      logger.error("Error running UDL ETL Export Data:", error);

      // Update log with failed status if log was created
      if (logId) {
        try {
          const endTime = new Date();
          const duration = endTime - startTime;
          const durationSeconds = Math.floor(duration / 1000);
          const durationFormatted = `${Math.floor(durationSeconds / 60)}m ${
            durationSeconds % 60
          }s`;

          await UdlEtlLogModel.update(logId, {
            end_date: endTime,
            duration: durationFormatted,
            duration_seconds: durationSeconds,
            status: enumStatus.FAILED,
            total_records: totalProcessed,
          });
        } catch (logUpdateError) {
          logger.error("Error updating failed log:", logUpdateError);
        }
      }

      throw error;
    }
  },
};

module.exports = userDetectLoginService;
