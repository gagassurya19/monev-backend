const TpEtlSummaryModel = require("../models/TpEtlSummaryModel");
const TpEtlDetailModel = require("../models/TpEtlDetailModel");
const TpEtlLogModel = require("../models/TpEtlLogModel");
const logger = require("../utils/logger");
const responseService = require("../services/responseService");

const tpEtlApiController = {
	// Get TP ETL Summary data with pagination and search
	getSummaryData: async (req, res) => {
		try {
			const {
				page = 1,
				limit = 10,
				search = "",
				sortBy = "id",
				sortOrder = "desc",
			} = req.query;

			logger.info(`Getting TP ETL Summary data with params:`, {
				page,
				limit,
				search,
				sortBy,
				sortOrder,
			});

			const result = await TpEtlSummaryModel.getAll({
				page: parseInt(page),
				limit: parseInt(limit),
				search: search.trim(),
				sortBy,
				sortOrder,
			});

			return responseService.success(
				res,
				"TP ETL Summary data retrieved successfully",
				result
			);
		} catch (error) {
			logger.error("Error getting TP ETL Summary data:", error);
			return responseService.error(
				res,
				"Failed to get TP ETL Summary data",
				error.message
			);
		}
	},

	// Get TP ETL Summary data by ID
	getSummaryById: async (req, res) => {
		try {
			const { id } = req.params;

			if (!id) {
				return responseService.badRequest(res, "ID is required");
			}

			logger.info(`Getting TP ETL Summary data by ID: ${id}`);

			const result = await TpEtlSummaryModel.getById(id);

			if (!result.success) {
				return responseService.notFound(res, result.message);
			}

			return responseService.success(
				res,
				"TP ETL Summary data retrieved successfully",
				result.data
			);
		} catch (error) {
			logger.error("Error getting TP ETL Summary data by ID:", error);
			return responseService.error(
				res,
				"Failed to get TP ETL Summary data",
				error.message
			);
		}
	},

	// Get TP ETL Detail data with pagination and search
	getDetailData: async (req, res) => {
		try {
			const {
				page = 1,
				limit = 10,
				search = "",
				sortBy = "id",
				sortOrder = "desc",
			} = req.query;

			logger.info(`Getting TP ETL Detail data with params:`, {
				page,
				limit,
				search,
				sortBy,
				sortOrder,
			});

			const result = await TpEtlDetailModel.getAll({
				page: parseInt(page),
				limit: parseInt(limit),
				search: search.trim(),
				sortBy,
				sortOrder,
			});

			return responseService.success(
				res,
				"TP ETL Detail data retrieved successfully",
				result
			);
		} catch (error) {
			logger.error("Error getting TP ETL Detail data:", error);
			return responseService.error(
				res,
				"Failed to get TP ETL Detail data",
				error.message
			);
		}
	},

	// Get TP ETL Detail data by ID
	getDetailById: async (req, res) => {
		try {
			const { id } = req.params;

			if (!id) {
				return responseService.badRequest(res, "ID is required");
			}

			logger.info(`Getting TP ETL Detail data by ID: ${id}`);

			const result = await TpEtlDetailModel.getById(id);

			if (!result.success) {
				return responseService.notFound(res, result.message);
			}

			return responseService.success(
				res,
				"TP ETL Detail data retrieved successfully",
				result.data
			);
		} catch (error) {
			logger.error("Error getting TP ETL Detail data by ID:", error);
			return responseService.error(
				res,
				"Failed to get TP ETL Detail data",
				error.message
			);
		}
	},

	// Get TP ETL Detail data by User ID
	getDetailByUserId: async (req, res) => {
		try {
			const { userId } = req.params;
			const {
				page = 1,
				limit = 10,
				sortBy = "id",
				sortOrder = "desc",
			} = req.query;

			if (!userId) {
				return responseService.badRequest(res, "User ID is required");
			}

			logger.info(`Getting TP ETL Detail data by User ID: ${userId}`);

			const result = await TpEtlDetailModel.getByUserId(userId, {
				page: parseInt(page),
				limit: parseInt(limit),
				sortBy,
				sortOrder,
			});

			return responseService.success(
				res,
				"TP ETL Detail data by user retrieved successfully",
				result
			);
		} catch (error) {
			logger.error("Error getting TP ETL Detail data by User ID:", error);
			return responseService.error(
				res,
				"Failed to get TP ETL Detail data by user",
				error.message
			);
		}
	},

	// Get TP ETL Logs with pagination
	getLogs: async (req, res) => {
		try {
			const {
				page = 1,
				limit = 10,
				process_type = "",
				status = "",
				sortBy = "id",
				sortOrder = "desc",
			} = req.query;

			logger.info(`Getting TP ETL Logs with params:`, {
				page,
				limit,
				process_type,
				status,
				sortBy,
				sortOrder,
			});

			// Build WHERE clause for filtering
			let whereClause = "";
			let whereValues = [];

			if (process_type && process_type.trim() !== "") {
				whereClause += whereClause ? " AND " : "WHERE ";
				whereClause += "process_type = ?";
				whereValues.push(process_type.trim());
			}

			if (status && status.trim() !== "") {
				whereClause += whereClause ? " AND " : "WHERE ";
				whereClause += "status = ?";
				whereValues.push(status.trim());
			}

			// Calculate offset
			const offset = (parseInt(page) - 1) * parseInt(limit);

			// Build ORDER BY clause
			const allowedSortFields = [
				"id",
				"process_type",
				"status",
				"message",
				"concurrency",
				"start_date",
				"end_date",
				"duration_seconds",
				"total_records",
				"created_at",
				"updated_at",
			];

			const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
			const orderDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

			// Count total records for pagination
			const countQuery = `
				SELECT COUNT(*) as total 
				FROM monev_tp_etl_logs 
				${whereClause}
			`;

			const countResult = await TpEtlLogModel.database.query(
				countQuery,
				whereValues
			);
			const totalRecords = countResult[0].total;

			// Get paginated data
			const dataQuery = `
				SELECT * FROM monev_tp_etl_logs 
				${whereClause}
				ORDER BY ${sortField} ${orderDirection}
				LIMIT ? OFFSET ?
			`;

			const dataValues = [...whereValues, parseInt(limit), offset];
			const dataResult = await TpEtlLogModel.database.query(
				dataQuery,
				dataValues
			);

			// Calculate pagination info
			const totalPages = Math.ceil(totalRecords / parseInt(limit));
			const hasNextPage = parseInt(page) < totalPages;
			const hasPrevPage = parseInt(page) > 1;

			const result = {
				success: true,
				data: dataResult,
				pagination: {
					current_page: parseInt(page),
					per_page: parseInt(limit),
					total_records: totalRecords,
					total_pages: totalPages,
					has_next_page: hasNextPage,
					has_prev_page: hasPrevPage,
					next_page: hasNextPage ? parseInt(page) + 1 : null,
					prev_page: hasPrevPage ? parseInt(page) - 1 : null,
				},
				filters: {
					process_type: process_type.trim() || null,
					status: status.trim() || null,
				},
			};

			return responseService.success(
				res,
				"TP ETL Logs retrieved successfully",
				result
			);
		} catch (error) {
			logger.error("Error getting TP ETL Logs:", error);
			return responseService.error(
				res,
				"Failed to get TP ETL Logs",
				error.message
			);
		}
	},

	// Get TP ETL Log by ID
	getLogById: async (req, res) => {
		try {
			const { id } = req.params;

			if (!id) {
				return responseService.badRequest(res, "ID is required");
			}

			logger.info(`Getting TP ETL Log by ID: ${id}`);

			const query = `
				SELECT * FROM monev_tp_etl_logs 
				WHERE id = ?
			`;

			const result = await TpEtlLogModel.database.query(query, [parseInt(id)]);

			if (result && result.length > 0) {
				return responseService.success(
					res,
					"TP ETL Log retrieved successfully",
					result[0]
				);
			} else {
				return responseService.notFound(res, "Log not found");
			}
		} catch (error) {
			logger.error("Error getting TP ETL Log by ID:", error);
			return responseService.error(
				res,
				"Failed to get TP ETL Log",
				error.message
			);
		}
	},
};

module.exports = tpEtlApiController;
