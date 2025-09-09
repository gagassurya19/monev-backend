const celoeApiGatewayService = require("./celoeapiGatewayService");
const logger = require("../utils/logger");
const database = require("../database/connection");
const TpEtlLogModel = require("../models/TpEtlLogModel");
const TpEtlDetailModel = require("../models/TpEtlDetailModel");
const TpEtlSummaryModel = require("../models/TpEtlSummaryModel");

const teacherPerformanceEtlService = {
	runCron: async () => {
		let logId = null;
		const startTime = new Date();

		try {
			logger.info("Starting TP ETL cron job...");

			const concurrency = 2;

			// Create initial log entry
			const logResult = await TpEtlLogModel.create({
				process_type: "execute_run_tp_etl",
				status: "running",
				message: "Starting TP ETL process...",
				concurrency: concurrency,
				start_date: startTime,
				total_records: 0,
			});

			logId = logResult.insertId;
			logger.info(`Created TP ETL log with ID: ${logId}`);

			// Step 1: Run TP ETL process
			await TpEtlLogModel.update(logId, {
				message: "Step 1/3: Running TP ETL process...",
			});

			const responseRunTpEtl = await celoeApiGatewayService.runTPETL(
				concurrency
			);

			// Log the raw response for debugging
			logger.info(
				"Raw TP ETL API Response:",
				JSON.stringify(responseRunTpEtl, null, 2)
			);

			if (!responseRunTpEtl) {
				throw new Error("API returned empty response");
			}

			// Log the actual response for debugging
			logger.info(
				"TP ETL API Response:",
				JSON.stringify(responseRunTpEtl, null, 2)
			);

			if (responseRunTpEtl.error || responseRunTpEtl.success === false) {
				throw new Error(
					`API returned error response: ${
						responseRunTpEtl.message || "Unknown error"
					}`
				);
			}
			if (responseRunTpEtl.success !== true) {
				throw new Error(
					`API response indicates failure: ${
						responseRunTpEtl.message || "Unknown failure"
					}. Response: ${JSON.stringify(responseRunTpEtl)}`
				);
			}

			logger.info(
				"TP ETL process completed successfully, starting summary export..."
			);

			// Step 2: Export TP ETL summary data
			await TpEtlLogModel.update(logId, {
				message: "Step 2/3: Exporting TP ETL summary data...",
			});

			const summaryResult = await teacherPerformanceEtlService.runTpEtlSummary(
				logId
			);
			const summaryRecordsProcessed = summaryResult.total_records;

			logger.info(
				`Summary export completed. Total summary records processed: ${summaryRecordsProcessed}`
			);

			// Step 3: Export TP ETL detail data
			await TpEtlLogModel.update(logId, {
				message: "Step 3/3: Exporting TP ETL detail data...",
			});

			const detailResult = await teacherPerformanceEtlService.runTpEtlDetail(
				logId,
				summaryRecordsProcessed
			);
			const detailRecordsProcessed = detailResult.total_records;

			logger.info(
				`Detail export completed. Total detail records processed: ${detailRecordsProcessed}`
			);

			// Calculate total records and duration
			const totalRecordsProcessed =
				summaryRecordsProcessed + detailRecordsProcessed;
			const endTime = new Date();
			const durationSeconds = Math.floor((endTime - startTime) / 1000);

			// Update log with final status
			await TpEtlLogModel.update(logId, {
				status: "completed",
				message: `TP ETL process completed successfully. Summary: ${summaryRecordsProcessed} records, Detail: ${detailRecordsProcessed} records`,
				end_date: endTime,
				duration_seconds: durationSeconds,
				total_records: totalRecordsProcessed,
			});

			logger.info(
				`TP ETL cron job completed successfully. Summary: ${summaryRecordsProcessed} records, Detail: ${detailRecordsProcessed} records, Total: ${totalRecordsProcessed}, Duration: ${durationSeconds} seconds`
			);

			return {
				success: true,
				message: "TP ETL process completed successfully",
				summary_records: summaryRecordsProcessed,
				detail_records: detailRecordsProcessed,
				total_records: totalRecordsProcessed,
				duration_seconds: durationSeconds,
			};
		} catch (error) {
			logger.error("Error in TP ETL cron job:", error);

			// Update log with error status if log was created
			if (logId) {
				const endTime = new Date();
				const durationSeconds = Math.floor((endTime - startTime) / 1000);

				await TpEtlLogModel.update(logId, {
					status: "failed",
					message: `TP ETL process failed: ${error.message}`,
					end_date: endTime,
					duration_seconds: durationSeconds,
				});
			}

			throw error;
		}
	},

	// Method to export TP ETL summary data with pagination and processing
	runTpEtlSummary: async (existingLogId = null) => {
		try {
			logger.info("Starting TP ETL summary process...");

			// Export TP ETL summary data with pagination
			let currentPage = 1;
			let totalRecordsProcessed = 0;
			let hasMoreData = true;

			while (hasMoreData) {
				logger.info(`Processing page ${currentPage} of TP ETL summary data...`);

				const response = await celoeApiGatewayService.exportTPETLData(
					currentPage,
					100, // per_page
					"summary",
					"id",
					"desc"
				);

				if (!response) {
					throw new Error("API returned empty response for summary export");
				}

				// Log the actual response for debugging
				logger.info(
					`Summary Export API Response (Page ${currentPage}):`,
					JSON.stringify(response, null, 2)
				);

				if (response.error || response.success === false) {
					throw new Error(
						`API returned error response for summary export: ${
							response.message || "Unknown error"
						}`
					);
				}
				if (response.success !== true) {
					throw new Error(
						`API response indicates failure for summary export: ${
							response.message || "Unknown failure"
						}. Response: ${JSON.stringify(response)}`
					);
				}

				// Process the data
				if (response.data && Array.isArray(response.data)) {
					let pageRecordsProcessed = 0;

					for (const record of response.data) {
						try {
							// Transform the data to match our model structure
							const summaryData = {
								user_id: parseInt(record.user_id),
								username: record.username,
								firstname: record.firstname,
								lastname: record.lastname,
								email: record.email,
								total_courses_taught:
									parseInt(record.total_courses_taught) || 0,
								total_activities: parseInt(record.total_activities) || 0,
								forum_replies: parseInt(record.forum_replies) || 0,
								assignment_feedback_count:
									parseInt(record.assignment_feedback_count) || 0,
								quiz_feedback_count: parseInt(record.quiz_feedback_count) || 0,
								grading_count: parseInt(record.grading_count) || 0,
								mod_assign_logs: parseInt(record.mod_assign_logs) || 0,
								mod_forum_logs: parseInt(record.mod_forum_logs) || 0,
								mod_quiz_logs: parseInt(record.mod_quiz_logs) || 0,
								total_login: parseInt(record.total_login) || 0,
								total_student_interactions:
									parseInt(record.total_student_interactions) || 0,
								extraction_date: record.extraction_date,
							};

							const upsertResult = await TpEtlSummaryModel.upsert(summaryData);
							pageRecordsProcessed++;

							if (upsertResult.action === "insert") {
								logger.debug(
									`Inserted new summary record for user ${record.user_id}`
								);
							} else {
								logger.debug(
									`Updated existing summary record for user ${record.user_id}`
								);
							}
						} catch (error) {
							logger.error(
								`Error processing summary record for user ${record.user_id}:`,
								error
							);
							// Continue processing other records
						}
					}

					totalRecordsProcessed += pageRecordsProcessed;
					logger.info(
						`Processed ${pageRecordsProcessed} summary records from page ${currentPage}`
					);
				}

				// Check if there's more data to process
				if (response.pagination && response.pagination.has_next_page) {
					currentPage++;
				} else {
					hasMoreData = false;
				}

				// Update log with progress if logId is provided
				if (existingLogId) {
					await TpEtlLogModel.update(existingLogId, {
						message: `Step 2/3: Processed ${totalRecordsProcessed} summary records so far...`,
						total_records: totalRecordsProcessed,
					});
				}
			}

			logger.info(
				`TP ETL summary process completed successfully. Total records processed: ${totalRecordsProcessed}`
			);

			return {
				success: true,
				message: "TP ETL summary export completed successfully",
				total_records: totalRecordsProcessed,
			};
		} catch (error) {
			logger.error("Error in TP ETL summary process:", error);
			throw error;
		}
	},

	// Method to export TP ETL detail data with pagination and processing
	runTpEtlDetail: async (existingLogId = null, summaryRecordsCount = 0) => {
		try {
			logger.info("Starting TP ETL detail process...");

			// Export TP ETL detail data with pagination
			let currentPage = 1;
			let totalRecordsProcessed = 0;
			let hasMoreData = true;

			while (hasMoreData) {
				logger.info(`Processing page ${currentPage} of TP ETL detail data...`);

				const response = await celoeApiGatewayService.exportTPETLData(
					currentPage,
					100, // per_page
					"detail",
					"id",
					"desc"
				);

				if (!response) {
					throw new Error("API returned empty response for detail export");
				}

				// Log the actual response for debugging
				logger.info(
					`Detail Export API Response (Page ${currentPage}):`,
					JSON.stringify(response, null, 2)
				);

				if (response.error || response.success === false) {
					throw new Error(
						`API returned error response for detail export: ${
							response.message || "Unknown error"
						}`
					);
				}
				if (response.success !== true) {
					throw new Error(
						`API response indicates failure for detail export: ${
							response.message || "Unknown failure"
						}. Response: ${JSON.stringify(response)}`
					);
				}

				// Process the data
				if (response.data && Array.isArray(response.data)) {
					let pageRecordsProcessed = 0;

					// Prepare data for bulk insert
					const detailRecords = [];

					for (const record of response.data) {
						try {
							// Transform the data to match our model structure
							const detailData = {
								user_id: parseInt(record.user_id),
								username: record.username,
								firstname: record.firstname,
								lastname: record.lastname,
								email: record.email,
								course_id: parseInt(record.course_id),
								course_name: record.course_name,
								course_shortname: record.course_shortname,
								activity_date: record.activity_date,
								component: record.component,
								action: record.action,
								target: record.target,
								objectid: record.objectid ? parseInt(record.objectid) : null,
								log_id: parseInt(record.log_id),
								activity_timestamp: record.activity_timestamp
									? parseInt(record.activity_timestamp)
									: null,
								extraction_date: record.extraction_date,
							};

							detailRecords.push(detailData);
						} catch (error) {
							logger.error(
								`Error transforming detail record for log_id ${record.log_id}:`,
								error
							);
							// Continue processing other records
						}
					}

					// Bulk insert the records
					if (detailRecords.length > 0) {
						try {
							const bulkResult = await TpEtlDetailModel.bulkInsert(
								detailRecords
							);
							pageRecordsProcessed = bulkResult.affectedRows;
							totalRecordsProcessed += pageRecordsProcessed;

							logger.info(
								`Bulk inserted ${pageRecordsProcessed} detail records from page ${currentPage}, skipped ${bulkResult.skippedRecords} existing records`
							);
						} catch (error) {
							logger.error(
								`Error bulk inserting detail records from page ${currentPage}:`,
								error
							);
							// Continue with next page
						}
					}
				}

				// Check if there's more data to process
				if (response.pagination && response.pagination.has_next_page) {
					currentPage++;
				} else {
					hasMoreData = false;
				}

				// Update log with progress if logId is provided
				if (existingLogId) {
					await TpEtlLogModel.update(existingLogId, {
						message: `Step 3/3: Processed ${totalRecordsProcessed} detail records so far...`,
						total_records: summaryRecordsCount + totalRecordsProcessed,
					});
				}
			}

			logger.info(
				`TP ETL detail process completed successfully. Total records processed: ${totalRecordsProcessed}`
			);

			return {
				success: true,
				message: "TP ETL detail export completed successfully",
				total_records: totalRecordsProcessed,
			};
		} catch (error) {
			logger.error("Error in TP ETL detail process:", error);
			throw error;
		}
	},
};

module.exports = teacherPerformanceEtlService;
