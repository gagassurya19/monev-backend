const database = require("../database/connection");

class TpEtlLogModel {
	constructor(data = {}) {
		this.id = data.id;
		this.process_type = data.process_type;
		this.status = data.status;
		this.message = data.message;
		this.concurrency = data.concurrency;
		this.start_date = data.start_date;
		this.end_date = data.end_date;
		this.duration_seconds = data.duration_seconds;
		this.total_records = data.total_records;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	static async create(data) {
		if (!data || !data.process_type) {
			throw new Error("process_type is required");
		}

		try {
			const query = `
        INSERT INTO monev_tp_etl_logs 
        (process_type, status, message, concurrency, start_date, total_records)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

			const values = [
				data.process_type,
				data.status || "running",
				data.message || null,
				parseInt(data.concurrency) || 1,
				data.start_date || new Date(),
				parseInt(data.total_records) || 0,
			];

			const result = await database.query(query, values);

			return {
				affectedRows: result.affectedRows,
				insertId: result.insertId,
				message: "Log created successfully",
			};
		} catch (error) {
			throw new Error(`Error creating TpEtlLog: ${error.message}`);
		}
	}

	static async update(id, data) {
		if (!id) {
			throw new Error("Log ID is required");
		}

		try {
			let updateFields = [];
			let updateValues = [];

			// Build dynamic update query
			if (data.status !== undefined) {
				updateFields.push("status = ?");
				updateValues.push(data.status);
			}

			if (data.message !== undefined) {
				updateFields.push("message = ?");
				updateValues.push(data.message);
			}

			if (data.end_date !== undefined) {
				updateFields.push("end_date = ?");
				updateValues.push(data.end_date);
			}

			if (data.duration_seconds !== undefined) {
				updateFields.push("duration_seconds = ?");
				updateValues.push(parseInt(data.duration_seconds) || 0);
			}

			if (data.total_records !== undefined) {
				updateFields.push("total_records = ?");
				updateValues.push(parseInt(data.total_records) || 0);
			}

			if (updateFields.length === 0) {
				throw new Error("No fields to update");
			}

			updateValues.push(id);

			const query = `
        UPDATE monev_tp_etl_logs 
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `;

			const result = await database.query(query, updateValues);

			return {
				affectedRows: result.affectedRows,
				message: "Log updated successfully",
			};
		} catch (error) {
			throw new Error(`Error updating TpEtlLog: ${error.message}`);
		}
	}
}

module.exports = TpEtlLogModel;
