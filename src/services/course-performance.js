const mysql = require('mysql2/promise')
const config = require('../../config')
const logger = require('../utils/logger');
const database = require('../database/connection');

const detailActivity = {
  getCourseActivityInfo: async (course_id, activity_type, activity_id) => {
    const [activityRows] = await database.query(`
      SELECT * FROM monev_cp_activity_summary
      WHERE course_id = ? AND activity_type = ? AND activity_id = ?
    `, [course_id, activity_type, activity_id]);
  
    const [courseRows] = await database.query(`
      SELECT * FROM monev_cp_course_summary
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
      SELECT COUNT(*) as total FROM monev_cp_student_quiz_detail sqd
      LEFT JOIN monev_cp_student_profile sp ON sp.user_id = sqd.user_id
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
      FROM monev_cp_student_quiz_detail sqd
      LEFT JOIN monev_cp_student_profile sp ON sp.user_id = sqd.user_id
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
      SELECT COUNT(*) as total FROM monev_cp_student_assignment_detail sad
      LEFT JOIN monev_cp_student_profile sp ON sp.user_id = sad.user_id
      WHERE ${where.join(' AND ')}
    `;
    const [countRows] = await database.query(countQuery, params);
    const totalCount = countRows?.total || 0;
  
    let sortBy = filters.sort_by || 'full_name';
    if (sortBy === 'waktu_aktivitas') sortBy = 'waktu_submit';
    const validSort = ['full_name', 'nim', 'nilai', 'waktu_submit'];
    if (!validSort.includes(sortBy)) sortBy = 'full_name';
  
    const sortOrder = filters.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;
  
    const dataQuery = `
      SELECT sad.id, sad.user_id, sad.nim, sad.full_name, sp.program_studi,
             sad.waktu_submit, sad.waktu_pengerjaan AS durasi_pengerjaan,
             sad.nilai, sad.waktu_submit AS waktu_aktivitas
      FROM monev_cp_student_assignment_detail sad
      LEFT JOIN monev_cp_student_profile sp ON sp.user_id = sad.user_id
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
      SELECT COUNT(*) as total FROM monev_cp_student_resource_access sra
      LEFT JOIN monev_cp_student_profile sp ON sp.user_id = sra.user_id
      WHERE ${where.join(' AND ')}
    `;
    const [countRows] = await database.query(countQuery, params);
    const totalCount = countRows?.total || 0;
  
    let sortBy = filters.sort_by || 'full_name';
    if (sortBy === 'waktu_aktivitas') sortBy = 'waktu_akses';
    const validSort = ['full_name', 'nim', 'waktu_akses'];
    if (!validSort.includes(sortBy)) sortBy = 'full_name';
  
    const sortOrder = filters.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;
  
    const dataQuery = `
      SELECT sra.id, sra.user_id, sra.nim, sra.full_name, sp.program_studi,
             sra.waktu_akses, sra.waktu_akses AS waktu_aktivitas
      FROM monev_cp_student_resource_access sra
      LEFT JOIN monev_cp_student_profile sp ON sp.user_id = sra.user_id
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

  calculateQuizStatistics: async (quizId) => {
    const [rows] = await database.query(`
      SELECT 
        COUNT(*) as total_participants,
        AVG(nilai) as average_score,
        MIN(nilai) as min_score,
        MAX(nilai) as max_score,
        SUM(CASE WHEN nilai >= 70 THEN 1 ELSE 0 END) as passed_count
      FROM monev_cp_student_quiz_detail
      WHERE quiz_id = ?
    `, [quizId]);
  
    const stats = rows || {};
    const totalParticipants = stats.total_participants || 0;
    const passedCount = stats.passed_count || 0;
    const completionRate = totalParticipants > 0 ? (passedCount / totalParticipants) * 100 : 0;
  
    return {
      total_participants: totalParticipants,
      average_score: stats.average_score || 0,
      min_score: stats.min_score || 0,
      max_score: stats.max_score || 0,
      passed_count: passedCount,
      completion_rate: Math.round(completionRate * 100) / 100,
    };
  },

  calculateAssignmentStatistics: async (assignmentId) => {
    const [rows] = await database.query(`
      SELECT 
        COUNT(*) as total_participants,
        AVG(nilai) as average_score,
        MIN(nilai) as min_score,
        MAX(nilai) as max_score,
        SUM(CASE WHEN nilai >= 70 THEN 1 ELSE 0 END) as passed_count
      FROM monev_cp_student_assignment_detail
      WHERE assignment_id = ?
    `, [assignmentId]);
  
    const stats = rows || {};
    const totalParticipants = stats.total_participants || 0;
    const passedCount = stats.passed_count || 0;
    const completionRate = totalParticipants > 0 ? (passedCount / totalParticipants) * 100 : 0;
  
    return {
      total_participants: totalParticipants,
      average_score: stats.average_score || 0,
      min_score: stats.min_score || 0,
      max_score: stats.max_score || 0,
      passed_count: passedCount,
      completion_rate: Math.round(completionRate * 100) / 100,
    };
  },

  calculateResourceStatistics: async (resourceId) => {
    const [rows] = await database.query(`
      SELECT COUNT(*) as total_participants
      FROM monev_cp_student_resource_access
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
      joins += ` JOIN monev_cp_activity_summary cas ON cas.course_id = cs.course_id`;
      whereConditions.push(`cas.activity_type = ?`);
      whereParams.push(filters.activity_type);
    }
  
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
    // Query total count
    const countQuery = `
      SELECT COUNT(DISTINCT cs.course_id) AS total
      FROM monev_cp_course_summary cs
      ${joins}
      ${whereClause}
    `;
  
    const [countResult] = await database.query(countQuery, whereParams);
    const totalCount = countResult?.total || 0;
  
    // Query data utama
    let baseQuery = `
      SELECT DISTINCT cs.course_id, cs.course_name, cs.kelas,
             cs.jumlah_aktivitas, cs.jumlah_mahasiswa, cs.dosen_pengampu
      FROM monev_cp_course_summary cs
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
       FROM monev_cp_course_summary 
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
  
    if (filters.section && !isNaN(filters.section)) {
      whereClauses.push('cas.section = ?');
      whereParams.push(parseInt(filters.section));
    }
  
    if (filters.activity_id && !isNaN(filters.activity_id)) {
      whereClauses.push('cas.activity_id = ?');
      whereParams.push(parseInt(filters.activity_id));
    }
  
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  
    // Query total count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM monev_cp_activity_summary cas
      ${whereClause}
    `;
  
    const [countResult] = await database.query(countQuery, whereParams);
    const totalCount = countResult?.total || 0;
  
    // Query data utama
    let baseQuery = `
      SELECT cas.id, cas.course_id, cas.section, cas.activity_id, cas.activity_type,
             cas.activity_name, cas.accessed_count, cas.submission_count,
             cas.graded_count, cas.attempted_count, cas.created_at, cas.updated_at
      FROM monev_cp_activity_summary cas
      ${whereClause}
    `;
  
    // Sorting
    const sortBy = filters.sort_by || 'activity_name';
    const validSortFields = ['activity_name', 'activity_type', 'accessed_count', 'created_at'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'activity_name';
    const sortOrder = (filters.sort_order || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
    baseQuery += ` ORDER BY cas.${finalSortBy} ${sortOrder}`;
  
    // Pagination
    const limit = Number(pagination.limit) || 20;
    const offset = Number(pagination.offset) || 0;
    baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;
  
    const rows = await database.query(baseQuery, whereParams);
  
    return {
      data: rows,
      total_count: totalCount,
      course_info: courseInfo
    };
  },

  getCourseSummary: async (course_id) => {
    const [courseRows] = await database.query(
      `SELECT * FROM monev_cp_course_summary WHERE course_id = ?`,
      [course_id]
    );
  
    if (!courseRows) return null;
  
    // Get activity counts
    const [activityCounts] = await database.query(
      `SELECT 
         COUNT(*) as total_activities,
         COUNT(DISTINCT activity_type) as unique_activity_types,
         SUM(accessed_count) as total_accesses
       FROM monev_cp_activity_summary 
       WHERE course_id = ?`,
      [course_id]
    );
  
    // Get student counts
    const [studentCounts] = await database.query(
      `SELECT COUNT(DISTINCT user_id) as total_students
       FROM monev_cp_student_profile 
       WHERE user_id IN (
         SELECT DISTINCT user_id FROM monev_cp_student_quiz_detail WHERE quiz_id IN (
           SELECT DISTINCT activity_id FROM monev_cp_activity_summary 
           WHERE course_id = ? AND activity_type = 'quiz'
         )
       )`,
      [course_id]
    );
  
    return {
      course: courseRows,
      activity_summary: activityCounts || {},
      student_summary: studentCounts || {}
    };
  },

  // Include detailActivity methods
  ...detailActivity
};

module.exports = coursePerformanceService;