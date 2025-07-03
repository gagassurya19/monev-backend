const mysql = require('mysql2/promise');
const config = require('../../config');
const logger = require('../utils/logger');

const etlService = {
  // Main ETL function that runs all ETL operations
  runETL: async () => {
    let conn;
    try {
      logger.info('Starting ETL process');
      
      // Create database connection
      conn = await mysql.createConnection({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        multipleStatements: true
      });

      logger.info('Database connection established for ETL');

      // Clear existing data for fresh ETL run
      await etlService.clearExistingData(conn);

      // Run all ETL operations
      await etlService.etlRawLog(conn);
      await etlService.etlCourseActivitySummary(conn);
      await etlService.etlStudentProfile(conn);
      await etlService.etlStudentQuizDetail(conn);
      await etlService.etlStudentAssignmentDetail(conn);
      await etlService.etlStudentResourceAccess(conn);
      await etlService.etlCourseSummary(conn);

      logger.info('ETL process completed successfully');
      return { success: true, message: 'ETL process completed successfully', timestamp: new Date().toISOString() };

    } catch (error) {
      logger.error('ETL process failed:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw error;
    } finally {
      if (conn) {
        await conn.end();
        logger.info('ETL database connection closed');
      }
    }
  },

  // Clear existing data before ETL run
  clearExistingData: async (conn) => {
    try {
      logger.info('Clearing existing ETL data');
      
      await conn.query('DELETE FROM student_resource_access');
      await conn.query('DELETE FROM student_assignment_detail');
      await conn.query('DELETE FROM student_quiz_detail');
      await conn.query('DELETE FROM student_profile');
      await conn.query('DELETE FROM course_activity_summary');
      await conn.query('DELETE FROM course_summary');
      await conn.query('DELETE FROM raw_log');
      
      logger.info('Existing ETL data cleared');
    } catch (error) {
      logger.error('Error clearing existing data:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw error;
    }
  },

  // ETL 1: raw_log
  etlRawLog: async (conn) => {
    try {
      logger.info('Running ETL 1: raw_log');
      
      const [result] = await conn.query(`
        INSERT INTO raw_log
        SELECT 
          id, eventname, component, action, target, objecttable, objectid,
          crud, edulevel, contextid, contextlevel, contextinstanceid,
          userid, courseid, relateduserid, anonymous, other,
          timecreated, origin, ip, realuserid
        FROM moodle401.mdl_logstore_standard_log
      `);
      
      logger.info(`ETL 1 completed: ${result.affectedRows} records inserted`);
    } catch (error) {
      logger.error('ETL 1 (raw_log) failed:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw error;
    }
  },

  // ETL 2: course_activity_summary
  etlCourseActivitySummary: async (conn) => {
    try {
      logger.info('Running ETL 2: course_activity_summary');
      
      const [result] = await conn.query(`
        INSERT INTO course_activity_summary (
          course_id, section, activity_id, activity_type, activity_name,
          accessed_count, submission_count, graded_count, attempted_count
        )
        SELECT
          c.id, cs.section, cm.instance, m.name,
          CASE 
            WHEN m.name = 'resource' THEN res.name
            WHEN m.name = 'assign' THEN a.name
            WHEN m.name = 'quiz' THEN q.name
            ELSE 'Unknown'
          END,
          COUNT(DISTINCT l.userid),
          CASE WHEN m.name = 'assign' THEN (
            SELECT COUNT(*) FROM moodle401.mdl_assign_submission sub WHERE sub.assignment = a.id AND sub.status = 'submitted'
          ) ELSE NULL END,
          CASE WHEN m.name = 'assign' THEN (
            SELECT COUNT(*) FROM moodle401.mdl_grade_grades gg
            WHERE gg.itemid IN (
              SELECT gi.id FROM moodle401.mdl_grade_items gi
              WHERE gi.iteminstance = a.id AND gi.itemmodule = 'assign')
            AND gg.finalgrade IS NOT NULL
          ) ELSE NULL END,
          CASE WHEN m.name = 'quiz' THEN (
            SELECT COUNT(*) FROM moodle401.mdl_quiz_attempts qa
            WHERE qa.quiz = q.id AND qa.state = 'finished'
          ) ELSE NULL END
        FROM moodle401.mdl_course_modules cm
        JOIN moodle401.mdl_modules m ON m.id = cm.module
        JOIN moodle401.mdl_course c ON c.id = cm.course
        JOIN moodle401.mdl_course_sections cs ON cs.id = cm.section
        LEFT JOIN moodle401.mdl_resource res ON res.id = cm.instance AND m.name = 'resource'
        LEFT JOIN moodle401.mdl_assign a ON a.id = cm.instance AND m.name = 'assign'
        LEFT JOIN moodle401.mdl_quiz q ON q.id = cm.instance AND m.name = 'quiz'
        LEFT JOIN moodle401.mdl_logstore_standard_log l ON l.contextinstanceid = cm.id AND l.contextlevel = 70 AND l.action = 'viewed'
        WHERE m.name IN ('resource', 'assign', 'quiz')
        GROUP BY c.id, cs.section, cm.instance, m.name, res.name, a.name, q.name
      `);
      
      logger.info(`ETL 2 completed: ${result.affectedRows} records inserted`);
    } catch (error) {
      logger.error('ETL 2 (course_activity_summary) failed:', error.message);
      throw error;
    }
  },

  // ETL 3: student_profile
  etlStudentProfile: async (conn) => {
    try {
      logger.info('Running ETL 3: student_profile');
      
      const [result] = await conn.query(`
        INSERT INTO student_profile (
          user_id, idnumber, full_name, email, program_studi
        )
        SELECT 
          u.id, u.idnumber, CONCAT(u.firstname, ' ', u.lastname), u.email, d.data
        FROM moodle401.mdl_user u
        LEFT JOIN moodle401.mdl_user_info_data d ON d.userid = u.id AND d.fieldid = 1
        WHERE u.id IN (
          SELECT ra.userid FROM moodle401.mdl_role_assignments ra
          JOIN moodle401.mdl_context ctx ON ctx.id = ra.contextid
          WHERE ra.roleid = 5
        )
      `);
      
      logger.info(`ETL 3 completed: ${result.affectedRows} records inserted`);
    } catch (error) {
      logger.error('ETL 3 (student_profile) failed:', error.message);
      throw error;
    }
  },

  // ETL 4: student_quiz_detail
  etlStudentQuizDetail: async (conn) => {
    try {
      logger.info('Running ETL 4: student_quiz_detail');
      
      const [result] = await conn.query(`
        INSERT INTO student_quiz_detail (
          quiz_id, user_id, nim, full_name, waktu_mulai, waktu_selesai,
          durasi_waktu, jumlah_soal, jumlah_dikerjakan, nilai
        )
        SELECT 
          q.id, u.id, u.idnumber, CONCAT(u.firstname, ' ', u.lastname),
          FROM_UNIXTIME(qa.timestart), FROM_UNIXTIME(qa.timefinish),
          SEC_TO_TIME(qa.timefinish - qa.timestart),
          (SELECT COUNT(*) FROM moodle401.mdl_question_attempts qat WHERE qat.questionusageid = qa.uniqueid),
          (SELECT COUNT(DISTINCT qat.id) FROM moodle401.mdl_question_attempts qat
           JOIN moodle401.mdl_question_attempt_steps qas ON qas.questionattemptid = qat.id
           WHERE qat.questionusageid = qa.uniqueid AND qas.state LIKE 'graded%'),
          ROUND((qa.sumgrades / q.sumgrades) * 10, 2)
        FROM moodle401.mdl_quiz_attempts qa
        JOIN moodle401.mdl_user u ON u.id = qa.userid
        JOIN moodle401.mdl_quiz q ON q.id = qa.quiz
        WHERE qa.state = 'finished'
      `);
      
      logger.info(`ETL 4 completed: ${result.affectedRows} records inserted`);
    } catch (error) {
      logger.error('ETL 4 (student_quiz_detail) failed:', error.message);
      throw error;
    }
  },

  // ETL 5: student_assignment_detail
  etlStudentAssignmentDetail: async (conn) => {
    try {
      logger.info('Running ETL 5: student_assignment_detail');
      
      const [result] = await conn.query(`
        INSERT INTO student_assignment_detail (
          assignment_id, user_id, nim, full_name, waktu_submit, waktu_pengerjaan, nilai
        )
        SELECT 
          a.id, u.id, u.idnumber, CONCAT(u.firstname, ' ', u.lastname),
          FROM_UNIXTIME(sub.timemodified),
          SEC_TO_TIME(sub.timemodified - COALESCE((
            SELECT MIN(l.timecreated) FROM moodle401.mdl_logstore_standard_log l
            JOIN moodle401.mdl_course_modules cm ON cm.id = l.contextinstanceid
            JOIN moodle401.mdl_modules m ON m.id = cm.module
            WHERE cm.instance = a.id AND m.name = 'assign' AND l.userid = u.id AND l.action = 'viewed'
          ), sub.timemodified)),
          gg.finalgrade
        FROM moodle401.mdl_assign_submission sub
        JOIN moodle401.mdl_user u ON u.id = sub.userid
        JOIN moodle401.mdl_assign a ON a.id = sub.assignment
        JOIN moodle401.mdl_grade_items gi ON gi.iteminstance = a.id AND gi.itemmodule = 'assign'
        JOIN moodle401.mdl_grade_grades gg ON gg.itemid = gi.id AND gg.userid = u.id
        WHERE sub.status = 'submitted'
      `);
      
      logger.info(`ETL 5 completed: ${result.affectedRows} records inserted`);
    } catch (error) {
      logger.error('ETL 5 (student_assignment_detail) failed:', error.message);
      throw error;
    }
  },

  // ETL 6: student_resource_access
  etlStudentResourceAccess: async (conn) => {
    try {
      logger.info('Running ETL 6: student_resource_access');
      
      const [result] = await conn.query(`
        INSERT INTO student_resource_access (
          resource_id, user_id, nim, full_name, waktu_akses
        )
        SELECT 
          r.id, u.id, u.idnumber, CONCAT(u.firstname, ' ', u.lastname),
          FROM_UNIXTIME(l.timecreated)
        FROM moodle401.mdl_logstore_standard_log l
        JOIN moodle401.mdl_user u ON u.id = l.userid
        JOIN moodle401.mdl_course_modules cm ON cm.id = l.contextinstanceid
        JOIN moodle401.mdl_modules m ON m.id = cm.module
        JOIN moodle401.mdl_resource r ON r.id = cm.instance AND m.name = 'resource'
        WHERE l.action = 'viewed' AND l.component = 'mod_resource' AND l.target = 'course_module'
      `);
      
      logger.info(`ETL 6 completed: ${result.affectedRows} records inserted`);
    } catch (error) {
      logger.error('ETL 6 (student_resource_access) failed:', error.message);
      throw error;
    }
  },

  // ETL 7: course_summary
  etlCourseSummary: async (conn) => {
    try {
      logger.info('Running ETL 7: course_summary');
      
      const [result] = await conn.query(`
        INSERT INTO course_summary (
          course_id, course_name, kelas, jumlah_aktivitas, jumlah_mahasiswa
        )
        SELECT 
          c.id, c.fullname, c.shortname,
          (SELECT COUNT(*) FROM moodle401.mdl_course_modules cm WHERE cm.course = c.id),
          (SELECT COUNT(DISTINCT ra.userid) FROM moodle401.mdl_role_assignments ra
           JOIN moodle401.mdl_context ctx ON ctx.id = ra.contextid
           WHERE ctx.contextlevel = 50 AND ctx.instanceid = c.id AND ra.roleid = 5)
        FROM moodle401.mdl_course c
        WHERE c.visible = 1
      `);
      
      logger.info(`ETL 7 completed: ${result.affectedRows} records inserted`);
    } catch (error) {
      logger.error('ETL 7 (course_summary) failed:', error.message);
      throw error;
    }
  },

  // Get ETL status and last run info
  getETLStatus: async () => {
    try {
      // You can implement this to check the last ETL run from a status table
      // For now, return basic status
      return {
        status: 'active',
        lastRun: null, // You can store this in a database table
        nextRun: 'Every hour at minute 0',
        isRunning: false
      };
    } catch (error) {
      logger.error('Error getting ETL status:', error.message);
      throw error;
    }
  }
};

module.exports = etlService; 