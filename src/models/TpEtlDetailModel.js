const database = require("../database/connection");

class TpEtlDetailModel {
	constructor(data = {}) {
		this.id = data.id;
		this.user_id = data.user_id;
		this.username = data.username;
		this.firstname = data.firstname;
		this.lastname = data.lastname;
		this.email = data.email;
		this.course_id = data.course_id;
		this.course_name = data.course_name;
		this.course_shortname = data.course_shortname;
		this.activity_date = data.activity_date;
		this.component = data.component;
		this.action = data.action;
		this.target = data.target;
		this.objectid = data.objectid;
		this.log_id = data.log_id;
		this.activity_timestamp = data.activity_timestamp;
		this.extraction_date = data.extraction_date;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	static async bulkInsert(dataArray) {
		if (!Array.isArray(dataArray) || dataArray.length === 0) {
			throw new Error("Data array is required and must not be empty");
		}

		try {
			let totalAffectedRows = 0;
			let totalInsertId = null;
			let skippedRecords = 0;

			for (const item of dataArray) {
				if (!item.log_id) {
					skippedRecords++;
					continue;
				}

				// Check if log_id already exists
				const checkQuery = `
          SELECT id FROM monev_tp_etl_detail 
          WHERE log_id = ?
        `;

				const existingRecord = await database.query(checkQuery, [item.log_id]);

				if (existingRecord && existingRecord.length > 0) {
					skippedRecords++;
					continue;
				}

				const query = `
          INSERT INTO monev_tp_etl_detail 
          (user_id, username, firstname, lastname, email, course_id, course_name, 
           course_shortname, activity_date, component, action, target, objectid, 
           log_id, activity_timestamp, extraction_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

				const values = [
					parseInt(item.user_id) || 0,
					item.username,
					item.firstname,
					item.lastname,
					item.email,
					parseInt(item.course_id) || 0,
					item.course_name,
					item.course_shortname,
					item.activity_date,
					item.component,
					item.action,
					item.target,
					item.objectid ? parseInt(item.objectid) : null,
					parseInt(item.log_id) || 0,
					item.activity_timestamp ? parseInt(item.activity_timestamp) : null,
					item.extraction_date,
				];

				const result = await database.query(query, values);

				totalAffectedRows += result.affectedRows;
				if (!totalInsertId && result.insertId) {
					totalInsertId = result.insertId;
				}
			}

			return {
				affectedRows: totalAffectedRows,
				insertId: totalInsertId,
				skippedRecords: skippedRecords,
				message: `Successfully processed ${totalAffectedRows} records, skipped ${skippedRecords} existing records`,
			};
		} catch (error) {
			throw new Error(`Error bulk inserting TpEtlDetail: ${error.message}`);
		}
	}

	static async getAll(params = {}) {
		try {
			const {
				page = 1,
				limit = 10,
				search = "",
				sortBy = "id",
				sortOrder = "desc",
			} = params;

			// Calculate offset
			const offset = (page - 1) * limit;

			// Build WHERE clause for search
			let whereClause = "";
			let whereValues = [];

			if (search && search.trim() !== "") {
				whereClause = `
					WHERE username LIKE ? 
					OR firstname LIKE ? 
					OR lastname LIKE ? 
					OR email LIKE ?
					OR course_name LIKE ?
					OR course_shortname LIKE ?
					OR component LIKE ?
					OR action LIKE ?
					OR target LIKE ?
				`;
				const searchPattern = `%${search.trim()}%`;
				whereValues = [
					searchPattern,
					searchPattern,
					searchPattern,
					searchPattern,
					searchPattern,
					searchPattern,
					searchPattern,
					searchPattern,
					searchPattern,
				];
			}

			// Build ORDER BY clause
			const allowedSortFields = [
				"id",
				"user_id",
				"username",
				"firstname",
				"lastname",
				"email",
				"course_id",
				"course_name",
				"course_shortname",
				"activity_date",
				"component",
				"action",
				"target",
				"objectid",
				"log_id",
				"activity_timestamp",
				"extraction_date",
				"created_at",
				"updated_at",
			];

			const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
			const orderDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

			// Count total records for pagination
			const countQuery = `
				SELECT COUNT(*) as total 
				FROM monev_tp_etl_detail 
				${whereClause}
			`;

			const countResult = await database.query(countQuery, whereValues);
			const totalRecords = countResult[0].total;

			// Get paginated data
			const dataQuery = `
				SELECT * FROM monev_tp_etl_detail 
				${whereClause}
				ORDER BY ${sortField} ${orderDirection}
				LIMIT ? OFFSET ?
			`;

			const dataValues = [...whereValues, parseInt(limit), offset];
			const dataResult = await database.query(dataQuery, dataValues);

			// Calculate pagination info
			const totalPages = Math.ceil(totalRecords / limit);
			const hasNextPage = page < totalPages;
			const hasPrevPage = page > 1;

			return {
				success: true,
				data: dataResult,
				pagination: {
					current_page: parseInt(page),
					per_page: parseInt(limit),
					total_records: totalRecords,
					total_pages: totalPages,
					has_next_page: hasNextPage,
					has_prev_page: hasPrevPage,
					next_page: hasNextPage ? page + 1 : null,
					prev_page: hasPrevPage ? page - 1 : null,
				},
				search: search.trim() || null,
			};
		} catch (error) {
			throw new Error(`Error getting TpEtlDetail data: ${error.message}`);
		}
	}

	static async getById(id) {
		try {
			const query = `
				SELECT * FROM monev_tp_etl_detail 
				WHERE id = ?
			`;

			const result = await database.query(query, [parseInt(id)]);

			if (result && result.length > 0) {
				return {
					success: true,
					data: result[0],
				};
			} else {
				return {
					success: false,
					message: "Record not found",
				};
			}
		} catch (error) {
			throw new Error(`Error getting TpEtlDetail by ID: ${error.message}`);
		}
	}

	static async getByUserId(userId, params = {}) {
		try {
			const {
				page = 1,
				limit = 10,
				sortBy = "id",
				sortOrder = "desc",
			} = params;

			// Calculate offset
			const offset = (page - 1) * limit;

			// Build ORDER BY clause
			const allowedSortFields = [
				"id",
				"user_id",
				"username",
				"firstname",
				"lastname",
				"email",
				"course_id",
				"course_name",
				"course_shortname",
				"activity_date",
				"component",
				"action",
				"target",
				"objectid",
				"log_id",
				"activity_timestamp",
				"extraction_date",
				"created_at",
				"updated_at",
			];

			const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
			const orderDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

			// Count total records for pagination
			const countQuery = `
				SELECT COUNT(*) as total 
				FROM monev_tp_etl_detail 
				WHERE user_id = ?
			`;

			const countResult = await database.query(countQuery, [parseInt(userId)]);
			const totalRecords = countResult[0].total;

			// Get paginated data
			const dataQuery = `
				SELECT * FROM monev_tp_etl_detail 
				WHERE user_id = ?
				ORDER BY ${sortField} ${orderDirection}
				LIMIT ? OFFSET ?
			`;

			const dataValues = [parseInt(userId), parseInt(limit), offset];
			const dataResult = await database.query(dataQuery, dataValues);

			// Calculate pagination info
			const totalPages = Math.ceil(totalRecords / limit);
			const hasNextPage = page < totalPages;
			const hasPrevPage = page > 1;

			return {
				success: true,
				data: dataResult,
				pagination: {
					current_page: parseInt(page),
					per_page: parseInt(limit),
					total_records: totalRecords,
					total_pages: totalPages,
					has_next_page: hasNextPage,
					has_prev_page: hasPrevPage,
					next_page: hasNextPage ? page + 1 : null,
					prev_page: hasPrevPage ? page - 1 : null,
				},
				user_id: parseInt(userId),
			};
		} catch (error) {
			throw new Error(`Error getting TpEtlDetail by user ID: ${error.message}`);
		}
	}
}

module.exports = TpEtlDetailModel;
