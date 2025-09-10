const db = require("../database/connection");

class FinalGradeService {
  async fetchFinalGradesData(courseId) {
    let combinedQuery = `
            (SELECT 
                t3.course_name AS course_name, 
                t1.nilai AS student_final_grade
            FROM 
                monev_cp_student_assignment_detail t1
            INNER JOIN 
                monev_cp_activity_summary t2 ON t1.assignment_id = t2.activity_id
            INNER JOIN
                monev_sas_courses t3 ON t2.course_id = t3.course_id
                ${courseId ? `WHERE t2.course_id = ?` : ""})
            UNION ALL
            (SELECT 
                t3.course_name AS course_name, 
                t1.nilai AS student_final_grade
            FROM 
                monev_cp_student_quiz_detail t1
            INNER JOIN 
                monev_cp_activity_summary t2 ON t1.quiz_id = t2.activity_id
            INNER JOIN
                monev_sas_courses t3 ON t2.course_id = t3.course_id
                ${courseId ? `WHERE t2.course_id = ?` : ""})
        `;

    const queryParams = courseId ? [courseId, courseId] : [];

    try {
      const rows = await db.query(combinedQuery, queryParams);

      if (!Array.isArray(rows)) {
        console.error("Database query did not return an array:", rows);
        return { data: [], status: true };
      }

      const formattedData = this.formatDataForBoxplot(rows);
      return { data: formattedData, status: true };
    } catch (error) {
      throw new Error("Database query failed: " + error.message);
    }
  }

  async fetchKampusList() {
    const query = `
            SELECT DISTINCT 
                category_site AS id, 
                category_site AS name
            FROM 
                monev_sas_categories
            WHERE 
                category_site IS NOT NULL
        `;
    try {
      const rows = await db.query(query);
      return { data: Array.isArray(rows) ? rows : [], status: true };
    } catch (error) {
      console.error("Error fetching kampus:", error.message);
      throw new Error("Failed to fetch kampus list: " + error.message);
    }
  }

  async fetchFacultiesList(kampusId) {
    const query = `
            SELECT 
                category_id AS id, 
                category_name AS name
            FROM 
                monev_sas_categories
            WHERE 
                category_type = 'FACULTY'
                ${kampusId ? `AND category_site = ?` : ""}
            ORDER BY category_name ASC
        `;
    const queryParams = kampusId ? [kampusId] : [];
    try {
      const rows = await db.query(query, queryParams);
      return { data: Array.isArray(rows) ? rows : [], status: true };
    } catch (error) {
      console.error("Error fetching faculties:", error.message);
      throw new Error("Failed to fetch faculties list: " + error.message);
    }
  }

  async fetchProdisList(facultyId, kampusId) {
    if (!facultyId || !kampusId) {
      console.error("Invalid facultyId or kampusId:", { facultyId, kampusId });
      return {
        data: [],
        status: false,
        message: "facultyId and kampusId must be provided",
      };
    }
    const query = `
            SELECT 
                category_id AS id, 
                category_name AS name
            FROM 
                monev_sas_categories
            WHERE 
                category_type = 'STUDYPROGRAM'
                AND category_parent_id = ?
                AND category_site = ?
            ORDER BY category_name ASC
        `;
    const queryParams = [facultyId, kampusId];
    try {
      const rows = await db.query(query, queryParams);
      return { data: Array.isArray(rows) ? rows : [], status: true };
    } catch (error) {
      console.error("Error fetching prodis:", error.message);
      throw new Error("Failed to fetch prodis list: " + error.message);
    }
  }

  async fetchCoursesList(prodiId, kampusId) {
    let query = `
      SELECT 
        course_id AS id, 
        course_name AS name
      FROM 
        monev_sas_courses
    `;
    const queryParams = [];

    const conditions = [];
    if (prodiId) {
      conditions.push("program_id = ?");
      queryParams.push(prodiId);
    }
    if (kampusId) {
      // Note: kampusId filtering might need adjustment based on actual data structure
      // For now, we'll skip this filter since we don't have direct kampus mapping
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    try {
      const rows = await db.query(query, queryParams);
      return { data: Array.isArray(rows) ? rows : [], status: true };
    } catch (error) {
      console.error("Error fetching courses:", error.message);
      throw new Error("Failed to fetch courses list: " + error.message);
    }
  }

  async fetchFinalGradesByProdiId(prodiId) {
    let combinedQuery = `
            (SELECT 
                t3.course_name AS course_name, 
                t1.nilai AS student_final_grade
            FROM 
                monev_cp_student_assignment_detail t1
            INNER JOIN 
                monev_cp_activity_summary t2 ON t1.assignment_id = t2.activity_id
            INNER JOIN
                monev_sas_courses t3 ON t2.course_id = t3.course_id
                ${prodiId ? `WHERE t3.program_id = ?` : ""})
            UNION ALL
            (SELECT 
                t3.course_name AS course_name, 
                t1.nilai AS student_final_grade
            FROM 
                monev_cp_student_quiz_detail t1
            INNER JOIN 
                monev_cp_activity_summary t2 ON t1.quiz_id = t2.activity_id
            INNER JOIN
                monev_sas_courses t3 ON t2.course_id = t3.course_id
                ${prodiId ? `WHERE t3.program_id = ?` : ""})
        `;

    const queryParams = prodiId ? [prodiId, prodiId] : [];

    try {
      const rows = await db.query(combinedQuery, queryParams);

      if (!Array.isArray(rows)) {
        console.error("Database query did not return an array:", rows);
        return { data: [], status: true };
      }

      const formattedData = this.formatDataForBoxplot(rows);
      return { data: formattedData, status: true };
    } catch (error) {
      console.error("Error in fetchFinalGradesByProdiId:", error);
      throw new Error("Database query failed: " + error.message);
    }
  }

  async fetchFinalGradesByFilters(kampusId, facultyId, prodiId) {
    let combinedQuery = `
            (SELECT 
                t3.course_name AS course_name, 
                t1.nilai AS student_final_grade
            FROM 
                monev_cp_student_assignment_detail t1
            INNER JOIN 
                monev_cp_activity_summary t2 ON t1.assignment_id = t2.activity_id
            INNER JOIN
                monev_sas_courses t3 ON t2.course_id = t3.course_id
            INNER JOIN
                monev_sas_categories t4 ON t3.program_id = t4.category_id
            WHERE 1=1
                ${kampusId ? `AND t4.category_site = ?` : ""}
                ${facultyId ? `AND t4.category_parent_id = ?` : ""}
                ${prodiId ? `AND t3.program_id = ?` : ""})
            UNION ALL
            (SELECT 
                t3.course_name AS course_name, 
                t1.nilai AS student_final_grade
            FROM 
                monev_cp_student_quiz_detail t1
            INNER JOIN 
                monev_cp_activity_summary t2 ON t1.quiz_id = t2.activity_id
            INNER JOIN
                monev_sas_courses t3 ON t2.course_id = t3.course_id
            INNER JOIN
                monev_sas_categories t4 ON t3.program_id = t4.category_id
            WHERE 1=1
                ${kampusId ? `AND t4.category_site = ?` : ""}
                ${facultyId ? `AND t4.category_parent_id = ?` : ""}
                ${prodiId ? `AND t3.program_id = ?` : ""})
        `;

    const queryParams = [];
    if (kampusId) queryParams.push(kampusId);
    if (facultyId) queryParams.push(facultyId);
    if (prodiId) queryParams.push(prodiId);
    if (kampusId) queryParams.push(kampusId);
    if (facultyId) queryParams.push(facultyId);
    if (prodiId) queryParams.push(prodiId);

    try {
      const rows = await db.query(combinedQuery, queryParams);

      if (!Array.isArray(rows)) {
        console.error("Database query did not return an array:", rows);
        return { data: [], status: true };
      }

      const formattedData = this.formatDataForBoxplot(rows);
      return { data: formattedData, status: true };
    } catch (error) {
      console.error("Error in fetchFinalGradesByFilters:", error);
      throw new Error("Database query failed: " + error.message);
    }
  }

  async fetchCoursesByFilters(kampusId, facultyId, prodiId) {
    let query = `
      SELECT 
        t3.course_id AS id, 
        t3.course_name AS name
      FROM 
        monev_sas_courses t3
      INNER JOIN
        monev_sas_categories t4 ON t3.program_id = t4.category_id
      WHERE 1=1
        ${kampusId ? `AND t4.category_site = ?` : ""}
        ${facultyId ? `AND t4.category_parent_id = ?` : ""}
        ${prodiId ? `AND t3.program_id = ?` : ""}
      ORDER BY t3.course_name ASC
    `;

    const queryParams = [];
    if (kampusId) queryParams.push(kampusId);
    if (facultyId) queryParams.push(facultyId);
    if (prodiId) queryParams.push(prodiId);

    try {
      const rows = await db.query(query, queryParams);
      return { data: Array.isArray(rows) ? rows : [], status: true };
    } catch (error) {
      console.error("Error fetching courses by filters:", error.message);
      throw new Error("Failed to fetch courses list: " + error.message);
    }
  }

  formatDataForBoxplot(data) {
    const courseData = {};
    data.forEach((row) => {
      const { course_name, student_final_grade } = row;
      if (!courseData[course_name]) {
        courseData[course_name] = [];
      }
      const grade = parseFloat(student_final_grade);
      if (!isNaN(grade)) {
        courseData[course_name].push(grade);
      }
    });

    const formatted = Object.keys(courseData).map((course_name) => ({
      name: course_name,
      value: courseData[course_name],
    }));

    return formatted;
  }
}

module.exports = new FinalGradeService();
