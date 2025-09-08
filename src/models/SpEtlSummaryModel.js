const database = require("../database/connection");

class SpEtlSummaryModel {
  constructor(data = {}) {
    this.id = data.id;
    this.response_id = data.response_id;
    this.user_id = data.user_id;
    this.username = data.username;
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.total_course = data.total_course;
    this.total_login = data.total_login;
    this.total_activities = data.total_activities;
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
        // Use item.id as response_id since that's what comes from the API
        const responseId = item.id || item.response_id;

        if (!responseId) {
          skippedRecords++;
          continue;
        }

        // Check if response_id already exists
        const checkQuery = `
          SELECT id FROM monev_sp_etl_summary 
          WHERE response_id = ?
        `;

        const existingRecord = await database.query(checkQuery, [responseId]);

        if (existingRecord && existingRecord.length > 0) {
          skippedRecords++;
          continue;
        }

        const query = `
          INSERT INTO monev_sp_etl_summary 
          (response_id, user_id, username, firstname, lastname, total_course, total_login, total_activities, extraction_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          parseInt(responseId) || 0, // Convert to integer
          parseInt(item.user_id) || 0, // Convert to integer
          item.username,
          item.firstname,
          item.lastname,
          parseInt(item.total_course) || 0, // Convert to integer
          parseInt(item.total_login) || 0, // Convert to integer
          parseInt(item.total_activities) || 0, // Convert to integer
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
      throw new Error(`Error bulk inserting SpEtlSummary: ${error.message}`);
    }
  }

  static async getAllDataWithPagination(
    page = 1,
    limit = 10,
    search = "",
    sort_by = "created_at",
    sort_order = "DESC",
    filters = {}
  ) {
    try {
      let whereClause = "";
      let whereValues = [];
      let offset = (page - 1) * limit;
      let hasSearch = false;

      // Check if we have search string
      if (search && search.trim() !== "") {
        hasSearch = true;
        search = search.trim();
      }

      // Build filter conditions
      const filterConditions = [];
      const filterValues = [];

      // Add filters for kampusId, fakultasId, prodiId, mataKuliahId using SAS tables
      if (filters.kampusId) {
        filterConditions.push("cat.category_site = ?");
        filterValues.push(filters.kampusId);
      }

      if (filters.fakultasId) {
        filterConditions.push("cat.category_id = ?");
        filterValues.push(filters.fakultasId);
      }

      if (filters.prodiId) {
        filterConditions.push("course.program_id = ?");
        filterValues.push(filters.prodiId);
      }

      if (filters.mataKuliahId) {
        filterConditions.push("course.course_id = ?");
        filterValues.push(filters.mataKuliahId);
      }

      let countQuery, dataQuery, dataValues;

      if (hasSearch || filterConditions.length > 0) {
        // Use JOIN query when searching or filtering
        let whereConditions = [];
        let searchValues = [];

        if (hasSearch) {
          whereConditions.push(
            "(s.username LIKE ? OR s.firstname LIKE ? OR s.lastname LIKE ? OR d.course_name LIKE ? OR d.module_name LIKE ?)"
          );
          searchValues = [
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
          ];
        }

        if (filterConditions.length > 0) {
          whereConditions.push(...filterConditions);
        }

        const whereClause =
          whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

        // Build JOIN based on filters
        let joinClause = `
          FROM monev_sp_etl_summary s
          INNER JOIN monev_sp_etl_detail d ON s.user_id = d.user_id
          INNER JOIN monev_sas_courses course ON d.course_id = course.course_id
        `;

        // Add category join only if needed for kampusId or fakultasId
        if (filters.kampusId || filters.fakultasId) {
          joinClause += `
          INNER JOIN monev_sas_categories cat ON course.faculty_id = cat.category_id`;
        }

        countQuery = `
          SELECT COUNT(DISTINCT s.id) as total 
          ${joinClause}
          ${whereClause}
        `;
        whereValues = [...searchValues, ...filterValues];
      } else {
        // Get total count for pagination without JOIN
        countQuery = `SELECT COUNT(*) as total FROM monev_sp_etl_summary`;
      }

      const countResult = await database.query(countQuery, whereValues);
      const totalRecords = countResult[0]?.total || 0;

      // Validate sort_by agar tidak bisa SQL injection
      const allowedSortColumns = [
        "created_at",
        "username",
        "user_id",
        "total_course",
        "total_login",
        "total_activities",
        "extraction_date",
      ];
      if (!allowedSortColumns.includes(sort_by)) {
        sort_by = "created_at"; // default fallback
      }

      // Pastikan sort_order hanya ASC atau DESC
      sort_order = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Get paginated data
      if (hasSearch || filterConditions.length > 0) {
        // Use JOIN query when searching or filtering
        let whereConditions = [];
        let searchValues = [];

        if (hasSearch) {
          whereConditions.push(
            "(s.username LIKE ? OR s.firstname LIKE ? OR s.lastname LIKE ? OR d.course_name LIKE ? OR d.module_name LIKE ?)"
          );
          searchValues = [
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
          ];
        }

        if (filterConditions.length > 0) {
          whereConditions.push(...filterConditions);
        }

        const whereClause =
          whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

        // Build JOIN based on filters
        let joinClause = `
          FROM monev_sp_etl_summary s
          INNER JOIN monev_sp_etl_detail d ON s.user_id = d.user_id
          INNER JOIN monev_sas_courses course ON d.course_id = course.course_id
        `;

        // Add category join only if needed for kampusId or fakultasId
        if (filters.kampusId || filters.fakultasId) {
          joinClause += `
          INNER JOIN monev_sas_categories cat ON course.faculty_id = cat.category_id`;
        }

        dataQuery = `
          SELECT DISTINCT s.*
          ${joinClause}
          ${whereClause}
          ORDER BY s.${sort_by} ${sort_order}
          LIMIT ? OFFSET ?
        `;
        dataValues = [...searchValues, ...filterValues, limit, offset];
      } else {
        // Use simple query when no search or filters
        dataQuery = `
          SELECT * FROM monev_sp_etl_summary 
          ORDER BY ${sort_by} ${sort_order}
          LIMIT ? OFFSET ?
        `;
        dataValues = [limit, offset];
      }

      const result = await database.query(dataQuery, dataValues);

      // Calculate pagination info
      const totalPages = Math.ceil(totalRecords / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data: result.map((summary) => new SpEtlSummaryModel(summary)),
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
        `Error getting SP ETL summary data with pagination: ${error.message}`
      );
    }
  }
}

module.exports = SpEtlSummaryModel;
