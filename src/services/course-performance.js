const mysql = require('mysql2/promise')
const config = require('../../config')
const logger = require('../utils/logger');
const database = require('../database/connection');
const dbConfig = require('../../config/database');

const detailActivity = {
  getCourseActivityInfo: async (course_id, activity_type, activity_id) => {
    const [activityRows] = await database.query(`
      SELECT * FROM ${dbConfig.dbNames.main}.monev_cp_activity_summary
      WHERE course_id = ? AND activity_type = ? AND activity_id = ?
    `, [course_id, activity_type, activity_id]);
  
    const [courseRows] = await database.query(`
      SELECT * FROM ${dbConfig.dbNames.main}.monev_cp_course_summary
      WHERE course_id = ?
    `, [course_id]);
  
    return {
      activity: activityRows || null,
      course: courseRows || null
    };
  },  

  async getQuizStudents(request, h, quizId, filters = {}, pagination = {}) {
    const where = [`sqd.quiz_id = ?`];
    const params = [quizId];
  
    if (filters.search) {
      where.push(`(sqd.full_name LIKE ? OR sqd.nim LIKE ?)`);
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
  
    if (filters.program_studi) {
      where.push(`sp.program_studi LIKE ?`);
      params.push(`%${filters.program_studi}%`);
    }
  
    const countQuery = `
      SELECT COUNT(*) as total FROM ${dbConfig.dbNames.main}.monev_cp_student_quiz_detail sqd
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sqd.user_id
      WHERE ${where.join(' AND ')}
    `;
    const [countRows] = await database.query(countQuery, params);
    const totalCount = countRows?.total || 0;
  
    let sortBy = filters.sort_by || 'full_name';
    if (sortBy === 'waktu_aktivitas') sortBy = 'waktu_mulai';
    const validSort = ['full_name', 'nim', 'nilai', 'waktu_mulai'];
    if (!validSort.includes(sortBy)) sortBy = 'full_name';
  
    const sortOrder = filters.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;
  
    const dataQuery = `
      SELECT sqd.id, sqd.user_id, sqd.nim, sqd.full_name, sp.program_studi,
             sqd.waktu_mulai, sqd.waktu_selesai, sqd.durasi_waktu AS durasi_pengerjaan,
             sqd.jumlah_soal, sqd.jumlah_dikerjakan, sqd.nilai, sqd.waktu_mulai AS waktu_aktivitas
      FROM ${dbConfig.dbNames.main}.monev_cp_student_quiz_detail sqd
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sqd.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY sqd.${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const studentsResult = await database.query(dataQuery, params);
    const students = Array.isArray(studentsResult) ? studentsResult : (studentsResult && studentsResult[0] ? studentsResult[0] : [])
  
    const statistics = await detailActivity.calculateQuizStatistics(quizId);
  
    return {
      data: students || [],
      pagination: {
        current_page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(totalCount / limit),
        total_items: totalCount,
        items_per_page: limit
      },
      statistics,
    };
  },  

  async getAssignmentStudents(request, h, assignmentId, filters = {}, pagination = {}) {
    const where = [`sad.assignment_id = ?`];
    const params = [assignmentId];
  
    if (filters.search) {
      where.push(`(sad.full_name LIKE ? OR sad.nim LIKE ?)`);
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
  
    if (filters.program_studi) {
      where.push(`sp.program_studi LIKE ?`);
      params.push(`%${filters.program_studi}%`);
    }
  
    const countQuery = `
      SELECT COUNT(*) as total FROM ${dbConfig.dbNames.main}.monev_cp_student_assignment_detail sad
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sad.user_id
      WHERE ${where.join(' AND ')}
    `;
    const [countRows] = await database.query(countQuery, params);
    const totalCount = countRows?.total || 0;
  
    let sortBy = filters.sort_by || 'full_name';
    if (sortBy === 'waktu_aktivitas') sortBy = 'waktu_submit';
    const sortOrder = filters.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;
  
    const dataQuery = `
      SELECT sad.id, sad.user_id, sad.nim, sad.full_name, sp.program_studi,
             sad.waktu_submit, sad.waktu_pengerjaan AS durasi_pengerjaan, sad.nilai,
             sad.waktu_submit AS waktu_aktivitas
      FROM ${dbConfig.dbNames.main}.monev_cp_student_assignment_detail sad
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sad.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY sad.${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const studentsResult = await database.query(dataQuery, params);
    const students = Array.isArray(studentsResult) ? studentsResult : (studentsResult && studentsResult[0] ? studentsResult[0] : [])
  
    const statistics = await detailActivity.calculateAssignmentStatistics(assignmentId);
  
    return {
      data: students || [],
      pagination: {
        current_page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(totalCount / limit),
        total_items: totalCount,
        items_per_page: limit
      },
      statistics,
    };
  },  

  async getResourceStudents(request, h, resourceId, filters = {}, pagination = {}) {
    const where = [`sra.resource_id = ?`];
    const params = [resourceId];
  
    if (filters.search) {
      where.push(`(sra.full_name LIKE ? OR sra.nim LIKE ?)`);
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
  
    if (filters.program_studi) {
      where.push(`sp.program_studi LIKE ?`);
      params.push(`%${filters.program_studi}%`);
    }
  
    const countQuery = `
      SELECT COUNT(*) as total FROM ${dbConfig.dbNames.main}.monev_cp_student_resource_access sra
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sra.user_id
      WHERE ${where.join(' AND ')}
    `;
    const [countRows] = await database.query(countQuery, params);
    const totalCount = countRows?.total || 0;
  
    let sortBy = filters.sort_by || 'full_name';
    if (sortBy === 'waktu_aktivitas') sortBy = 'waktu_akses';
    if (sortBy === 'nilai') sortBy = 'full_name'; // fallback
    const sortOrder = filters.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;
  
    const dataQuery = `
      SELECT sra.id, sra.user_id, sra.nim, sra.full_name, sp.program_studi,
             sra.waktu_akses, sra.waktu_akses AS waktu_aktivitas
      FROM ${dbConfig.dbNames.main}.monev_cp_student_resource_access sra
      LEFT JOIN ${dbConfig.dbNames.main}.monev_cp_student_profile sp ON sp.user_id = sra.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY sra.${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const studentsResult = await database.query(dataQuery, params);
    const students = Array.isArray(studentsResult) ? studentsResult : (studentsResult && studentsResult[0] ? studentsResult[0] : [])
  
    const statistics = await detailActivity.calculateResourceStatistics(resourceId);
  
    return {
      data: students || [],
      pagination: {
        current_page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(totalCount / limit),
        total_items: totalCount,
        items_per_page: limit
      },
      statistics,
    };
  },  

  async calculateQuizStatistics(quizId) {
    const [result] = await database.query(`
      SELECT COUNT(*) AS total_participants,
             AVG(nilai) AS average_score,
             COUNT(CASE WHEN nilai IS NOT NULL THEN 1 END) AS completed_count
      FROM ${dbConfig.dbNames.main}.monev_cp_student_quiz_detail
      WHERE quiz_id = ?
    `, [quizId]);
  
    const stats = result || {};
    const completionRate = stats.total_participants > 0
      ? (stats.completed_count / stats.total_participants) * 100
      : 0;
  
    return {
      total_participants: stats.total_participants || 0,
      average_score: stats.average_score ? Number(stats.average_score).toFixed(2) : null,
      completion_rate: Number(completionRate.toFixed(2)),
    };
  },
  
  async calculateAssignmentStatistics(assignmentId) {
    const [rows] = await database.query(`
      SELECT COUNT(*) AS total_participants,
             AVG(nilai) AS average_score,
             COUNT(CASE WHEN nilai IS NOT NULL THEN 1 END) AS completed_count
      FROM ${dbConfig.dbNames.main}.monev_cp_student_assignment_detail
      WHERE assignment_id = ?
    `, [assignmentId]);
  
    const stats = rows || {};
    const completionRate = stats.total_participants > 0
      ? (stats.completed_count / stats.total_participants) * 100
      : 0;
  
    return {
      total_participants: stats.total_participants || 0,
      average_score: stats.average_score ? Number(stats.average_score).toFixed(2) : null,
      completion_rate: Number(completionRate.toFixed(2)),
    };
  },
  
  async calculateResourceStatistics(resourceId) {
    const [rows] = await database.query(`
      SELECT COUNT(DISTINCT user_id) AS total_participants
      FROM ${dbConfig.dbNames.main}.monev_cp_student_resource_access
      WHERE resource_id = ?
    `, [resourceId]);
  
    const stats = rows || {};
    return {
      total_participants: stats.total_participants || 0,
      completion_rate: 100,
    };
  }  
};

const coursePerformanceService = {
  getCoursesWithFilters: async (filters = {}, pagination = {}) =>  {
    const validSortFields = ['course_name', 'jumlah_mahasiswa', 'jumlah_aktivitas', 'keaktifan'];
    let whereConditions = [];
    let whereParams = [];
    let joins = '';
  
    // Filter search
    if (filters.search) {
      whereConditions.push(`(cs.course_name LIKE ? OR cs.kelas LIKE ?)`);
      whereParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }
  
    // Filter dosen pengampu
    if (filters.dosen_pengampu) {
      whereConditions.push(`cs.dosen_pengampu LIKE ?`);
      whereParams.push(`%${filters.dosen_pengampu}%`);
    }
  
    // Join jika ada filter activity_type
    if (filters.activity_type) {
      joins += ` JOIN ${dbConfig.dbNames.main}.monev_cp_activity_summary cas ON cas.course_id = cs.course_id`;
      whereConditions.push(`cas.activity_type = ?`);
      whereParams.push(filters.activity_type);
    }
  
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
    // Query total count
    const countQuery = `
      SELECT COUNT(DISTINCT cs.course_id) AS total
      FROM ${dbConfig.dbNames.main}.monev_cp_course_summary cs
      ${joins}
      ${whereClause}
    `;
  
    const [countResult] = await database.query(countQuery, whereParams);
    const totalCount = countResult?.total || 0;
  
    // Query data utama
    let baseQuery = `
      SELECT DISTINCT cs.course_id, cs.course_name, cs.kelas,
             cs.jumlah_aktivitas, cs.jumlah_mahasiswa, cs.dosen_pengampu
      FROM ${dbConfig.dbNames.main}.monev_cp_course_summary cs
      ${joins}
      ${whereClause}
    `;
  
    // Sorting
    const sortBy = validSortFields.includes(filters.sort_by) ? filters.sort_by : 'keaktifan';
    const sortOrder = (filters.sort_order || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
    if (sortBy === 'keaktifan') {
      baseQuery += ` ORDER BY (cs.jumlah_aktivitas / NULLIF(cs.jumlah_mahasiswa, 0)) * 100 ${sortOrder}`;
    } else {
      baseQuery += ` ORDER BY cs.${sortBy} ${sortOrder}`;
    }
  
    // Pagination
    const limit = Number(pagination.limit) || 10;
    const offset = Number(pagination.offset) || 0;
    baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;

    const rows = await database.query(baseQuery, whereParams);
  
    return {
      data: rows,
      total_count: totalCount
    };
  },  

  getCourseActivities: async (course_id, filters = {}, pagination = {}) => {
    const [courseRows] = await database.query(
      `SELECT course_id, course_name, kelas 
       FROM ${dbConfig.dbNames.main}.monev_cp_course_summary 
       WHERE course_id = ?`, 
      [course_id]
    );
  
    const courseInfo = courseRows;
    if (!courseInfo) return null;
  
    const whereClauses = ['cas.course_id = ?'];
    const whereParams = [course_id];
  
    if (filters.activity_type) {
      whereClauses.push('cas.activity_type = ?');
      whereParams.push(filters.activity_type);
    }
  
    if (filters.activity_id) {
      whereClauses.push('cas.activity_id = ?');
      whereParams.push(filters.activity_id);
    }
  
    if (filters.section) {
      whereClauses.push('cas.section = ?');
      whereParams.push(filters.section);
    }
  
    const whereSQL = whereClauses.join(' AND ');
  
    // Hitung total
    const [countRows] = await database.query(
      `SELECT COUNT(*) AS total 
       FROM ${dbConfig.dbNames.main}.monev_cp_activity_summary cas 
       WHERE ${whereSQL}`, 
      whereParams
    );
  
    const total_count = countRows?.total || 0;
  
        // Ambil data aktivitas
    const limit = Number(pagination.limit) || 20;
    const offset = Number(pagination.offset) || 0;

    const activityRows = await database.query(
      `SELECT cas.id, cas.course_id, cas.section, cas.activity_id, 
              cas.activity_type, cas.activity_name, cas.accessed_count, 
              cas.submission_count, cas.graded_count, cas.attempted_count, 
              cas.created_at
       FROM ${dbConfig.dbNames.main}.monev_cp_activity_summary cas
       WHERE ${whereSQL}
       ORDER BY cas.section ASC, cas.activity_name ASC
       LIMIT ${limit} OFFSET ${offset}`, 
      whereParams
    );
  
    return {
      data: activityRows,
      total_count,
      course_info: courseInfo
    };
  },  

  getStatusETLLastRun: async (request, h) => {
    try {
      const lastRunQuery = `
        SELECT * FROM ${dbConfig.dbNames.main}.monev_cp_fetch_logs 
        ORDER BY id DESC 
        LIMIT 1
      `;
      const lastRunResult = await database.query(lastRunQuery);
      const lastRun = lastRunResult[0] || null;
      
      const runningQuery = `
        SELECT COUNT(*) as running_count 
        FROM ${dbConfig.dbNames.main}.monev_cp_fetch_logs 
        WHERE status = 2
      `;
      const runningResult = await database.query(runningQuery);
      const isRunning = runningResult[0]?.running_count > 0;
      
      const response = {
        status: 'active',
        lastRun: lastRun ? {
          id: lastRun.id,
          start_date: lastRun.start_date,
          end_date: lastRun.end_date,
          status: lastRun.status === 1 ? 'finished' : (lastRun.status === 2 ? 'inprogress' : 'failed'),
          total_records: lastRun.numrow,
          offset: lastRun.offset
        } : null,
        nextRun: 'Every hour at minute 0',
        isRunning: isRunning
      };
      
      return h.response({
        status: true,
        data: response
      }).code(200);
      
    } catch (error) {
      logger.error('Error getting ETL status:', error.message);
      return h.response({
        status: false,
        message: 'Failed to get ETL status',
        error: error.message
      }).code(500);
    }
  },

  getHistoryETLRun: async (request, h) => {
    try {
      const { limit = 20, offset = 0 } = request.query;
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total FROM ${dbConfig.dbNames.main}.monev_cp_fetch_logs
      `;
      const [countResult] = await database.query(countQuery);
      const total = countResult?.total || 0;
      
      // Get logs with pagination
      const logsQuery = `
        SELECT * FROM ${dbConfig.dbNames.main}.monev_cp_fetch_logs 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?
      `;
      const logsResult = await database.query(logsQuery, [parseInt(limit), parseInt(offset)]);
      const logs = logsResult || [];
      
      // Format logs
      const formattedLogs = [];
      for (const log of logs) {
        let duration = null;
        if (log.start_date && log.end_date) {
          const start = new Date(log.start_date);
          const end = new Date(log.end_date);
          const diffMs = end - start;
          const diffHrs = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);
          
          duration = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
        }
        
        formattedLogs.push({
          id: log.id,
          start_date: log.start_date,
          end_date: log.end_date,
          duration: duration,
          status: log.status === 1 ? 'finished' : (log.status === 2 ? 'inprogress' : 'failed'),
          total_records: log.numrow,
          offset: log.offset,
          created_at: log.created_at || null
        });
      }
      
      return h.response({
        status: true,
        data: {
          logs: formattedLogs,
          pagination: {
            total: total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            current_page: Math.floor(offset / limit) + 1,
            total_pages: Math.ceil(total / limit)
          }
        }
      }).code(200);
      
    } catch (error) {
      logger.error('Error getting ETL history:', error.message);
      return h.response({
        status: false,
        message: 'Failed to get ETL history',
        error: error.message
      }).code(500);
    }
  },
  detailActivity
}

module.exports = coursePerformanceService