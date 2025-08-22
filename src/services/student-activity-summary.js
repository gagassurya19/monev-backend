const mysql = require('mysql2/promise')
const config = require('../../config')
const logger = require('../utils/logger');
const database = require('../database/connection');

const studentActivitySummaryService = {
  getCategories: async (filters = {}, pagination = {}) => {
    try {
      const validSortFields = ['category_name', 'category_type', 'category_parent_id'];
      let whereConditions = [];
      let whereParams = [];
      
      // Filter search
      if (filters.search) {
        whereConditions.push(`(category_name LIKE ? OR category_site LIKE ?)`);
        whereParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      // Filter category type
      if (filters.category_type) {
        whereConditions.push(`category_type = ?`);
        whereParams.push(filters.category_type);
      }
      
      // Filter parent category
      if (filters.category_parent_id !== undefined && filters.category_parent_id !== null) {
        whereConditions.push(`category_parent_id = ?`);
        whereParams.push(filters.category_parent_id);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Query total count
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM monev_sas_categories
        ${whereClause}
      `;
      
      const [countResult] = await database.query(countQuery, whereParams);
      const totalCount = countResult?.total || 0;
      
      // Query data utama
      let baseQuery = `
        SELECT category_id, category_name, category_site, category_type, category_parent_id
        FROM monev_sas_categories
        ${whereClause}
      `;
      
      // Sorting
      const sortBy = validSortFields.includes(filters.sort_by) ? filters.sort_by : 'category_name';
      const sortOrder = (filters.sort_order || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
      
      // Pagination
      const limit = Number(pagination.limit) || 20;
      const offset = Number(pagination.offset) || 0;
      baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;
      
      const rows = await database.query(baseQuery, whereParams);
      
      return {
        data: rows,
        total_count: totalCount
      };
    } catch (error) {
      logger.error('Error getting categories:', error.message);
      throw error;
    }
  },

  getStudyPrograms: async (filters = {}, pagination = {}) => {
    try {
      let whereConditions = ['category_type = ?'];
      let whereParams = ['STUDYPROGRAM'];
      
      // Filter search
      if (filters.search) {
        whereConditions.push(`(category_name LIKE ? OR category_site LIKE ?)`);
        whereParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      // Filter faculty (parent category)
      if (filters.faculty_id) {
        whereConditions.push(`category_parent_id = ?`);
        whereParams.push(filters.faculty_id);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Query total count
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM monev_sas_categories
        ${whereClause}
      `;
      
      const [countResult] = await database.query(countQuery, whereParams);
      const totalCount = countResult?.total || 0;
      
      // Query data utama
      let baseQuery = `
        SELECT category_id, category_name, category_site, category_type, category_parent_id
        FROM monev_sas_categories
        ${whereClause}
      `;
      
      // Sorting
      const sortBy = filters.sort_by || 'category_name';
      const sortOrder = (filters.sort_order || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
      
      // Pagination
      const limit = Number(pagination.limit) || 20;
      const offset = Number(pagination.offset) || 0;
      baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;
      
      const rows = await database.query(baseQuery, whereParams);
      
      return {
        data: rows,
        total_count: totalCount
      };
    } catch (error) {
      logger.error('Error getting study programs:', error.message);
      throw error;
    }
  },

  getSubjects: async (filters = {}, pagination = {}) => {
    try {
      let whereConditions = [];
      let whereParams = [];
      
      // Filter search
      if (filters.search) {
        whereConditions.push(`(subject_code LIKE ? OR subject_name LIKE ?)`);
        whereParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      // Filter curriculum year
      if (filters.curriculum_year) {
        whereConditions.push(`curriculum_year = ?`);
        whereParams.push(filters.curriculum_year);
      }
      
      // Filter category
      if (filters.category_id) {
        whereConditions.push(`category_id = ?`);
        whereParams.push(filters.category_id);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Query total count
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM monev_sas_subjects
        ${whereClause}
      `;
      
      const [countResult] = await database.query(countQuery, whereParams);
      const totalCount = countResult?.total || 0;
      
      // Query data utama
      let baseQuery = `
        SELECT subject_id, subject_code, subject_name, curriculum_year, category_id
        FROM monev_sas_subjects
        ${whereClause}
      `;
      
      // Sorting
      const sortBy = filters.sort_by || 'subject_name';
      const sortOrder = (filters.sort_order || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
      
      // Pagination
      const limit = Number(pagination.limit) || 20;
      const offset = Number(pagination.offset) || 0;
      baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;
      
      const rows = await database.query(baseQuery, whereParams);
      
      return {
        data: rows,
        total_count: totalCount
      };
    } catch (error) {
      logger.error('Error getting subjects:', error.message);
      throw error;
    }
  },

  getETLHistory: async (limit = 20, offset = 0, type_run = 'fetch_student_activity_summary') => {
    try {
      let total = 0;
      let logs = [];

      try {
        // Build WHERE clause for filtering
        let whereClause = 'WHERE type_run = ?';
        let whereParams = [type_run];

        // Get total logs count with filter
        const countQuery = `
          SELECT COUNT(*) as total FROM monev_sas_logs ${whereClause}
        `;
        const [countResult] = await database.query(countQuery, whereParams);
        total = countResult?.total ?? countResult[0]?.total ?? 0;

        // Get paginated logs with filter
        const logsQuery = `
          SELECT * FROM monev_sas_logs 
          ${whereClause}
          ORDER BY id DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
        const rows = await database.query(logsQuery, whereParams);

        logs = Array.isArray(rows) ? rows : (rows ? [rows] : []);
      } catch (tableError) {
        logger.warn('Error accessing monev_sas_logs table:', tableError.message);
        total = 0;
        logs = [];
      }

      // Helper function to pad numbers with leading zeros
      const padZero = (num) => {
        return num < 10 ? '0' + num : String(num);
      };

      // Format logs
      const formattedLogs = logs.map(log => {
        let duration = null;
        if (log.start_date && log.end_date) {
          const start = new Date(log.start_date);
          const end = new Date(log.end_date);
          const diffMs = end - start;
          
          const hours = padZero(Math.floor(diffMs / (1000 * 60 * 60)));
          const minutes = padZero(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
          const seconds = padZero(Math.floor((diffMs % (1000 * 60)) / 1000));
          
          duration = `${hours}:${minutes}:${seconds}`;
        }

        return {
          id: log.id,
          type_run: log.type_run,
          start_date: log.start_date,
          end_date: log.end_date,
          duration: duration || log.duration,
          status: log.status,
          total_records: log.total_records,
          offset: log.offset,
          created_at: log.created_at
        };
      });

      return {
        logs: formattedLogs,
        pagination: {
          total: total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          current_page: Math.floor(offset / limit) + 1,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting ETL history:', error.message);
      throw error;
    }
  },

  getFakultas: async (decodedToken, search = '', page = 1, limit = 20) => {
    try {
      let whereConditions = ['category_type = ?'];
      let whereParams = ['FACULTY'];
      
      // Filter search
      if (search) {
        whereConditions.push(`(category_name LIKE ? OR category_site LIKE ?)`);
        whereParams.push(`%${search}%`, `%${search}%`);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Query total count
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM monev_sas_categories
        ${whereClause}
      `;
      
      const [countResult] = await database.query(countQuery, whereParams);
      const totalCount = countResult?.total || 0;
      
      // Query data utama
      let baseQuery = `
        SELECT category_id, category_name, category_site, category_type, category_parent_id
        FROM monev_sas_categories
        ${whereClause}
        ORDER BY category_name ASC
      `;
      
      // Pagination
      const limitInt = Number(limit) || 20;
      const offset = (Number(page) - 1) * limitInt;
      baseQuery += ` LIMIT ${limitInt} OFFSET ${offset}`;
      
      const rows = await database.query(baseQuery, whereParams);
      
      return {
        status: true,
        message: 'Get fakultas completed successfully',
        data: rows,
        pagination: {
          total: totalCount,
          limit: limitInt,
          page: Number(page),
          total_pages: Math.ceil(totalCount / limitInt)
        }
      };
    } catch (error) {
      logger.error('Error getting fakultas:', error.message);
      throw error;
    }
  },

  getProdiByFakultas: async (decodedToken, fakultas, kampus = '', search = '', page = 1, limit = 20) => {
    try {
      let whereConditions = ['category_type = ?'];
      let whereParams = ['STUDYPROGRAM'];
      
      // Filter by faculty
      if (fakultas) {
        whereConditions.push(`category_parent_id = ?`);
        whereParams.push(fakultas);
      }
      
      // Filter by campus
      if (kampus) {
        whereConditions.push(`category_site = ?`);
        whereParams.push(kampus);
      }
      
      // Filter search
      if (search) {
        whereConditions.push(`(category_name LIKE ? OR category_site LIKE ?)`);
        whereParams.push(`%${search}%`, `%${search}%`);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Query total count
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM monev_sas_categories
        ${whereClause}
      `;
      
      const [countResult] = await database.query(countQuery, whereParams);
      const totalCount = countResult?.total || 0;
      
      // Query data utama
      let baseQuery = `
        SELECT category_id, category_name, category_site, category_type, category_parent_id
        FROM monev_sas_categories
        ${whereClause}
        ORDER BY category_name ASC
      `;
      
      // Pagination
      const limitInt = Number(limit) || 20;
      const offset = (Number(page) - 1) * limitInt;
      baseQuery += ` LIMIT ${limitInt} OFFSET ${offset}`;
      
      const rows = await database.query(baseQuery, whereParams);
      
      return {
        status: true,
        message: 'Get prodi by fakultas completed successfully',
        data: rows,
        pagination: {
          total: totalCount,
          limit: limitInt,
          page: Number(page),
          total_pages: Math.ceil(totalCount / limitInt)
        }
      };
    } catch (error) {
      logger.error('Error getting prodi by fakultas:', error.message);
      throw error;
    }
  },

  getMatkulByProdi: async (decodedToken, prodi, search = '', page = 1, limit = 20) => {
    try {
      let whereConditions = [];
      let whereParams = [];
      
      // Filter by study program
      if (prodi) {
        whereConditions.push(`category_id = ?`);
        whereParams.push(prodi);
      }
      
      // Filter search
      if (search) {
        whereConditions.push(`(subject_name LIKE ? OR subject_code LIKE ?)`);
        whereParams.push(`%${search}%`, `%${search}%`);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Query total count
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM monev_sas_subjects
        ${whereClause}
      `;
      
      const [countResult] = await database.query(countQuery, whereParams);
      const totalCount = countResult?.total || 0;
      
      // Query data utama
      let baseQuery = `
        SELECT subject_id, subject_code, subject_name, curriculum_year, category_id
        FROM monev_sas_subjects
        ${whereClause}
        ORDER BY subject_name ASC
      `;
      
      // Pagination
      const limitInt = Number(limit) || 20;
      const offset = (Number(page) - 1) * limitInt;
      baseQuery += ` LIMIT ${limitInt} OFFSET ${offset}`;
      
      const rows = await database.query(baseQuery, whereParams);
      
      return {
        status: true,
        message: 'Get matakuliah by prodi completed successfully',
        data: rows,
        pagination: {
          total: totalCount,
          limit: limitInt,
          page: Number(page),
          total_pages: Math.ceil(totalCount / limitInt)
        }
      };
    } catch (error) {
      logger.error('Error getting matakuliah by prodi:', error.message);
      throw error;
    }
  }
};

module.exports = studentActivitySummaryService;