const database = require("../database/connection");

const getRawHeatmapData = async (
  role,
  startDate,
  kampusId,
  fakultasId,
  prodiId,
  matakuliahId
) => {
  const roleFilter = role === "mahasiswa" ? "student" : "editingteacher";

  // Query dasar untuk mendapatkan data heatmap dengan join ke monev_sas_courses
  let query = `
    SELECT
      DAYOFWEEK(udl.activity_date) AS day_of_week,
      udl.activity_hour AS hour_of_day,
      SUM(udl.login_count) AS total_access,
      udl.all_course_ids,
      udl.user_id,
      udl.username,
      c.course_id,
      c.faculty_id,
      c.program_id
    FROM monev_udl_etl udl
    INNER JOIN monev_sas_courses c ON (
      JSON_CONTAINS(udl.all_course_ids COLLATE utf8mb4_unicode_ci, CONCAT('"', CAST(c.course_id AS CHAR), '"'))
    )
    WHERE udl.role_shortname = ?
  `;
  const params = [roleFilter];

  // Add date filter
  if (startDate) {
    const startDateStr = new Date(startDate).toISOString().split("T")[0];
    query += ` AND udl.activity_date >= ? AND udl.activity_date <= DATE_ADD(?, INTERVAL 6 DAY)`;
    params.push(startDateStr, startDateStr);
  }

  // Add course filter - langsung filter pada course_id yang sudah di-join
  if (matakuliahId) {
    query += ` AND c.course_id = ?`;
    params.push(matakuliahId);
  }

  // Add faculty filter - langsung filter pada faculty_id yang sudah di-join
  if (fakultasId) {
    query += ` AND c.faculty_id = ?`;
    params.push(fakultasId);
  }

  // Add study program filter - langsung filter pada program_id yang sudah di-join
  if (prodiId) {
    query += ` AND c.program_id = ?`;
    params.push(prodiId);
  }

  // Add campus filter - perlu join dengan monev_sas_categories untuk mendapatkan category_site
  if (kampusId) {
    query += ` AND EXISTS (
      SELECT 1 FROM monev_sas_categories faculty 
      WHERE faculty.category_id = c.faculty_id AND faculty.category_site = ?
      UNION
      SELECT 1 FROM monev_sas_categories program 
      WHERE program.category_id = c.program_id AND program.category_site = ?
    )`;
    params.push(kampusId, kampusId);
  }

  query += `
    GROUP BY DAYOFWEEK(udl.activity_date), udl.activity_hour
    ORDER BY DAYOFWEEK(udl.activity_date), udl.activity_hour
  `;

  try {
    const rows = await database.query(query, params);
    const result = Array.isArray(rows) ? rows : rows ? [rows] : [];
    return result;
  } catch (error) {
    console.error("Error query database:", error);
    throw error;
  }
};

const formatHeatmapData = (rawData) => {
  if (!Array.isArray(rawData)) {
    return new Array(24).fill(0).map(() => new Array(7).fill(0));
  }
  const heatmapGrid = new Array(24).fill(0).map(() => new Array(7).fill(0));
  rawData.forEach((row) => {
    const dayIndex = row.day_of_week === 1 ? 6 : row.day_of_week - 2;
    const hourIndex = Number(row.hour_of_day);
    const totalAccess = parseInt(row.total_access, 10) || 0;
    if (dayIndex >= 0 && dayIndex < 7 && hourIndex >= 0 && hourIndex < 24) {
      heatmapGrid[hourIndex][dayIndex] = totalAccess;
    }
  });
  return heatmapGrid;
};

module.exports = {
  getRawHeatmapData,
  formatHeatmapData,
};
