const mysql = require('mysql2/promise')
const config = require('../../config')
const logger = require('../utils/logger');
const database = require('../database/connection');
const { getMatkulByProdi } = require('../controllers/student-activity-summary');

const studentActivitySummaryService = {
  getFakultas: async () => {
    let resultData = {};
    try {
      const resultFakultas = await database.query(`
        SELECT category_id, category_name 
        FROM moodle_logs.etl_chart_categories 
        WHERE category_type = "FACULTY"`
      );
      resultData.fakultas = resultFakultas;
      return resultData
    } catch (error) {
      console.log(error)
      return {
        status: false,
        message: 'Failed to get filter by token',
        error: error.message
      }
    }
  },

  getProdiByFakultas: async (user_data, fakultas_option, kampus_option) => {
    const { fakultas, kampus } = user_data;
    let resultData = {};
    try {
      if (fakultas_option && kampus_option) {
        const resultProdi = await database.query(`
          SELECT category_id, category_name 
          FROM moodle_logs.etl_chart_categories 
          WHERE category_type = "STUDYPROGRAM" 
          AND category_parent_id = ? 
          AND category_site = ?`,
          [fakultas_option, kampus_option]);
        resultData.prodi = resultProdi;
        return resultData
      }
      const resultProdi = await database.query(`
        SELECT category_id, category_name 
        FROM moodle_logs.etl_chart_categories 
        WHERE category_type = "STUDYPROGRAM" 
        AND category_parent_id = ? 
        AND category_site = ?`,
        [fakultas, kampus]);
      resultData.prodi = resultProdi;
      return resultData
    } catch (error) {
      console.log(error)
      return {
        status: false,
        message: 'Failed to get filter by token',
        error: error.message
      }
    }
  },

  getMatkulByProdi: async (user_data, prodi_option) => {
    const { prodi } = user_data;
    let resultData = {};
    try {
      if (prodi_option) {
        const resultMataKuliah = await database.query(`
          SELECT * FROM moodle_logs.etl_chart_subjects 
          WHERE category_id = ?`,
          [prodi_option]);
        resultData.mata_kuliah = resultMataKuliah;
        return resultData
      }
      const resultMataKuliah = await database.query(`
        SELECT * FROM moodle_logs.etl_chart_subjects 
        WHERE category_id = ?`,
        [prodi]);
      resultData.mata_kuliah = resultMataKuliah;
      return resultData
    } catch (error) {
      console.log(error)
      return {
        status: false,
        message: 'Failed to get filter by token',
        error: error.message
      }
    }
  },

  // ETL

  getStatusLastETLRun: async (request, h) => {
    try {
      const lastRunQuery = `
        SELECT * FROM etl_chart_logs 
        ORDER BY end_date DESC 
        LIMIT 1
      `;
      const lastRunResult = await database.query(lastRunQuery);
      const lastRun = lastRunResult[0] || null;
      
      const runningQuery = `
        SELECT COUNT(*) as running_count 
        FROM etl_chart_logs 
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
          total_records: lastRun.numrow || 0,
          offset: lastRun.offset || 0
        } : null,
        nextRun: 'Every hour at minute 0',
        isRunning: isRunning
      };
      
      return h.response({
        status: true,
        data: response
      }).code(200);
      
    } catch (error) {
      logger.error('Error getting ETL CHART status:', error.message);
      return h.response({
        status: false,
        message: 'Failed to get ETL CHART status',
        error: error.message
      }).code(500);
    }
  },

  getHistoryETLRun: async (limit = 5, offset = 0) => {
    try {
      const data = await database.query(`
        SELECT id, start_date, end_date, duration, status, total_records, offset, created_at 
        FROM etl_chart_logs 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const [countRows] = await database.query(`
        SELECT COUNT(*) as total FROM etl_chart_logs
      `);

      const total = countRows.total;
      const total_pages = Number(Math.ceil(total / limit));
      const current_page = Number(Math.floor(offset / limit) + 1);

      return {
        logs: data,
        pagination: {
          total,
          limit,
          offset,
          current_page,
          total_pages
        }
      };

    } catch (error) {
      console.error('Error get history ETL status:', error);
      return {
        status: false,
        message: 'Failed get history ETL run status',
        error: error.message
      };
    }
  }

}

module.exports = studentActivitySummaryService