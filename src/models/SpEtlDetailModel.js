const database = require("../database/connection");

class SpEtlDetailModel {
  constructor(data = {}) {
    this.id = data.id;
    this.response_id = data.response_id;
    this.user_id = data.user_id;
    this.course_id = data.course_id;
    this.course_name = data.course_name;
    this.module_type = data.module_type;
    this.module_name = data.module_name;
    this.object_id = data.object_id;
    this.grade = data.grade;
    this.timecreated = data.timecreated;
    this.log_id = data.log_id;
    this.action_type = data.action_type;
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
          SELECT id FROM monev_sp_etl_detail 
          WHERE response_id = ?
        `;

        const existingRecord = await database.query(checkQuery, [responseId]);

        if (existingRecord && existingRecord.length > 0) {
          skippedRecords++;
          continue;
        }

        const query = `
          INSERT INTO monev_sp_etl_detail 
          (response_id, user_id, course_id, course_name, module_type, module_name, object_id, grade, timecreated, log_id, action_type, extraction_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          parseInt(responseId) || 0, // Convert to integer
          parseInt(item.user_id) || 0, // Convert to integer
          parseInt(item.course_id) || 0, // Convert to integer
          item.course_name,
          item.module_type,
          item.module_name || "",
          item.object_id ? parseInt(item.object_id) : null, // Convert to integer or null
          item.grade ? parseFloat(item.grade) : null, // Convert to float or null
          item.timecreated ? parseInt(item.timecreated) : null, // Convert to integer or null
          item.log_id ? parseInt(item.log_id) : null, // Convert to integer or null
          item.action_type,
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
      throw new Error(`Error bulk inserting SpEtlDetail: ${error.message}`);
    }
  }

  static async getAllDataWithPagination(
    page = 1,
    limit = 10,
    search = "",
    sort_by = "created_at",
    sort_order = "DESC",
    user_id = 0,
    course_id = 0
  ) {
    try {
      let whereClause = "";
      let whereValues = [];
      let offset = (page - 1) * limit;

      if (search && search.trim() !== "") {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "course_name LIKE ? OR module_name LIKE ?";
        whereValues.push(`%${search}%`, `%${search}%`);
      }

      // Add user_id filter
      if (user_id && user_id > 0) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "user_id = ?";
        whereValues.push(user_id);
      }

      // Add course_id filter
      if (course_id && course_id > 0) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "course_id = ?";
        whereValues.push(course_id);
      }

      const countQuery = `SELECT COUNT(*) as total FROM monev_sp_etl_detail ${whereClause}`;
      const countResult = await database.query(countQuery, whereValues);
      const totalRecords = countResult[0]?.total || 0;

      const allowedSortColumns = ["created_at", "course_name", "module_name"];
      if (!allowedSortColumns.includes(sort_by)) {
        sort_by = "created_at";
      }

      sort_order = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const dataQuery = `
        SELECT * FROM monev_sp_etl_detail
        ${whereClause}
        ORDER BY ${sort_by} ${sort_order}
        LIMIT ? OFFSET ?
      `;

      const dataValues = [...whereValues, limit, offset];
      const result = await database.query(dataQuery, dataValues);

      const totalPages = Math.ceil(totalRecords / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data: result.map((detail) => new SpEtlDetailModel(detail)),
        summary: {},
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
        `Error getting SP ETL detail data with pagination: ${error.message}`
      );
    }
  }

  static async getUserCourseSummary(filters = {}) {
    try {
      let whereClause = "";
      let whereValues = [];

      if (filters.user_id) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "user_id = ?";
        whereValues.push(filters.user_id);
      }
      if (filters.course_id) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "course_id = ?";
        whereValues.push(filters.course_id);
      }

      // Get user course summary grouped by user_id and course_id
      const query = `
        SELECT 
          user_id,
          course_id,
          course_name,
          COUNT(*) as total_logs,
          COUNT(DISTINCT module_type) as total_module_types,
          COUNT(DISTINCT module_name) as total_modules,
          MAX(grade) as highest_grade,
          MIN(grade) as lowest_grade,
          AVG(grade) as average_grade,
          MAX(timecreated) as last_activity,
          MIN(timecreated) as first_activity,
          MAX(created_at) as last_updated
        FROM monev_sp_etl_detail 
        ${whereClause}
        GROUP BY user_id, course_id
        ORDER BY user_id ASC, total_logs DESC
      `;

      const result = await database.query(query, whereValues);
      return result;
    } catch (error) {
      throw new Error(`Error getting user course summary: ${error.message}`);
    }
  }

  static async getModuleTypeSummary(filters = {}) {
    try {
      let whereClause = "";
      let whereValues = [];

      if (filters.user_id) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "user_id = ?";
        whereValues.push(filters.user_id);
      }
      if (filters.course_id) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "course_id = ?";
        whereValues.push(filters.course_id);
      }

      // Get module type summary without grouping - return single summary object
      const query = `
        SELECT 
          COUNT(*) as total_logs,
          SUM(CASE WHEN module_type = 'assign' THEN 1 ELSE 0 END) as total_module_assign,
          SUM(CASE WHEN module_type = 'quiz' THEN 1 ELSE 0 END) as total_module_quiz,
          SUM(CASE WHEN module_type = 'forum' THEN 1 ELSE 0 END) as total_module_forum,
          SUM(CASE WHEN module_type NOT IN ('assign', 'quiz', 'forum') THEN 1 ELSE 0 END) as total_module_other,
          COUNT(DISTINCT module_name) as total_modules,
          COUNT(DISTINCT course_id) as total_courses,
          COUNT(DISTINCT user_id) as total_users,
          MAX(grade) as highest_grade,
          MIN(grade) as lowest_grade,
          AVG(grade) as average_grade,
          MAX(timecreated) as last_activity,
          MIN(timecreated) as first_activity,
          MAX(created_at) as last_updated
        FROM monev_sp_etl_detail 
        ${whereClause}
      `;

      const result = await database.query(query, whereValues);
      return (
        result[0] || {
          total_logs: 0,
          total_module_assign: 0,
          total_module_quiz: 0,
          total_module_forum: 0,
          total_module_other: 0,
          total_modules: 0,
          total_courses: 0,
          total_users: 0,
          highest_grade: null,
          lowest_grade: null,
          average_grade: null,
          last_activity: null,
          first_activity: null,
          last_updated: null,
        }
      );
    } catch (error) {
      throw new Error(`Error getting module type summary: ${error.message}`);
    }
  }
}

module.exports = SpEtlDetailModel;
