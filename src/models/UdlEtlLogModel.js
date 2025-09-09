const database = require("../database/connection");

class UdlEtlLogModel {
  constructor(data = {}) {
    this.id = data.id;
    this.type_run = data.type_run;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.duration = data.duration;
    this.duration_seconds = data.duration_seconds;
    this.status = data.status;
    this.total_records = data.total_records;
    this.offset = data.offset;
    this.created_at = data.created_at;
  }

  static async create(data) {
    if (!data || !data.type_run) {
      throw new Error("type_run is required");
    }

    try {
      const query = `
        INSERT INTO monev_udl_etl_logs 
        (type_run, start_date, end_date, duration, duration_seconds, status, total_records, offset)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        data.type_run,
        data.start_date || new Date(),
        data.end_date || null,
        data.duration || null,
        parseInt(data.duration_seconds) || null,
        data.status || "in_progress",
        parseInt(data.total_records) || null,
        parseInt(data.offset) || null,
      ];

      const result = await database.query(query, values);

      return {
        affectedRows: result.affectedRows,
        insertId: result.insertId,
        message: "UDL ETL Log created successfully",
      };
    } catch (error) {
      throw new Error(`Error creating UdlEtlLog: ${error.message}`);
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
      if (data.type_run !== undefined) {
        updateFields.push("type_run = ?");
        updateValues.push(data.type_run);
      }

      if (data.start_date !== undefined) {
        updateFields.push("start_date = ?");
        updateValues.push(data.start_date);
      }

      if (data.end_date !== undefined) {
        updateFields.push("end_date = ?");
        updateValues.push(data.end_date);
      }

      if (data.duration !== undefined) {
        updateFields.push("duration = ?");
        updateValues.push(data.duration);
      }

      if (data.duration_seconds !== undefined) {
        updateFields.push("duration_seconds = ?");
        updateValues.push(parseInt(data.duration_seconds) || null);
      }

      if (data.status !== undefined) {
        updateFields.push("status = ?");
        updateValues.push(data.status);
      }

      if (data.total_records !== undefined) {
        updateFields.push("total_records = ?");
        updateValues.push(parseInt(data.total_records) || null);
      }

      if (data.offset !== undefined) {
        updateFields.push("offset = ?");
        updateValues.push(parseInt(data.offset) || null);
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      updateValues.push(id);

      const query = `
        UPDATE monev_udl_etl_logs 
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `;

      const result = await database.query(query, updateValues);

      return {
        affectedRows: result.affectedRows,
        message: "UDL ETL Log updated successfully",
      };
    } catch (error) {
      throw new Error(`Error updating UdlEtlLog: ${error.message}`);
    }
  }

  static async getLogsWithPagination(
    page = 1,
    limit = 10,
    filters = {},
    sort_by = "created_at",
    sort_order = "DESC"
  ) {
    try {
      let whereClause = "";
      let whereValues = [];
      let offset = (page - 1) * limit;

      // Build where clause based on filters
      if (filters.type_run) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "type_run = ?";
        whereValues.push(filters.type_run);
      }

      if (filters.status) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "status = ?";
        whereValues.push(filters.status);
      }

      if (filters.start_date) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "DATE(start_date) = ?";
        whereValues.push(filters.start_date);
      }

      if (filters.end_date) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "DATE(end_date) = ?";
        whereValues.push(filters.end_date);
      }

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM monev_udl_etl_logs ${whereClause}`;
      const countResult = await database.query(countQuery, whereValues);
      const totalRecords = countResult[0]?.total || 0;

      // Validate sort column to prevent SQL injection
      const allowedSortColumns = [
        "created_at",
        "start_date",
        "end_date",
        "status",
        "type_run",
      ];
      if (!allowedSortColumns.includes(sort_by)) {
        sort_by = "created_at"; // fallback
      }

      // Ensure ASC/DESC only
      sort_order = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Get paginated data
      const dataQuery = `
        SELECT * FROM monev_udl_etl_logs 
        ${whereClause}
        ORDER BY ${sort_by} ${sort_order}
        LIMIT ? OFFSET ?
      `;

      const dataValues = [...whereValues, limit, offset];
      const result = await database.query(dataQuery, dataValues);

      // Calculate pagination info
      const totalPages = Math.ceil(totalRecords / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data: result.map((log) => new UdlEtlLogModel(log)),
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: totalRecords,
          limit: limit,
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
        `Error getting UDL ETL logs with pagination: ${error.message}`
      );
    }
  }

  static async getLatestLog() {
    try {
      const result = await database.query(
        `SELECT * FROM monev_udl_etl_logs ORDER BY id DESC LIMIT 1`
      );
      const log = result.map((log) => new UdlEtlLogModel(log));
      return log;
    } catch (error) {
      throw new Error(`Error getting UDL ETL logs: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const result = await database.query(
        `SELECT * FROM monev_udl_etl_logs WHERE id = ?`,
        [id]
      );
      return result.length > 0 ? new UdlEtlLogModel(result[0]) : null;
    } catch (error) {
      throw new Error(`Error getting UDL ETL log by ID: ${error.message}`);
    }
  }

  static async getStatus() {
    try {
      // Get the latest log entry
      const result = await database.query(
        `SELECT * FROM monev_udl_etl_logs ORDER BY id DESC LIMIT 1`
      );

      if (result.length === 0) {
        return {
          isRunning: false,
          status: "no_logs",
          message: "No UDL ETL logs found",
          lastLog: null,
        };
      }

      const latestLog = result[0];
      const isRunning =
        latestLog.status === "in_progress" && !latestLog.end_date;

      return {
        isRunning: isRunning,
        status: latestLog.status,
        message: isRunning
          ? "UDL ETL is currently running"
          : "UDL ETL is not running",
        lastLog: {
          id: latestLog.id,
          type_run: latestLog.type_run,
          start_date: latestLog.start_date,
          end_date: latestLog.end_date,
          duration: latestLog.duration,
          status: latestLog.status,
          total_records: latestLog.total_records,
          offset: latestLog.offset,
          created_at: latestLog.created_at,
        },
      };
    } catch (error) {
      throw new Error(`Error getting UDL ETL status: ${error.message}`);
    }
  }
}

module.exports = UdlEtlLogModel;
