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

  static async getLogsWithPagination(
    page = 1,
    limit = 10,
    sort_by = "id",
    sort_order = "desc",
    filters = {}
  ) {
    try {
      const offset = (page - 1) * limit;

      // Build WHERE clause for filters
      let whereClause = "";
      let whereValues = [];
      const filterConditions = [];

      // Add filters
      if (filters.process_type) {
        filterConditions.push("process_type = ?");
        whereValues.push(filters.process_type);
      }

      if (filters.status) {
        filterConditions.push("status = ?");
        whereValues.push(filters.status);
      }

      if (filters.start_date) {
        filterConditions.push("DATE(start_date) = ?");
        whereValues.push(filters.start_date);
      }

      if (filterConditions.length > 0) {
        whereClause = `WHERE ${filterConditions.join(" AND ")}`;
      }

      // Validate sort_by
      const allowedSortColumns = [
        "id",
        "process_type",
        "status",
        "start_date",
        "end_date",
        "duration_seconds",
        "total_records",
        "created_at",
      ];
      if (!allowedSortColumns.includes(sort_by)) {
        sort_by = "id";
      }

      // Ensure sort_order is ASC or DESC
      sort_order = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Count total records
      const countQuery = `
				SELECT COUNT(*) as total 
				FROM monev_tp_etl_logs 
				${whereClause}
			`;
      const countResult = await database.query(countQuery, whereValues);
      const totalRecords = countResult[0].total;

      // Get paginated data
      const dataQuery = `
				SELECT * FROM monev_tp_etl_logs 
				${whereClause}
				ORDER BY ${sort_by} ${sort_order}
				LIMIT ? OFFSET ?
			`;
      const dataValues = [...whereValues, parseInt(limit), offset];
      const dataResult = await database.query(dataQuery, dataValues);

      // Calculate pagination info
      const totalPages = Math.ceil(totalRecords / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data: dataResult.map((log) => new TpEtlLogModel(log)),
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_records: totalRecords,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? page + 1 : null,
          prev_page: hasPrevPage ? page - 1 : null,
          sort_by,
          sort_order,
        },
      };
    } catch (error) {
      throw new Error(
        `Error getting TP ETL logs with pagination: ${error.message}`
      );
    }
  }
}

module.exports = TpEtlLogModel;
