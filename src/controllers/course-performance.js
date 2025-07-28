const Boom = require('@hapi/boom')
const coursePerformanceService = require('../services/course-performance')
const logger = require('../utils/logger');
const database = require('../database/connection');

const coursePerformanceController = {
  // Get course
  getCourse: async (request, h) => {
    try {
      const { query } = request;

      const filters = {
        search: query.search || null,
        dosen_pengampu: query.dosen_pengampu || null,
        activity_type: query.activity_type || null,
        sort_by: query.sort_by || 'keaktifan',
        sort_order: query.sort_order || 'desc'
      };

      const pagination = {
        limit: parseInt(query.limit) || 10,
        offset: ((parseInt(query.page) || 1) - 1) * (parseInt(query.limit) || 10)
      };

      const result = await coursePerformanceService.getCoursesWithFilters(filters, pagination);

      return h.response({
        status: true,
        data: result.data,
        pagination: {
          total_items: result.total_count,
          items_per_page: pagination.limit,
          current_page: (query.page ? parseInt(query.page) : 1),
          total_pages: Math.ceil(result.total_count / pagination.limit)
        },
        filters_applied: filters
      });
    } catch (err) {
      logger.error('Failed to get courses:', err.message);
      return h.response({
        status: false,
        message: 'Failed to get course data',
        error: err.message
      }).code(500);
    }
  },

  getCourseActivities: async (request, h) => {
    const { course_id } = request.params;
    const {
      activity_type,
      activity_id,
      section,
      page = 1,
      limit = 20,
    } = request.query;

    try {
      if (!course_id) {
        return h.response({
          status: false,
          message: 'Course ID is required'
        }).code(400);
      }

      // Validasi & parsing filter
      const filters = {};
      if (['resource', 'assign', 'quiz'].includes(activity_type)) {
        filters.activity_type = activity_type;
      }
      if (activity_id && !isNaN(activity_id)) {
        filters.activity_id = parseInt(activity_id);
      }
      if (section && !isNaN(section)) {
        filters.section = parseInt(section);
      }

      // Validasi & kalkulasi pagination
      const currentPage = Math.max(1, parseInt(page));
      const perPage = Math.min(Math.max(1, parseInt(limit)), 100);
      const offset = (currentPage - 1) * perPage;

      // Ambil data dari service
      const result = await coursePerformanceService.getCourseActivities(course_id, filters, {
        limit: perPage,
        offset
      });

      // Jika course tidak ditemukan
      if (!result) {
        return h.response({
          status: false,
          message: 'Course not found'
        }).code(404);
      }

      const totalItems = result.total_count || 0;
      const totalPages = Math.ceil(totalItems / perPage);

      return h.response({
        status: true,
        data: result.data,
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: perPage
        },
        course_info: {
          course_id: result.course_info.course_id,
          course_name: result.course_info.course_name,
          kelas: result.course_info.kelas
        }
      }).code(200);

    } catch (error) {
      logger.error(`Failed to get course activities for course_id ${course_id}: ${error.message}`);
      return h.response({
        status: false,
        message: `Failed to get course activities`,
        error: error.message
      }).code(500);
    }
  },

  getDetailActivity: async (request, h) => {
    const { course_id, activity_type, activity_id } = request.params;
    const { query } = request;
    const { page, limit } = query;

    try {
      if (!course_id) {
        return h.response({
          status: false,
          message: 'Course ID is required'
        }).code(400);
      }

      if (!activity_type) {
        return h.response({
          status: false,
          message: 'Activity type is required'
        }).code(400);
      }

      if (!activity_id) {
        return h.response({
          status: false,
          message: 'Activity id is required'
        }).code(400);
      }

      // Validasi & parsing filter
      const filters = {
        search: query.search || null,
        program_studi: query.program_studi || null,
        sort_by: query.sort_by || 'full_name',
        sort_order: query.sort_order || 'asc'
      };

      // Validasi & kalkulasi pagination
      const pagination = {
        limit: limit || 10,
        offset: (page - 1) * limit
      }

      const info = await coursePerformanceService.detailActivity.getCourseActivityInfo(course_id, activity_type, activity_id);

      let students;

      switch (activity_type) {
        case 'quiz':
          students = await coursePerformanceService.detailActivity.getQuizStudents(request, h, activity_id, filters, pagination);
          break;
        case 'assign':
          students = await coursePerformanceService.detailActivity.getAssignmentStudents(request, h, activity_id, filters, pagination);
          break;
        case 'resource':
          students = await coursePerformanceService.detailActivity.getResourceStudents(request, h, activity_id, filters, pagination);
          break;
        default:
          throw Boom.badRequest('Invalid activity type');
      }

      return {
        info,
        students
      };

    } catch (error) {
      return h.response({
        status: false,
        message: 'Get detail activity error',
        error: error.message
      })
    }
  }

}

module.exports = coursePerformanceController