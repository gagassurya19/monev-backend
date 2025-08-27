const celoeApiGatewayService = require("./celoeapiGatewayService");
const logger = require("../utils/logger");
const database = require("../database/connection");

const sasUserLoginActivityService = {
  runCron: async function () {
    let logId = null;
    let startTime = new Date();

    try {
      // Step 1: Create log entry
      logger.info("Starting SAS Users Login ETL process...");
      logId = await sasUserLoginActivityService.createLogEntry(
        startTime,
        "in_progress"
      );

      if (!logId) {
        throw new Error("Failed to create log entry");
      }

      // Step 2: Execute API call to external API
      logger.info("Executing SAS Users Login ETL API call...");
      const apiResponse = await sasUserLoginActivityService.executeRun();

      if (!apiResponse || apiResponse.status === "failed") {
        throw new Error("API call failed or returned error response");
      }

      // Step 3: Get data and process/save to database (now handled within this method)
      logger.info("Fetching and processing data...");
      const dataResponse =
        await sasUserLoginActivityService.executeGetDataWithPagination();

      if (!dataResponse || dataResponse.status === "failed") {
        throw new Error("Data processing failed or returned error response");
      }

      // Step 4: Update log with success status
      logger.info("SAS Users Login ETL process completed successfully");
      await sasUserLoginActivityService.updateLogEntry(
        logId,
        "success",
        dataResponse.savedRecords || 0,
        startTime
      );
    } catch (error) {
      logger.error("SAS Users Login ETL process failed:", {
        message: error.message,
        stack: error.stack,
        logId: logId,
      });

      // Update log with failed status if log was created
      if (logId) {
        await sasUserLoginActivityService.updateLogEntry(
          logId,
          "failed",
          0,
          startTime
        );
      }
    }
  },

  // Create a new log entry in monev_sas_user_login_etl_logs
  createLogEntry: async function (startTime, status = "in_progress") {
    try {
      const query = `
        INSERT INTO monev_sas_user_login_etl_logs
        (type_run, start_date, status, offset, total_records)
        VALUES (?, ?, ?, ?, ?)
      `;
      const result = await database.query(query, [
        "execute_get_data_with_pagination",
        startTime,
        status,
        0, // offset
        0, // total_records
      ]);

      logger.info(
        `Created SAS user login ETL log entry with ID: ${result.insertId}`
      );
      return result.insertId;
    } catch (error) {
      logger.error(
        "Failed to create SAS user login ETL log entry:",
        error.message
      );
      return null;
    }
  },

  // Update an existing log entry
  updateLogEntry: async function (logId, status, totalRecords = 0, startTime) {
    if (!logId) return;

    try {
      const endTime = new Date();
      let duration = null;

      if (startTime) {
        const diffMs = endTime - startTime;
        const diffSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        duration = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }

      const query = `
        UPDATE monev_sas_user_login_etl_logs
        SET end_date = ?, status = ?, total_records = ?, duration = ?
        WHERE id = ?
      `;

      const result = await database.query(query, [
        endTime,
        status,
        totalRecords,
        duration,
        logId,
      ]);

      logger.info(
        `Updated SAS user login ETL log entry ${logId} with status ${status}, records: ${totalRecords}, duration: ${duration}, affected rows: ${result.affectedRows}`
      );
    } catch (error) {
      logger.error(
        "Failed to update SAS user login ETL log entry:",
        error.message
      );
    }
  },

  executeRun: async function () {
    try {
      const response =
        await celoeApiGatewayService.runSASUsersLoginActivityETL();
      logger.info("SAS Users Login ETL process started:", response);
      if (response.status === false) {
        throw new Error("SAS Users Login ETL process failed");
      }
      return response; // Return the response for the new runCron logic
    } catch (error) {
      logger.error("Scheduled SAS Users Login ETL process failed:", {
        message: error.message,
        stack: error.stack,
      });
      return { status: "failed", message: error.message }; // Return a failed response
    }
  },

  executeGetDataWithPagination: async function () {
    try {
      const limit = 50;
      const offset = 0;

      logger.info("Fetching SAS Users Login Activity data from API...");
      const response =
        await celoeApiGatewayService.getSASUsersLoginActivityETLLogs(
          limit,
          offset
        );

      if (!response || response.status === false) {
        throw new Error("API call failed or returned error response");
      }

      // Debug: Log the API response structure
      logger.info("API Response structure:", JSON.stringify(response, null, 2));
      logger.info("API Response keys:", Object.keys(response));

      // Process and save data directly after successful API response
      logger.info("Processing and saving data to database...");
      const saveResult = await this.processAndSaveDataBulk(response);

      if (saveResult.status === "failed") {
        throw new Error(`Data processing failed: ${saveResult.message}`);
      }

      logger.info("SAS Users Login Activity ETL completed successfully", {
        totalRecords: saveResult.totalRecords,
        savedRecords: saveResult.savedRecords,
        errorRecords: saveResult.errorRecords,
      });

      return {
        status: "success",
        totalRecords: saveResult.totalRecords,
        savedRecords: saveResult.savedRecords,
        errorRecords: saveResult.errorRecords,
        message: saveResult.message,
      };
    } catch (error) {
      logger.error("SAS Users Login Activity ETL failed:", {
        message: error.message,
        stack: error.stack,
      });
      return {
        status: "failed",
        message: error.message,
        totalRecords: 0,
        savedRecords: 0,
        errorRecords: 0,
      };
    }
  },

  // Bulk process API response and save to database for better performance
  processAndSaveDataBulk: async function (apiResponse) {
    try {
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        throw new Error("Invalid API response format");
      }

      // Check if data is nested differently
      let data = apiResponse.data;
      let pagination = apiResponse.pagination;

      // If data is not directly available, check for common alternative structures
      if (!data && apiResponse.result) {
        data = apiResponse.result;
        logger.info("Found data in 'result' field instead of 'data'");
      }
      if (!data && apiResponse.items) {
        data = apiResponse.items;
        logger.info("Found data in 'items' field instead of 'data'");
      }
      if (!data && apiResponse.records) {
        data = apiResponse.records;
        logger.info("Found data in 'records' field instead of 'data'");
      }

      if (!pagination && apiResponse.meta) {
        pagination = apiResponse.meta;
        logger.info("Found pagination in 'meta' field instead of 'pagination'");
      }

      // Check if data is a string that needs to be parsed
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
          logger.info("Parsed data from string to JSON");
        } catch (parseError) {
          logger.error("Failed to parse data string:", parseError.message);
        }
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        logger.error("Data is not an array. Data type:", typeof data);
        logger.error("Data structure:", JSON.stringify(data, null, 2));
        throw new Error("Data is not an array");
      }

      if (data.length === 0) {
        throw new Error("No data to process");
      }

      logger.info(`Processing ${data.length} records in bulk mode`);

      // Debug: Log the structure of the first record to understand the API response format
      logger.info("First record structure:", JSON.stringify(data[0], null, 2));
      logger.info("Available fields in first record:", Object.keys(data[0]));

      // Validate required fields for first record
      const firstRecord = data[0];

      // Check if the required fields exist in the expected structure
      let hasResponseId =
        firstRecord.response_id !== undefined &&
        firstRecord.response_id !== null;
      let hasUserId =
        firstRecord.user_id !== undefined && firstRecord.user_id !== null;
      let hasHour = firstRecord.hour !== undefined && firstRecord.hour !== null;
      let hasExtractionDate =
        firstRecord.extraction_date !== undefined &&
        firstRecord.extraction_date !== null;

      logger.info(
        `Field validation: response_id=${hasResponseId}, user_id=${hasUserId}, hour=${hasHour}, extraction_date=${hasExtractionDate}`
      );

      // Check for alternative field names that might be used
      const alternativeFields = {
        response_id: ["id", "responseId", "request_id", "requestId"],
        user_id: ["userId", "userid", "user", "uid"],
        hour: ["time_hour", "hour_of_day", "time"],
        extraction_date: [
          "date",
          "extractionDate",
          "extraction_date",
          "created_date",
          "timestamp",
        ],
      };

      // Try to find alternative field names and create field mapping
      let foundAlternativeFields = {};
      let fieldMapping = {};

      logger.info("Checking for alternative field names in first record...");
      logger.info("First record keys:", Object.keys(firstRecord));

      for (const [requiredField, alternatives] of Object.entries(
        alternativeFields
      )) {
        logger.info(
          `Checking ${requiredField}: direct field exists = ${
            firstRecord[requiredField] !== undefined &&
            firstRecord[requiredField] !== null
          }`
        );

        if (!firstRecord[requiredField]) {
          logger.info(
            `Field ${requiredField} not found, checking alternatives: ${alternatives.join(
              ", "
            )}`
          );
          for (const alt of alternatives) {
            logger.info(
              `Checking alternative ${alt}: value = ${firstRecord[alt]}`
            );
            if (firstRecord[alt] !== undefined && firstRecord[alt] !== null) {
              foundAlternativeFields[requiredField] = alt;
              fieldMapping[requiredField] = alt;
              logger.info(
                `✓ Found alternative field for ${requiredField}: ${alt} (value: ${firstRecord[alt]})`
              );
              break;
            }
          }
        } else {
          logger.info(
            `✓ Field ${requiredField} found directly with value: ${firstRecord[requiredField]}`
          );
        }
      }

      logger.info("Final field mapping:", fieldMapping);

      // If we found alternative fields, update the validation
      if (Object.keys(fieldMapping).length > 0) {
        logger.info("Using field mapping:", fieldMapping);

        // Update validation to use mapped fields
        const mappedResponseId = fieldMapping.response_id
          ? firstRecord[fieldMapping.response_id]
          : firstRecord.response_id;
        const mappedUserId = fieldMapping.user_id
          ? firstRecord[fieldMapping.user_id]
          : firstRecord.user_id;
        const mappedHour = fieldMapping.hour
          ? firstRecord[fieldMapping.hour]
          : firstRecord.hour;
        const mappedExtractionDate = fieldMapping.extraction_date
          ? firstRecord[fieldMapping.extraction_date]
          : firstRecord.extraction_date;

        // Re-validate with mapped fields
        const hasMappedResponseId =
          mappedResponseId !== undefined && mappedResponseId !== null;
        const hasMappedUserId =
          mappedUserId !== undefined && mappedUserId !== null;
        const hasMappedHour = mappedHour !== undefined && mappedHour !== null;
        const hasMappedExtractionDate =
          mappedExtractionDate !== undefined && mappedExtractionDate !== null;

        logger.info(
          `Mapped field validation: response_id=${hasMappedResponseId}, user_id=${hasMappedUserId}, hour=${hasMappedHour}, extraction_date=${hasMappedExtractionDate}`
        );

        if (
          hasMappedResponseId &&
          hasMappedUserId &&
          hasMappedHour &&
          hasMappedExtractionDate
        ) {
          // Update the first record to use mapped fields for consistency
          firstRecord.response_id = mappedResponseId;
          firstRecord.user_id = mappedUserId;
          firstRecord.hour = mappedHour;
          firstRecord.extraction_date = mappedExtractionDate;

          // Update validation flags
          hasResponseId = true;
          hasUserId = true;
          hasHour = true;
          hasExtractionDate = true;

          logger.info("Successfully mapped fields and updated first record");
          logger.info("Field mapping summary:");
          logger.info(
            `  - response_id: ${
              fieldMapping.response_id
                ? `mapped from '${fieldMapping.response_id}'`
                : "using direct field"
            }`
          );
          logger.info(
            `  - user_id: ${
              fieldMapping.user_id
                ? `mapped from '${fieldMapping.user_id}'`
                : "using direct field"
            }`
          );
          logger.info(
            `  - hour: ${
              fieldMapping.hour
                ? `mapped from '${fieldMapping.hour}'`
                : "using direct field"
            }`
          );
          logger.info(
            `  - extraction_date: ${
              fieldMapping.extraction_date
                ? `mapped from '${fieldMapping.extraction_date}'`
                : "using direct field"
            }`
          );
        }
      }

      if (!hasResponseId || !hasUserId || !hasHour || !hasExtractionDate) {
        logger.error(
          "Missing required fields. First record:",
          JSON.stringify(firstRecord, null, 2)
        );
        logger.error("Available fields:", Object.keys(firstRecord));
        if (Object.keys(foundAlternativeFields).length > 0) {
          logger.error("Alternative fields found:", foundAlternativeFields);
        }
        throw new Error(
          "Missing required fields: response_id, user_id, hour, or extraction_date"
        );
      }

      logger.info(
        `Data validation passed. First record: response_id=${firstRecord.response_id}, user_id=${firstRecord.user_id}, hour=${firstRecord.hour}, date=${firstRecord.extraction_date}`
      );

      // Prepare all records for bulk operation
      const recordsToInsert = [];
      const recordsToUpdate = [];

      logger.info("Getting existing records for duplicate checking...");
      const existingRecords = await this.getExistingRecordsBulk(
        data,
        fieldMapping
      );
      logger.info("Duplicate check completed successfully");

      // Debug: Show existing records keys
      const existingKeys = Object.keys(existingRecords);
      logger.info(
        `Existing records found: ${existingKeys.length} response_ids:`,
        existingKeys
      );

      // Categorize records for insert vs update
      logger.info(
        "Starting record categorization with field mapping:",
        fieldMapping
      );

      for (const record of data) {
        // Use response_id for duplicate detection (with field mapping)
        const responseId = fieldMapping.response_id
          ? record[fieldMapping.response_id]
          : record.response_id;
        const existingRecord = existingRecords[responseId];

        logger.info(
          `Processing record: response_id=${responseId} (from field: ${
            fieldMapping.response_id || "response_id"
          }), user_id=${record.user_id}, hour=${record.hour}, date=${
            record.extraction_date
          }`
        );

        if (existingRecord) {
          logger.info(
            `Found existing record for response_id ${responseId}, will UPDATE (ID: ${existingRecord.id})`
          );
          recordsToUpdate.push({
            id: existingRecord.id,
            data: this.transformRecordData(record, fieldMapping),
          });
        } else {
          logger.info(
            `No existing record for response_id ${responseId}, will INSERT`
          );
          recordsToInsert.push(this.transformRecordData(record, fieldMapping));
        }
      }

      logger.info(
        `Records categorized: ${recordsToInsert.length} to insert, ${recordsToUpdate.length} to update`
      );

      // Execute bulk operations
      let insertResult = { affectedRows: 0 };
      let updateResult = { affectedRows: 0 };

      if (recordsToInsert.length > 0) {
        logger.info("Starting bulk insert operation...");
        insertResult = await this.bulkInsertRecords(recordsToInsert);
        logger.info(`Bulk inserted ${insertResult.affectedRows} new records`);
      }

      if (recordsToUpdate.length > 0) {
        logger.info("Starting bulk update operation...");
        updateResult = await this.bulkUpdateRecords(recordsToUpdate);
        logger.info(
          `Bulk updated ${updateResult.affectedRows} existing records`
        );
      }

      const totalSaved = insertResult.affectedRows + updateResult.affectedRows;
      const totalErrors = data.length - totalSaved;

      logger.info(
        `Bulk processing completed. Total: ${data.length}, Saved: ${totalSaved}, Errors: ${totalErrors}`
      );

      return {
        status: "success",
        totalRecords: pagination.total_records,
        savedRecords: totalSaved,
        errorRecords: totalErrors,
        message: `Successfully processed ${totalSaved} records (${insertResult.affectedRows} inserted, ${updateResult.affectedRows} updated) with ${totalErrors} errors`,
      };
    } catch (error) {
      logger.error(
        "Failed to process and save API response data in bulk:",
        error.message
      );
      logger.error("Error stack:", error.stack);
      return {
        status: "failed",
        message: error.message,
        totalRecords: 0,
        savedRecords: 0,
        errorRecords: 0,
      };
    }
  },

  // Transform API record to database format
  transformRecordData: function (record, fieldMapping = {}) {
    const user = record.user || {};
    const roles = record.roles || {};
    const enrolments =
      record.enrolments && record.enrolments.length > 0
        ? record.enrolments[0]
        : {};

    // Use field mapping if available, otherwise use direct field names
    const responseId = fieldMapping.response_id
      ? record[fieldMapping.response_id]
      : record.response_id;
    const userId = fieldMapping.user_id
      ? record[fieldMapping.user_id]
      : record.user_id;
    const hour = fieldMapping.hour ? record[fieldMapping.hour] : record.hour;
    const extractionDate = fieldMapping.extraction_date
      ? record[fieldMapping.extraction_date]
      : record.extraction_date;

    // Log the field mapping transformation for debugging
    if (Object.keys(fieldMapping).length > 0) {
      logger.info(
        `Field mapping applied: response_id=${responseId} (from ${
          fieldMapping.response_id || "response_id"
        }), user_id=${userId} (from ${
          fieldMapping.user_id || "user_id"
        }), hour=${hour} (from ${
          fieldMapping.hour || "hour"
        }), extraction_date=${extractionDate} (from ${
          fieldMapping.extraction_date || "extraction_date"
        })`
      );
    }

    const transformedRecord = {
      response_id: parseInt(responseId) || null,
      extraction_date: extractionDate,
      hour: parseInt(hour),
      user_id: parseInt(userId),
      username: record.username,
      full_name: record.full_name,
      login_count: parseInt(record.login_count) || 0,
      first_login_time: parseInt(record.first_login_time) || null,
      last_login_time: parseInt(record.last_login_time) || null,
      is_active: parseInt(record.is_active) || 1,
      firstname: record.firstname,
      lastname: record.lastname,
      email: record.email,
      lastaccess: parseInt(record.lastaccess) || null,
      idnumber: user.idnumber || null,
      firstaccess: parseInt(user.firstaccess) || null,
      lastlogin: parseInt(user.lastlogin) || null,
      currentlogin: parseInt(user.currentlogin) || null,
      role_id: parseInt(roles.id) || null,
      role_name: roles.role_name || null,
      role_shortname: roles.role_shortname || null,
      course_id: parseInt(roles.course_id) || null,
      context_id: parseInt(roles.context_id) || null,
      context_level: parseInt(roles.context_level) || null,
      enrolid: parseInt(enrolments.id) || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Log the final transformed record for debugging
    if (Object.keys(fieldMapping).length > 0) {
      logger.info(
        `Transformed record: response_id=${transformedRecord.response_id}, user_id=${transformedRecord.user_id}, hour=${transformedRecord.hour}, extraction_date=${transformedRecord.extraction_date}`
      );
    }

    return transformedRecord;
  },

  // Get existing records in bulk for efficient duplicate checking
  getExistingRecordsBulk: async function (records, fieldMapping = {}) {
    try {
      if (records.length === 0) return {};

      // Build a more efficient query to get all existing records by response_id
      const responseIds = records
        .filter((record) => {
          const responseId = fieldMapping.response_id
            ? record[fieldMapping.response_id]
            : record.response_id;
          return responseId;
        })
        .map((record) => {
          const responseId = fieldMapping.response_id
            ? record[fieldMapping.response_id]
            : record.response_id;
          return parseInt(responseId);
        });

      if (responseIds.length === 0) {
        logger.info(
          "No response_id found in records, treating all as new records"
        );
        return {};
      }

      const placeholders = responseIds.map(() => "?").join(",");
      const query = `
        SELECT id, response_id, user_id, hour, extraction_date 
        FROM monev_sas_users_login_activity_etl 
        WHERE response_id IN (${placeholders})
      `;

      logger.info(
        `Executing bulk query to find existing records with ${responseIds.length} response_ids`
      );

      const result = await database.query(query, responseIds);

      // Create a map for quick lookup by response_id
      const existingMap = {};
      if (result && result.length > 0) {
        for (const existingRecord of result) {
          existingMap[existingRecord.response_id] = existingRecord;
        }
      }

      logger.info(
        `Found ${Object.keys(existingMap).length} existing records out of ${
          responseIds.length
        } response_ids checked`
      );
      return existingMap;
    } catch (error) {
      logger.error("Failed to get existing records in bulk:", error.message);
      throw error;
    }
  },

  // Bulk insert multiple records for better performance
  bulkInsertRecords: async function (records) {
    try {
      if (records.length === 0) return { affectedRows: 0 };

      logger.info(`Starting bulk insert for ${records.length} records...`);
      let totalAffectedRows = 0;

      // Process records without transaction for better compatibility

      try {
        for (let i = 0; i < records.length; i++) {
          const record = records[i];

          if (i % 10 === 0) {
            logger.info(`Processing record ${i + 1}/${records.length}...`);
          }

          const query = `
            INSERT INTO monev_sas_users_login_activity_etl (
              response_id, extraction_date, hour, user_id, username, full_name, 
              login_count, first_login_time, last_login_time, is_active, 
              firstname, lastname, email, lastaccess, idnumber, 
              firstaccess, lastlogin, currentlogin, role_id, role_name, 
              role_shortname, course_id, context_id, context_level, 
              enrolid, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          // Debug: Log column names for verification
          if (i === 0) {
            const columnNames = [
              "response_id",
              "extraction_date",
              "hour",
              "user_id",
              "username",
              "full_name",
              "login_count",
              "first_login_time",
              "last_login_time",
              "is_active",
              "firstname",
              "lastname",
              "email",
              "lastaccess",
              "idnumber",
              "firstaccess",
              "lastlogin",
              "currentlogin",
              "role_id",
              "role_name",
              "role_shortname",
              "course_id",
              "context_id",
              "context_level",
              "enrolid",
              "created_at",
            ];
            logger.info(`Column names (${columnNames.length}):`, columnNames);
          }

          const values = [
            record.response_id,
            record.extraction_date,
            record.hour,
            record.user_id,
            record.username,
            record.full_name,
            record.login_count,
            record.first_login_time,
            record.last_login_time,
            record.is_active,
            record.firstname,
            record.lastname,
            record.email,
            record.lastaccess,
            record.idnumber,
            record.firstaccess,
            record.lastlogin,
            record.currentlogin,
            record.role_id,
            record.role_name,
            record.role_shortname,
            record.course_id,
            record.context_id,
            record.context_level,
            record.enrolid,
            record.created_at,
          ];

          // Debug logging for column count verification
          if (i === 0) {
            logger.info(
              `Column count verification: ${values.length} values for INSERT (matches database schema)`
            );
            logger.info(`First record values:`, JSON.stringify(values));
            logger.info(`SQL Query:`, query);
            logger.info(`Placeholder count: ${query.match(/\?/g).length}`);
          }

          const result = await database.query(query, values);
          totalAffectedRows += result.affectedRows;
        }

        logger.info(
          `Bulk insert completed successfully. Total affected rows: ${totalAffectedRows}`
        );
        return { affectedRows: totalAffectedRows };
      } catch (error) {
        logger.error("Bulk insert failed during processing:", error.message);
        throw error;
      }
    } catch (error) {
      logger.error("Failed to bulk insert records:", error.message);
      logger.error("Error details:", {
        recordsCount: records.length,
        errorStack: error.stack,
      });
      throw error;
    }
  },

  // Bulk update multiple records for better performance
  bulkUpdateRecords: async function (records) {
    try {
      if (records.length === 0) return { affectedRows: 0 };

      logger.info(`Starting bulk update for ${records.length} records...`);
      let totalAffectedRows = 0;

      try {
        for (let i = 0; i < records.length; i++) {
          const record = records[i];

          if (i % 10 === 0) {
            logger.info(
              `Processing update record ${i + 1}/${records.length}...`
            );
          }

          const query = `
            UPDATE monev_sas_users_login_activity_etl SET
              response_id = ?, username = ?, full_name = ?, login_count = ?, 
              first_login_time = ?, last_login_time = ?, is_active = ?, 
              firstname = ?, lastname = ?, email = ?, lastaccess = ?, 
              idnumber = ?, firstaccess = ?, lastlogin = ?, currentlogin = ?, 
              role_id = ?, role_name = ?, role_shortname = ?, 
              course_id = ?, context_id = ?, context_level = ?, 
              enrolid = ?, updated_at = ?
            WHERE id = ?
          `;

          const values = [
            record.data.response_id,
            record.data.username,
            record.data.full_name,
            record.data.login_count,
            record.data.first_login_time,
            record.data.last_login_time,
            record.data.is_active,
            record.data.firstname,
            record.data.lastname,
            record.data.email,
            record.data.lastaccess,
            record.data.idnumber,
            record.data.firstaccess,
            record.data.lastlogin,
            record.data.currentlogin,
            record.data.role_id,
            record.data.role_name,
            record.data.role_shortname,
            record.data.course_id,
            record.data.context_id,
            record.data.context_level,
            record.data.enrolid,
            record.data.updated_at,
            record.id,
          ];

          const result = await database.query(query, values);
          totalAffectedRows += result.affectedRows;
        }

        logger.info(
          `Bulk update completed successfully. Total affected rows: ${totalAffectedRows}`
        );
        return { affectedRows: totalAffectedRows };
      } catch (error) {
        logger.error("Bulk update failed during processing:", error.message);
        throw error;
      }
    } catch (error) {
      logger.error("Failed to bulk update records:", error.message);
      logger.error("Error details:", {
        recordsCount: records.length,
        errorStack: error.stack,
      });
      throw error;
    }
  },
};

module.exports = sasUserLoginActivityService;
