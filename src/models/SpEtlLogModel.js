const database = require("../database/connection");
const ResponseService = require("../services/responseService");

class SpEtlLogModel {
  constructor(data = {}) {
    this.id = data.id;
    this.type_run = data.type_run;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.duration = data.duration;
    this.status = data.status;
    this.total_records = data.total_records;
    this.offset = data.offset;
    this.created_at = data.created_at;
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
      const countQuery = `SELECT COUNT(*) as total FROM monev_sp_etl_logs ${whereClause}`;
      const countResult = await database.query(countQuery, whereValues);
      const totalRecords = countResult[0]?.total || 0;

      // ✅ Validasi kolom sort agar aman (anti SQL injection)
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

      // ✅ Pastikan ASC/DESC aja
      sort_order = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Get paginated data
      const dataQuery = `
      SELECT * FROM monev_sp_etl_logs 
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
        data: result.map((log) => new SpEtlLogModel(log)),
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
        `Error getting SP ETL logs with pagination: ${error.message}`
      );
    }
  }

  static async getLatestLog() {
    try {
      const result = await database.query(
        `SELECT * FROM monev_sp_etl_logs ORDER BY id DESC LIMIT 1`
      );
      const log = result.map((log) => new SpEtlLogModel(log));
      return log;
    } catch (error) {
      throw new Error(`Error getting SP ETL logs: ${error.message}`);
    }
  }
}

module.exports = SpEtlLogModel;
