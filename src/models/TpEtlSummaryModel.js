const database = require("../database/connection");

class TpEtlSummaryModel {
	constructor(data = {}) {
		this.id = data.id;
		this.user_id = data.user_id;
		this.username = data.username;
		this.firstname = data.firstname;
		this.lastname = data.lastname;
		this.email = data.email;
		this.total_courses_taught = data.total_courses_taught;
		this.total_activities = data.total_activities;
		this.forum_replies = data.forum_replies;
		this.assignment_feedback_count = data.assignment_feedback_count;
		this.quiz_feedback_count = data.quiz_feedback_count;
		this.grading_count = data.grading_count;
		this.mod_assign_logs = data.mod_assign_logs;
		this.mod_forum_logs = data.mod_forum_logs;
		this.mod_quiz_logs = data.mod_quiz_logs;
		this.total_login = data.total_login;
		this.total_student_interactions = data.total_student_interactions;
		this.extraction_date = data.extraction_date;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	static async upsert(data) {
		if (!data || !data.user_id || !data.extraction_date) {
			throw new Error("user_id and extraction_date are required");
		}

		try {
			// Check if record exists
			const checkQuery = `
        SELECT id FROM monev_tp_etl_summary 
        WHERE user_id = ? AND extraction_date = ?
      `;

			const existingRecord = await database.query(checkQuery, [
				data.user_id,
				data.extraction_date,
			]);

			if (existingRecord && existingRecord.length > 0) {
				// Update existing record
				const updateQuery = `
          UPDATE monev_tp_etl_summary 
          SET username = ?, firstname = ?, lastname = ?, email = ?,
              total_courses_taught = ?, total_activities = ?, forum_replies = ?,
              assignment_feedback_count = ?, quiz_feedback_count = ?, grading_count = ?,
              mod_assign_logs = ?, mod_forum_logs = ?, mod_quiz_logs = ?,
              total_login = ?, total_student_interactions = ?
          WHERE user_id = ? AND extraction_date = ?
        `;

				const updateValues = [
					data.username,
					data.firstname,
					data.lastname,
					data.email,
					parseInt(data.total_courses_taught) || 0,
					parseInt(data.total_activities) || 0,
					parseInt(data.forum_replies) || 0,
					parseInt(data.assignment_feedback_count) || 0,
					parseInt(data.quiz_feedback_count) || 0,
					parseInt(data.grading_count) || 0,
					parseInt(data.mod_assign_logs) || 0,
					parseInt(data.mod_forum_logs) || 0,
					parseInt(data.mod_quiz_logs) || 0,
					parseInt(data.total_login) || 0,
					parseInt(data.total_student_interactions) || 0,
					data.user_id,
					data.extraction_date,
				];

				const result = await database.query(updateQuery, updateValues);

				return {
					affectedRows: result.affectedRows,
					insertId: existingRecord[0].id,
					message: "Record updated successfully",
					action: "update",
				};
			} else {
				// Insert new record
				const insertQuery = `
          INSERT INTO monev_tp_etl_summary 
          (user_id, username, firstname, lastname, email, total_courses_taught, 
           total_activities, forum_replies, assignment_feedback_count, quiz_feedback_count,
           grading_count, mod_assign_logs, mod_forum_logs, mod_quiz_logs, total_login,
           total_student_interactions, extraction_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

				const insertValues = [
					parseInt(data.user_id) || 0,
					data.username,
					data.firstname,
					data.lastname,
					data.email,
					parseInt(data.total_courses_taught) || 0,
					parseInt(data.total_activities) || 0,
					parseInt(data.forum_replies) || 0,
					parseInt(data.assignment_feedback_count) || 0,
					parseInt(data.quiz_feedback_count) || 0,
					parseInt(data.grading_count) || 0,
					parseInt(data.mod_assign_logs) || 0,
					parseInt(data.mod_forum_logs) || 0,
					parseInt(data.mod_quiz_logs) || 0,
					parseInt(data.total_login) || 0,
					parseInt(data.total_student_interactions) || 0,
					data.extraction_date,
				];

				const result = await database.query(insertQuery, insertValues);

				return {
					affectedRows: result.affectedRows,
					insertId: result.insertId,
					message: "Record inserted successfully",
					action: "insert",
				};
			}
		} catch (error) {
			throw new Error(`Error upserting TpEtlSummary: ${error.message}`);
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
				`;
				const searchPattern = `%${search.trim()}%`;
				whereValues = [
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
				"total_courses_taught",
				"total_activities",
				"forum_replies",
				"assignment_feedback_count",
				"quiz_feedback_count",
				"grading_count",
				"mod_assign_logs",
				"mod_forum_logs",
				"mod_quiz_logs",
				"total_login",
				"total_student_interactions",
				"extraction_date",
				"created_at",
				"updated_at",
			];

			const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
			const orderDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

			// Count total records for pagination
			const countQuery = `
				SELECT COUNT(*) as total 
				FROM monev_tp_etl_summary 
				${whereClause}
			`;

			const countResult = await database.query(countQuery, whereValues);
			const totalRecords = countResult[0].total;

			// Get paginated data
			const dataQuery = `
				SELECT * FROM monev_tp_etl_summary 
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
			throw new Error(`Error getting TpEtlSummary data: ${error.message}`);
		}
	}

	static async getById(id) {
		try {
			const query = `
				SELECT * FROM monev_tp_etl_summary 
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
			throw new Error(`Error getting TpEtlSummary by ID: ${error.message}`);
		}
	}
}

module.exports = TpEtlSummaryModel;
