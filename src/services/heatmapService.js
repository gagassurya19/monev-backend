const database = require('../database/connection');

const getRawHeatmapData = async (role, startDate) => {
  const roleFilter = role === 'mahasiswa' ? 'student' : 'editingteacher'; 
  let query = `
    SELECT
      DAYOFWEEK(created_at) AS day_of_week,
      HOUR(created_at) AS hour_of_day,
      SUM(login_count) AS total_access
    FROM monev_sas_users_login_activity_etl
    WHERE role_shortname = ?
  `;
  const params = [roleFilter];
  if (startDate) {
    const startDateStr = new Date(startDate).toISOString().split('T')[0]; 
    query += ` AND DATE(created_at) >= ? AND DATE(created_at) < DATE_ADD(?, INTERVAL 7 DAY)`;
    params.push(startDateStr, startDateStr);
  }
  query += `
    GROUP BY DAYOFWEEK(created_at), HOUR(created_at)
    ORDER BY DAYOFWEEK(created_at), HOUR(created_at)
  `;
  try {
    const [rows] = await database.query(query, params);
    return Array.isArray(rows) ? rows : rows ? [rows] : [];
  } catch (error) {
    console.error('Error query database:', error);
    throw error;
  }
};

const formatHeatmapData = (rawData) => {
  console.log('Data mentah diterima:', rawData);
  if (!Array.isArray(rawData)) {
    console.warn('rawData bukan array, mengembalikan grid kosong');
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
      console.warn('Data tidak valid:', row);
    }
  });
  return heatmapGrid;
};

module.exports = {
  getRawHeatmapData,
  formatHeatmapData,
};