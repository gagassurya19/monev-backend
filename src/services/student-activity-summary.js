const mysql = require('mysql2/promise')
const config = require('../../config')
const logger = require('../utils/logger');
const database = require('../database/connection');
const { getMatkulByProdi } = require('../controllers/student-activity-summary');

const studentActivitySummaryService = {
  getFakultas: async (user_data, search, page = 1, limit = 20) => {
    const { fakultas: tokenFakultas, admin } = user_data;
    const offset = (page - 1) * limit;
  
    try {
      let baseQuery = `FROM moodle_logs.etl_chart_categories WHERE category_type = 'FACULTY'`;
      const conditions = [];
      const params = [];
  
      if (admin && !tokenFakultas && !search) {
        baseQuery = `FROM moodle_logs.etl_chart_categories WHERE category_type = 'FACULTY'`;
      }
      
      if (tokenFakultas) {
        conditions.push(`category_id = ?`);
        params.push(tokenFakultas);
      }
  
      if (search) {
        conditions.push(`category_name LIKE ?`);
        params.push(`%${search}%`);
      }

  
      const whereClause = conditions.length ? ` AND ${conditions.join(' AND ')}` : '';
  
      const dataQuery = `SELECT category_id, category_name ${baseQuery}${whereClause} LIMIT ? OFFSET ?`;
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}${whereClause}`;
  
      const data = await database.query(dataQuery, [...params, limit, offset]);
      const countResult = await database.query(countQuery, params);
      const total = countResult[0]?.total || 0;
  
      return {
        data,
        page,
        limit,
        total,
        hasNextPage: offset + data.length < total
      };
  
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: 'Failed to get fakultas data',
        error: error.message
      };
    }
  },  

  getProdiByFakultas: async (user_data, fakultas_option, kampus_option, search, page = 1, limit = 20) => {
    const { fakultas: tokenFakultas, kampus: tokenKampus, prodi: tokenProdi, admin } = user_data;
    const fakultas = tokenFakultas || fakultas_option || null;
    const kampus = tokenKampus || kampus_option || null;
    const offset = (page - 1) * limit;
  
    try {
      let baseQuery = `
        FROM moodle_logs.etl_chart_categories 
        WHERE category_type = 'STUDYPROGRAM'`;
      const conditions = [];
      const params = [];
  
      if (admin && !fakultas && !kampus && !tokenProdi && !search) {
        baseQuery = `FROM moodle_logs.etl_chart_categories WHERE category_type = 'STUDYPROGRAM'`;
      }

      if (tokenProdi) {
        conditions.push(`category_id = ?`);
        params.push(tokenProdi);
      }
  
      if (fakultas) {
        conditions.push(`category_parent_id = ?`);
        params.push(fakultas);
      }
  
      if (kampus) {
        conditions.push(`category_site = ?`);
        params.push(kampus);
      }
  
      if (search) {
        conditions.push(`category_name LIKE ?`);
        params.push(`%${search}%`);
      }
  
      if (admin && !fakultas && !kampus && !tokenProdi && !search) {
        baseQuery = `FROM moodle_logs.etl_chart_categories WHERE category_type = 'STUDYPROGRAM'`;
      }
  
      const whereClause = conditions.length ? ` AND ${conditions.join(' AND ')}` : '';
  
      const dataQuery = `SELECT category_id, category_name ${baseQuery}${whereClause} LIMIT ? OFFSET ?`;
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}${whereClause}`;
  
      const data = await database.query(dataQuery, [...params, limit, offset]);
      const countResult = await database.query(countQuery, params);
      const total = countResult[0]?.total || 0;
  
      return {
        data,
        page,
        limit,
        total,
        hasNextPage: offset + data.length < total
      };
  
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: 'Failed to get prodi data',
        error: error.message
      };
    }
  },  

  getMatkulByProdi: async (user_data, prodi_option, search, page = 1, limit = 20) => {
    const { prodi: tokenProdi, admin } = user_data;
    const prodi = tokenProdi || prodi_option || null;
    const offset = (page - 1) * limit;
  
    try {
      let baseQuery = `FROM moodle_logs.etl_chart_subjects`;
      const conditions = [];
      const params = [];
  
      if (admin && !prodi && !search) {
        const data = await database.query(`SELECT * ${baseQuery} LIMIT ? OFFSET ?`, [limit, offset]);
        const totalResult = await database.query(`SELECT COUNT(*) as total ${baseQuery}`);
        const total = totalResult[0]?.total || 0;
  
        return {
          data,
          page,
          limit,
          total,
          hasNextPage: offset + data.length < total
        };
      }
  
      if (prodi) {
        conditions.push(`category_id = ?`);
        params.push(prodi);
      }
  
      if (search) {
        conditions.push(`(subject_name LIKE ? OR subject_code LIKE ?)`);
        params.push(`%${search}%`, `%${search}%`);
      }
  
      const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  
      const dataQuery = `SELECT * ${baseQuery}${whereClause} LIMIT ? OFFSET ?`;
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}${whereClause}`;
  
      const data = await database.query(dataQuery, [...params, limit, offset]);
      const totalResult = await database.query(countQuery, params);
      const total = totalResult[0]?.total || 0;
  
      return {
        data,
        page,
        limit,
        total,
        hasNextPage: offset + data.length < total
      };
  
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: 'Failed to get mata kuliah data',
        error: error.message
      };
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