const database = require("../database/connection");

const getRawHeatmapData = async (role, startDate) => {
  const roleFilter = role === "mahasiswa" ? "student" : "editingteacher";
  let query = `
    SELECT
      DAYOFWEEK(activity_date) AS day_of_week,
      activity_hour AS hour_of_day,
      SUM(login_count) AS total_access
    FROM monev_udl_etl
    WHERE role_shortname = ?
  `;
  const params = [roleFilter];
  if (startDate) {
    const startDateStr = new Date(startDate).toISOString().split("T")[0];
    console.log(`startDateStr: ${startDateStr}`);
    query += ` AND activity_date >= ? AND activity_date <= DATE_ADD(?, INTERVAL 6 DAY)`;
    params.push(startDateStr, startDateStr);
  }
  query += `
    GROUP BY DAYOFWEEK(activity_date), activity_hour
    ORDER BY DAYOFWEEK(activity_date), activity_hour
  `;
  try {
    console.log(`Query: ${query}`);
    console.log(`Params: ${JSON.stringify(params)}`);

    const rows = await database.query(query, params);
    const result = Array.isArray(rows) ? rows : rows ? [rows] : [];
    console.log(`result: ${JSON.stringify(result, null, 2)}`);
    return result;
  } catch (error) {
    console.error("Error query database:", error);
    throw error;
  }
};

const formatHeatmapData = (rawData) => {
  console.log("Data mentah diterima:", rawData);
  if (!Array.isArray(rawData)) {
    console.warn("rawData bukan array, mengembalikan grid kosong");
    return new Array(24).fill(0).map(() => new Array(7).fill(0));
  }
  const heatmapGrid = new Array(24).fill(0).map(() => new Array(7).fill(0));
  rawData.forEach((row) => {
    const dayIndex = row.day_of_week === 1 ? 6 : row.day_of_week - 2;
    const hourIndex = Number(row.hour_of_day);
    const totalAccess = parseInt(row.total_access, 10) || 0;
    if (dayIndex >= 0 && dayIndex < 7 && hourIndex >= 0 && hourIndex < 24) {
      heatmapGrid[hourIndex][dayIndex] = totalAccess;
    } else {
      console.warn("Data tidak valid:", row);
    }
  });
  return heatmapGrid;
};

module.exports = {
  getRawHeatmapData,
  formatHeatmapData,
};
