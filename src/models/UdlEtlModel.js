const database = require("../database/connection");

class UdlEtlModel {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.username = data.username;
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.email = data.email;

    // Login Information
    this.lastaccess = data.lastaccess;
    this.formatted_lastaccess = data.formatted_lastaccess;
    this.lastlogin = data.lastlogin;
    this.formatted_lastlogin = data.formatted_lastlogin;
    this.currentlogin = data.currentlogin;
    this.formatted_currentlogin = data.formatted_currentlogin;
    this.lastip = data.lastip;
    this.auth = data.auth;
    this.firstaccess = data.firstaccess;
    this.formatted_firstaccess = data.formatted_firstaccess;

    // Primary Role Information
    this.role_id = data.role_id;
    this.role_name = data.role_name;
    this.role_shortname = data.role_shortname;
    this.archetype = data.archetype;
    this.course_id = data.course_id;

    // All Roles and Courses Information
    this.all_role_ids = data.all_role_ids;
    this.all_role_names = data.all_role_names;
    this.all_role_shortnames = data.all_role_shortnames;
    this.all_archetypes = data.all_archetypes;
    this.all_course_ids = data.all_course_ids;
    this.total_courses = data.total_courses;

    // Activity Tracking
    this.activity_hour = data.activity_hour;
    this.activity_date = data.activity_date;
    this.login_count = data.login_count;

    // Metadata
    this.extraction_date = data.extraction_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async getAllData(filters = {}) {
    try {
      let whereClause = "";
      let whereValues = [];

      // Build where clause based on filters
      if (filters.user_id) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "user_id = ?";
        whereValues.push(parseInt(filters.user_id));
      }

      if (filters.username) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "username = ?";
        whereValues.push(filters.username);
      }

      if (filters.email) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "email = ?";
        whereValues.push(filters.email);
      }

      if (filters.extraction_date) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "extraction_date = ?";
        whereValues.push(filters.extraction_date);
      }

      if (filters.activity_date) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "activity_date = ?";
        whereValues.push(filters.activity_date);
      }

      if (filters.activity_hour !== undefined) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "activity_hour = ?";
        whereValues.push(parseInt(filters.activity_hour));
      }

      if (filters.role_id) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "role_id = ?";
        whereValues.push(parseInt(filters.role_id));
      }

      if (filters.course_id) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "course_id = ?";
        whereValues.push(parseInt(filters.course_id));
      }

      const query = `
				SELECT * FROM monev_udl_etl 
				${whereClause}
				ORDER BY created_at DESC
			`;

      const result = await database.query(query, whereValues);
      return result.map((row) => new UdlEtlModel(row));
    } catch (error) {
      throw new Error(`Error getting UDL ETL data: ${error.message}`);
    }
  }

  static async upsert(data) {
    if (
      !data ||
      !data.user_id ||
      data.activity_hour === undefined ||
      !data.activity_date
    ) {
      throw new Error(
        "user_id, activity_hour, and activity_date are required for upsert"
      );
    }

    try {
      // First, check if record exists based on unique constraint
      const checkQuery = `
				SELECT id FROM monev_udl_etl 
				WHERE user_id = ? AND activity_hour = ? AND activity_date = ?
			`;
      const checkValues = [
        parseInt(data.user_id),
        parseInt(data.activity_hour),
        data.activity_date,
      ];

      const existingRecord = await database.query(checkQuery, checkValues);

      if (existingRecord.length > 0) {
        // Update existing record
        return await this.update(existingRecord[0].id, data);
      } else {
        // Insert new record
        return await this.create(data);
      }
    } catch (error) {
      throw new Error(`Error upserting UDL ETL data: ${error.message}`);
    }
  }

  static async create(data) {
    if (
      !data ||
      !data.user_id ||
      !data.username ||
      !data.firstname ||
      !data.lastname
    ) {
      throw new Error(
        "user_id, username, firstname, and lastname are required"
      );
    }

    try {
      const query = `
				INSERT INTO monev_udl_etl (
					user_id, username, firstname, lastname, email,
					lastaccess, formatted_lastaccess, lastlogin, formatted_lastlogin,
					currentlogin, formatted_currentlogin, lastip, auth, firstaccess, formatted_firstaccess,
					role_id, role_name, role_shortname, archetype, course_id,
					all_role_ids, all_role_names, all_role_shortnames, all_archetypes, all_course_ids, total_courses,
					activity_hour, activity_date, login_count, extraction_date, created_at, updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`;

      const values = [
        parseInt(data.user_id),
        data.username,
        data.firstname,
        data.lastname,
        data.email || null,
        parseInt(data.lastaccess) || 0,
        data.formatted_lastaccess || null,
        parseInt(data.lastlogin) || 0,
        data.formatted_lastlogin || null,
        parseInt(data.currentlogin) || 0,
        data.formatted_currentlogin || null,
        data.lastip || null,
        data.auth || "manual",
        parseInt(data.firstaccess) || 0,
        data.formatted_firstaccess || null,
        parseInt(data.role_id) || null,
        data.role_name || null,
        data.role_shortname || null,
        data.archetype || null,
        parseInt(data.course_id) || null,
        data.all_role_ids || null,
        data.all_role_names || null,
        data.all_role_shortnames || null,
        data.all_archetypes || null,
        (() => {
          if (Array.isArray(data.all_course_ids)) {
            return JSON.stringify(data.all_course_ids);
          }
          return data.all_course_ids || null;
        })(),
        parseInt(data.total_courses) || 0,
        parseInt(data.activity_hour) || null,
        data.activity_date,
        parseInt(data.login_count) || 1,
        data.extraction_date || new Date().toISOString().split("T")[0],
        new Date(),
        new Date(),
      ];

      const result = await database.query(query, values);

      return {
        affectedRows: result.affectedRows,
        insertId: result.insertId,
        message: "UDL ETL data created successfully",
        action: "created",
      };
    } catch (error) {
      throw new Error(`Error creating UDL ETL data: ${error.message}`);
    }
  }

  static async update(id, data) {
    if (!id) {
      throw new Error("ID is required for update");
    }

    try {
      let updateFields = [];
      let updateValues = [];

      // Build dynamic update query for all fields except the unique constraint fields
      const fieldsToUpdate = [
        "username",
        "firstname",
        "lastname",
        "email",
        "lastaccess",
        "formatted_lastaccess",
        "lastlogin",
        "formatted_lastlogin",
        "currentlogin",
        "formatted_currentlogin",
        "lastip",
        "auth",
        "firstaccess",
        "formatted_firstaccess",
        "role_id",
        "role_name",
        "role_shortname",
        "archetype",
        "course_id",
        "all_role_ids",
        "all_role_names",
        "all_role_shortnames",
        "all_archetypes",
        "all_course_ids",
        "total_courses",
        "login_count",
        "extraction_date",
      ];

      fieldsToUpdate.forEach((field) => {
        if (data[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          if (
            field.includes("_id") &&
            field !== "user_id" &&
            field !== "all_course_ids"
          ) {
            updateValues.push(parseInt(data[field]) || null);
          } else if (
            field === "total_courses" ||
            field === "login_count" ||
            field === "lastaccess" ||
            field === "lastlogin" ||
            field === "currentlogin" ||
            field === "firstaccess"
          ) {
            updateValues.push(parseInt(data[field]) || 0);
          } else {
            // Special handling for all_course_ids to ensure it's a string
            if (field === "all_course_ids") {
              if (Array.isArray(data[field])) {
                updateValues.push(JSON.stringify(data[field]));
              } else {
                updateValues.push(data[field]);
              }
            } else {
              updateValues.push(data[field]);
            }
          }
        }
      });

      // Always update the updated_at timestamp
      updateFields.push("updated_at = ?");
      updateValues.push(new Date());

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      updateValues.push(id);

      const query = `
				UPDATE monev_udl_etl 
				SET ${updateFields.join(", ")}
				WHERE id = ?
			`;

      const result = await database.query(query, updateValues);

      return {
        affectedRows: result.affectedRows,
        message: "UDL ETL data updated successfully",
        action: "updated",
      };
    } catch (error) {
      throw new Error(`Error updating UDL ETL data: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const result = await database.query(
        `SELECT * FROM monev_udl_etl WHERE id = ?`,
        [parseInt(id)]
      );
      return result.length > 0 ? new UdlEtlModel(result[0]) : null;
    } catch (error) {
      throw new Error(`Error getting UDL ETL data by ID: ${error.message}`);
    }
  }

  static async getByUniqueConstraint(user_id, activity_hour, activity_date) {
    try {
      const result = await database.query(
        `SELECT * FROM monev_udl_etl WHERE user_id = ? AND activity_hour = ? AND activity_date = ?`,
        [parseInt(user_id), parseInt(activity_hour), activity_date]
      );
      return result.length > 0 ? new UdlEtlModel(result[0]) : null;
    } catch (error) {
      throw new Error(
        `Error getting UDL ETL data by unique constraint: ${error.message}`
      );
    }
  }

  static async getActivitySummary(filters = {}) {
    try {
      let whereClause = "";
      let whereValues = [];

      if (filters.activity_date) {
        whereClause += " WHERE activity_date = ?";
        whereValues.push(filters.activity_date);
      }

      if (filters.activity_hour !== undefined) {
        whereClause += whereClause ? " AND " : " WHERE ";
        whereClause += "activity_hour = ?";
        whereValues.push(parseInt(filters.activity_hour));
      }

      const query = `
				SELECT 
					activity_date,
					activity_hour,
					COUNT(*) as total_users,
					SUM(login_count) as total_logins,
					COUNT(DISTINCT user_id) as unique_users
				FROM monev_udl_etl 
				${whereClause}
				GROUP BY activity_date, activity_hour
				ORDER BY activity_date DESC, activity_hour DESC
			`;

      const result = await database.query(query, whereValues);
      return result;
    } catch (error) {
      throw new Error(`Error getting activity summary: ${error.message}`);
    }
  }
}

module.exports = UdlEtlModel;
