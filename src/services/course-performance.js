const mysql = require('mysql2/promise')
const config = require('../../config')
const logger = require('../utils/logger');
const database = require('../database/connection');

const detailActivity = {
  getCourseActivityInfo: async (course_id, activity_type, activity_id) => {
    const resultActivity = await database.query(`
      SELECT * FROM moodle_logs.course_activity_summary cas
      WHERE cas.course_id = ? AND cas.activity_type = ? AND cas.activity_id = ?
    `, [course_id, activity_type, activity_id]);
    
    const resultCourse = await database.query(`
      SELECT * FROM moodle_logs.course_summary cs
      WHERE cs.course_id = ?
    `, [course_id]);

    const result = {
      activity: resultActivity[0] || null,
      course: resultCourse[0] || null
    }

    return result;
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
      SELECT COUNT(*) as total FROM moodle_logs.student_quiz_detail sqd
      LEFT JOIN moodle_logs.student_profile sp ON sp.user_id = sqd.user_id
      WHERE ${where.join(' AND ')}
    `;
    const [countResult] = await database.query(countQuery, params);
    const totalCount = countResult?.total || 0;

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
      FROM moodle_logs.student_quiz_detail sqd
      LEFT JOIN moodle_logs.student_profile sp ON sp.user_id = sqd.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY sqd.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    const [students] = await database.query(dataQuery, [...params, limit, offset]);

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
      SELECT COUNT(*) as total FROM moodle_logs.student_assignment_detail sad
      LEFT JOIN moodle_logs.student_profile sp ON sp.user_id = sad.user_id
      WHERE ${where.join(' AND ')}
    `;
    const [countResult] = await database.query(countQuery, params);
    const totalCount = countResult?.total || 0;

    let sortBy = filters.sort_by || 'full_name';
    if (sortBy === 'waktu_aktivitas') sortBy = 'waktu_submit';
    const sortOrder = filters.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;

    const dataQuery = `
      SELECT sad.id, sad.user_id, sad.nim, sad.full_name, sp.program_studi,
             sad.waktu_submit, sad.waktu_pengerjaan AS durasi_pengerjaan, sad.nilai,
             sad.waktu_submit AS waktu_aktivitas
      FROM moodle_logs.student_assignment_detail sad
      LEFT JOIN moodle_logs.student_profile sp ON sp.user_id = sad.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY sad.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    const [students] = await database.query(dataQuery, [...params, limit, offset]);

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
      SELECT COUNT(*) as total FROM moodle_logs.student_resource_access sra
      LEFT JOIN moodle_logs.student_profile sp ON sp.user_id = sra.user_id
      WHERE ${where.join(' AND ')}
    `;
    const [countResult] = await database.query(countQuery, params);
    const totalCount = countResult?.total || 0;

    let sortBy = filters.sort_by || 'full_name';
    if (sortBy === 'waktu_aktivitas') sortBy = 'waktu_akses';
    if (sortBy === 'nilai') sortBy = 'full_name'; // fallback
    const sortOrder = filters.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;

    const dataQuery = `
      SELECT sra.id, sra.user_id, sra.nim, sra.full_name, sp.program_studi,
             sra.waktu_akses, sra.waktu_akses AS waktu_aktivitas
      FROM moodle_logs.student_resource_access sra
      LEFT JOIN moodle_logs.student_profile sp ON sp.user_id = sra.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY sra.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    const [students] = await database.query(dataQuery, [...params, limit, offset]);

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
    const result = await database.query(`
      SELECT COUNT(*) AS total_participants,
             AVG(nilai) AS average_score,
             COUNT(CASE WHEN nilai IS NOT NULL THEN 1 END) AS completed_count
      FROM moodle_logs.student_quiz_detail
      WHERE quiz_id = ?
    `, [quizId]);

    const stats = result[0] || {};
    const completionRate = stats.total_participants > 0
      ? (stats.completed_count / stats.total_participants) * 100
      : 0;

    console.log(stats)

    return {
      total_participants: stats.total_participants || 0,
      average_score: stats.average_score ? Number(stats.average_score).toFixed(2) : null,
      completion_rate: Number(completionRate.toFixed(2)),
    };
  },

  async calculateAssignmentStatistics(assignmentId) {
    const rows = await database.query(`
      SELECT COUNT(*) AS total_participants,
             AVG(nilai) AS average_score,
             COUNT(CASE WHEN nilai IS NOT NULL THEN 1 END) AS completed_count
      FROM moodle_logs.student_assignment_detail
      WHERE assignment_id = ?
    `, [assignmentId]);
  
    const stats = rows[0] || {};
    
    const totalParticipants = Number(stats.total_participants || 0);
    const completedCount = Number(stats.completed_count || 0);
    const rawAverage = stats.average_score !== null ? Number(stats.average_score) : null;
  
    const completionRate = totalParticipants > 0
      ? (completedCount / totalParticipants) * 100
      : 0;
  
    return {
      total_participants: totalParticipants,
      average_score: rawAverage !== null ? Number(rawAverage.toFixed(2)) : null,
      completion_rate: Number(completionRate.toFixed(2)),
    };
  },

  async calculateResourceStatistics(resourceId) {
    const result = await database.query(`
      SELECT COUNT(DISTINCT user_id) AS total_participants
      FROM moodle_logs.student_resource_access
      WHERE resource_id = ?
    `, [resourceId]);

    const stats = result[0] || {};

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
    let params = [];
    let joins = '';
  
    // Search filter
    if (filters.search) {
      whereConditions.push(`(cs.course_name LIKE ? OR cs.kelas LIKE ?)`);
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
  
    // Dosen pengampu filter
    if (filters.dosen_pengampu) {
      whereConditions.push(`cs.dosen_pengampu LIKE ?`);
      params.push(`%${filters.dosen_pengampu}%`);
    }
  
    // Join jika activity_type disaring
    if (filters.activity_type) {
      joins += ` JOIN moodle_logs.course_activity_summary cas ON cas.course_id = cs.course_id`;
      whereConditions.push(`cas.activity_type = ?`);
      params.push(filters.activity_type);
    }
  
    // WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
    // COUNT query
    const countQuery = `
      SELECT COUNT(DISTINCT cs.course_id) AS total
      FROM moodle_logs.course_summary cs
      ${joins}
      ${whereClause}
    `;
  
    const countRows = await database.query(countQuery, params);
    const totalCount = countRows[0]?.total || 0;
  
    // Base SELECT query
    let baseQuery = `
      SELECT DISTINCT cs.course_id, cs.course_name, cs.kelas,
              cs.jumlah_aktivitas, cs.jumlah_mahasiswa, cs.dosen_pengampu
      FROM moodle_logs.course_summary cs
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
  
    baseQuery += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
  
    const rows = await database.query(baseQuery, params);

    console.log(rows)
  
    return {
      data: rows,
      total_count: totalCount
    };
  },

  getCourseActivities: async (course_id, filters = {}, pagination = {}) => {
    const courseRows = await database.query(`SELECT course_id, course_name, kelas FROM moodle_logs.course_summary WHERE course_id = ?`, [course_id])

    const courseInfo = courseRows[0]
    if (!courseInfo) return null;

    const whereClauses = ['cas.course_id = ?'];
    const params = [course_id];

    if (filters.activity_type) {
      whereClauses.push('cas.activity_type = ?');
      params.push(filters.activity_type);
    }

    if (filters.activity_id) {
      whereClauses.push('cas.activity_id = ?');
      params.push(filters.activity_id);
    }

    if (filters.section) {
      whereClauses.push('cas.section = ?');
      params.push(filters.section);
    }

    const whereSQL = whereClauses.join(' AND ');

    const [countRows] = await database.query(
      `SELECT COUNT(*) AS total FROM moodle_logs.course_activity_summary cas WHERE ${whereSQL}`,
      params
    );
    const total_count = countRows.total;

    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    params.push(limit);
    params.push(offset);

    const activityRows = await database.query(
      `SELECT cas.id, cas.course_id, cas.section, cas.activity_id, 
              cas.activity_type, cas.activity_name, cas.accessed_count, 
              cas.submission_count, cas.graded_count, cas.attempted_count, 
              cas.created_at
      FROM moodle_logs.course_activity_summary cas
      WHERE ${whereSQL}
      ORDER BY cas.section ASC, cas.activity_name ASC
      LIMIT ? OFFSET ?`,
      params
    );

    return {
      data: activityRows,
      total_count,
      course_info: courseInfo
    };
  },
  detailActivity
}

module.exports = coursePerformanceService