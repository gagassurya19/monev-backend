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
        user_id,
        course_id,
        sort_by = "id",
        sort_order = "desc",
      } = params;

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build WHERE clause for search and filters
      let whereClause = "";
      let whereValues = [];

      // Build WHERE clause with all filters
      const conditions = [];

      // Add search filter
      if (search && search.trim() !== "") {
        conditions.push("(component LIKE ? OR action LIKE ? OR target LIKE ?)");
        const searchPattern = `%${search.trim()}%`;
        whereValues.push(searchPattern, searchPattern, searchPattern);
      }

      // Add user_id filter
      if (user_id) {
        conditions.push("user_id = ?");
        whereValues.push(parseInt(user_id));
      }

      // Add course_id filter
      if (course_id) {
        conditions.push("course_id = ?");
        whereValues.push(parseInt(course_id));
      }

      // Combine all conditions
      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(" AND ")}`;
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

      const sortField = allowedSortFields.includes(sort_by) ? sort_by : "id";
      const orderDirection =
        sort_order.toLowerCase() === "asc" ? "ASC" : "DESC";

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
          limit: parseInt(limit),
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

  static async getUserCourses(params = {}) {
    try {
      const { user_id } = params;

      // Build WHERE clause for filters
      let whereClause = "";
      let whereValues = [];

      // Add user_id filter
      if (user_id) {
        whereClause = "WHERE user_id = ?";
        whereValues.push(parseInt(user_id));
      }

      const query = `
        SELECT 
          course_id,
          course_name,
          course_shortname,
          COUNT(*) as total_activities,
          MAX(activity_date) as last_activity_date,
          MIN(activity_date) as first_activity_date
        FROM monev_tp_etl_detail
        ${whereClause}
        GROUP BY course_id, course_name, course_shortname
        ORDER BY course_id
      `;

      const result = await database.query(query, whereValues);

      // Format date fields to ensure they are strings or null
      return result.map((item) => ({
        ...item,
        last_activity_date: item.last_activity_date
          ? new Date(item.last_activity_date).toISOString().split("T")[0]
          : null,
        first_activity_date: item.first_activity_date
          ? new Date(item.first_activity_date).toISOString().split("T")[0]
          : null,
      }));
    } catch (error) {
      throw new Error(`Error getting user courses: ${error.message}`);
    }
  }

  static async getByUserIdCourseId(userId, courseId) {
    try {
      if (!userId || !courseId) {
        throw new Error("user_id and course_id are required");
      }

      const query = `
          SELECT 
            user_id,
            username,
            firstname,
            lastname,
            email,
            course_id,
            course_name,
            course_shortname,
            COUNT(*) as total_activities,
            COUNT(CASE WHEN component = 'mod_quiz' THEN 1 END) as quiz_logs,
            COUNT(CASE WHEN component = 'mod_forum' THEN 1 END) as forum_logs,
            COUNT(CASE WHEN component = 'mod_assign' THEN 1 END) as assign_logs,
            MAX(activity_date) as last_activity_date,
            MIN(activity_date) as first_activity_date
          FROM monev_tp_etl_detail 
          WHERE user_id = ? AND course_id = ?
          GROUP BY user_id, course_id, username, firstname, lastname, email, course_name, course_shortname
        `;

      const result = await database.query(query, [
        parseInt(userId),
        parseInt(courseId),
      ]);

      if (result && result.length > 0) {
        const data = result[0];

        // Format date fields to ensure they are strings
        return {
          ...data,
          last_activity_date: data.last_activity_date
            ? new Date(data.last_activity_date).toISOString().split("T")[0] // Format: YYYY-MM-DD
            : null,
          first_activity_date: data.first_activity_date
            ? new Date(data.first_activity_date).toISOString().split("T")[0] // Format: YYYY-MM-DD
            : null,
        };
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(
        `Error getting TpEtlDetail by user_id and course_id: ${error.message}`
      );
    }
  }
}

module.exports = TpEtlDetailModel;
