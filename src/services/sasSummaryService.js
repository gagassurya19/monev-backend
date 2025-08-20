const database = require('../database/connection')
const logger = require('../utils/logger')

// Helpers to safely map enums/columns
const GROUP_BY_DIMENSIONS = new Set(['kampus', 'fakultas', 'prodi', 'subject'])

const DEFAULT_DATE_WINDOW_DAYS = 30

function coalesceDate(dateString) {
  if (dateString) return dateString
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - (DEFAULT_DATE_WINDOW_DAYS - 1))
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  }
}

function buildFilters(query) {
  const where = []
  const params = []

  // Date range
  let dateStart = query.date_start
  let dateEnd = query.date_end
  if (!dateStart || !dateEnd) {
    const def = coalesceDate()
    dateStart = def.start
    dateEnd = def.end
  }
  where.push('uae.extraction_date BETWEEN ? AND ?')
  params.push(dateStart, dateEnd)

  // Fakultas filter
  if (query.fakultas_id) {
    where.push('c.faculty_id = ?')
    params.push(query.fakultas_id)
  }

  // Prodi filter
  if (query.prodi_id) {
    where.push('c.program_id = ?')
    params.push(query.prodi_id)
  }

  // Subject filter
  if (query.subject_ids) {
    const ids = String(query.subject_ids)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (ids.length > 0) {
      where.push(`c.subject_id IN (${ids.map(() => '?').join(',')})`)
      params.push(...ids)
    }
  }

  // University filter (not modeled in schema; noop placeholder)
  if (query.university) {
    // If later we have a mapping table, add it here.
  }

  return { whereClause: where.length ? `WHERE ${where.join(' AND ')}` : '', params, dateStart, dateEnd }
}

function getGroupSelect(groupBy) {
  switch (groupBy) {
    case 'kampus':
      return `COALESCE(sp.category_site, 'UNKNOWN')`
    case 'fakultas':
      return `COALESCE(fc.category_name, CONCAT('FAC_', c.faculty_id))`
    case 'prodi':
      return `COALESCE(sp.category_name, CONCAT('PRODI_', c.program_id))`
    case 'subject':
    default:
      return `COALESCE(c.subject_id, 'UNKNOWN')`
  }
}

const sasSummaryService = {
  getChartAggregation: async (query) => {
    try {
      const groupBy = GROUP_BY_DIMENSIONS.has(query.group_by) ? query.group_by : 'fakultas'
      const { whereClause, params, dateStart, dateEnd } = buildFilters(query)

      const groupSelect = getGroupSelect(groupBy)

      const sql = `
        SELECT 
          ${groupSelect} AS category,
          SUM(uae.file_views) AS file,
          SUM(uae.video_views) AS video,
          SUM(uae.forum_views) AS forum,
          SUM(uae.quiz_views) AS quiz,
          SUM(uae.assignment_views) AS assignment,
          SUM(uae.url_views) AS url
        FROM monev_sas_user_activity_etl uae
        JOIN monev_sas_courses c ON c.course_id = uae.course_id
        LEFT JOIN monev_sas_categories fc ON fc.category_id = c.faculty_id AND fc.category_type = 'FACULTY'
        LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
        ${whereClause}
        GROUP BY category
        ORDER BY category ASC
      `

      const rows = await database.query(sql, params)
      const data = rows.map(r => ({
        category: r.category,
        file: Number(r.file || 0),
        video: Number(r.video || 0),
        forum: Number(r.forum || 0),
        quiz: Number(r.quiz || 0),
        assignment: Number(r.assignment || 0),
        url: Number(r.url || 0)
      }))

      return {
        status: true,
        filters: {
          group_by: groupBy,
          university: query.university || '',
          fakultas_id: query.fakultas_id || '',
          prodi_id: query.prodi_id || '',
          subject_ids: query.subject_ids || '',
          date_start: dateStart,
          date_end: dateEnd
        },
        data
      }
    } catch (error) {
      logger.error('SAS getChartAggregation error:', error.message)
      throw error
    }
  },

  getStatsOverview: async (query) => {
    try {
      const { whereClause, params, dateStart, dateEnd } = buildFilters(query)

      // Distribution and totals
      const distSql = `
        SELECT 
          SUM(uae.file_views) AS file,
          SUM(uae.video_views) AS video,
          SUM(uae.forum_views) AS forum,
          SUM(uae.quiz_views) AS quiz,
          SUM(uae.assignment_views) AS assignment,
          SUM(uae.url_views) AS url,
          SUM(uae.total_views) AS total_activities,
          AVG(uae.avg_activity_per_student_per_day) AS average_score
        FROM monev_sas_user_activity_etl uae
        JOIN monev_sas_courses c ON c.course_id = uae.course_id
        LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
        ${whereClause}
      `

      const [dist] = await database.query(distSql, params)

      // Active users: use the same approach as table endpoint - GROUP BY course_id to get latest per course
      // This will give us 6 instead of 12 by taking only the most recent record per course
      const activeSql = `
        SELECT 
          SUM(t.num_students) AS total_students,
          SUM(t.num_teachers) AS total_teachers
        FROM (
          SELECT 
            uae.course_id,
            MAX(uae.extraction_date) as latest_date,
            MAX(uae.num_students) as num_students,
            MAX(uae.num_teachers) as num_teachers
          FROM monev_sas_user_activity_etl uae
          JOIN monev_sas_courses c ON c.course_id = uae.course_id
          LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
          ${whereClause}
          GROUP BY uae.course_id
        ) t
      `
      const [active] = await database.query(activeSql, params)
      
      // Debug logging
      logger.info('Active users query result:', { active, params, whereClause })
      
      // Additional debugging: check individual records to see why we get 12 instead of 6
      const debugSql = `
        SELECT 
          uae.course_id,
          uae.extraction_date,
          uae.num_students,
          uae.num_teachers,
          c.course_name,
          c.subject_id
        FROM monev_sas_user_activity_etl uae
        JOIN monev_sas_courses c ON c.course_id = uae.course_id
        LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
        ${whereClause}
        ORDER BY uae.course_id, uae.extraction_date
      `
      const debugRecords = await database.query(debugSql, params)
      logger.info('Debug: Individual records breakdown:', { 
        totalRecords: debugRecords.length,
        records: debugRecords.map(r => ({
          course_id: r.course_id,
          date: r.extraction_date,
          students: r.num_students,
          teachers: r.num_teachers,
          course_name: r.course_name,
          subject_id: r.subject_id
        }))
      })

      // Completion rate: fraction of courses with any activity in range
      const completionSql = `
        SELECT 
          SUM(CASE WHEN t.total_views_sum > 0 THEN 1 ELSE 0 END) AS active_courses,
          COUNT(*) AS total_courses
        FROM (
          SELECT 
            uae.course_id,
            SUM(uae.total_views) AS total_views_sum
          FROM monev_sas_user_activity_etl uae
          JOIN monev_sas_courses c ON c.course_id = uae.course_id
          LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
          ${whereClause}
          GROUP BY uae.course_id
        ) t
      `
      const [comp] = await database.query(completionSql, params)

      const totalActivities = Number(dist?.total_activities || 0)
      const averageScore = dist?.average_score != null ? Number(dist.average_score) : 0
      const totalStudents = Number(active?.total_students || 0)
      const totalTeachers = Number(active?.total_teachers || 0)
      const activeUsers = totalStudents + totalTeachers
      const completionRate = comp && comp.total_courses > 0 
        ? Number((Number(comp.active_courses || 0) / Number(comp.total_courses || 1)).toFixed(2))
        : 0

      const distribution = {
        file: Number(dist?.file || 0),
        video: Number(dist?.video || 0),
        forum: Number(dist?.forum || 0),
        quiz: Number(dist?.quiz || 0),
        assignment: Number(dist?.assignment || 0),
        url: Number(dist?.url || 0)
      }

      return {
        status: true,
        filters: {
          university: query.university || '',
          fakultas_id: query.fakultas_id || '',
          prodi_id: query.prodi_id || '',
          subject_ids: query.subject_ids || '',
          date_start: dateStart,
          date_end: dateEnd
        },
        data: {
          total_activities: totalActivities,
          average_score: averageScore,
          active_users: activeUsers,
          completion_rate: completionRate,
          distribution
        }
      }
    } catch (error) {
      logger.error('SAS getStatsOverview error:', error.message)
      throw error
    }
  },

  getSummaryTable: async (query) => {
    try {
      const { whereClause, params, dateStart, dateEnd } = buildFilters(query)

      const page = Number(query.page) > 0 ? Number(query.page) : 1
      const limit = Number(query.limit) > 0 ? Number(query.limit) : 10
      const offset = (page - 1) * limit

      const search = query.search ? String(query.search).trim() : ''
      const searchClause = search
        ? ` AND (c.course_name LIKE ? OR c.course_shortname LIKE ? OR c.subject_id LIKE ? OR fc.category_name LIKE ? OR sp.category_name LIKE ?)`
        : ''
      const searchParams = search ? [
        `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`
      ] : []

      // Sorting
      const sortMap = {
        site: 'site',
        fakultas: 'fakultas',
        program_studi: 'program_studi',
        num_teacher: 'num_teacher',
        num_student: 'num_student',
        file: 'file',
        video: 'video',
        forum: 'forum',
        quiz: 'quiz',
        assignment: 'assignment',
        url: 'url',
        sum: 'sum',
        avg_activity_per_student_per_day: 'avg_activity_per_student_per_day'
      }
      const sortByKey = sortMap[query.sort_by] || 'sum'
      const sortOrder = String(query.sort_order).toLowerCase() === 'asc' ? 'ASC' : 'DESC'

      // Base subquery grouped by course
      const baseSql = `
        FROM (
          SELECT 
            c.course_id AS id,
            COALESCE(sp.category_site, 'UNKNOWN') AS site,
            COALESCE(fc.category_name, CONCAT('FAC_', c.faculty_id)) AS fakultas,
            COALESCE(sp.category_name, CONCAT('PRODI_', c.program_id)) AS program_studi,
            MAX(uae.num_teachers) AS num_teacher,
            MAX(uae.num_students) AS num_student,
            SUM(uae.file_views) AS file,
            SUM(uae.video_views) AS video,
            SUM(uae.forum_views) AS forum,
            SUM(uae.quiz_views) AS quiz,
            SUM(uae.assignment_views) AS assignment,
            SUM(uae.url_views) AS url,
            SUM(uae.file_views + uae.video_views + uae.forum_views + uae.quiz_views + uae.assignment_views + uae.url_views) AS sum,
            AVG(uae.avg_activity_per_student_per_day) AS avg_activity_per_student_per_day
          FROM monev_sas_user_activity_etl uae
          JOIN monev_sas_courses c ON c.course_id = uae.course_id
          LEFT JOIN monev_sas_categories fc ON fc.category_id = c.faculty_id AND fc.category_type = 'FACULTY'
          LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
          ${whereClause}
          GROUP BY c.course_id
        ) t
        WHERE 1=1 ${searchClause}
      `

      const countSql = `SELECT COUNT(*) AS total ${baseSql}`
      const [{ total }] = await database.query(countSql, [...params, ...searchParams])

      const dataSql = `
        SELECT 
          id, site, fakultas, program_studi,
          num_teacher, num_student,
          file, video, forum, quiz, assignment, url,
          sum,
          ROUND(avg_activity_per_student_per_day, 1) AS avg_activity_per_student_per_day
        ${baseSql}
        ORDER BY ${sortByKey} ${sortOrder}
        LIMIT ${limit} OFFSET ${offset}
      `

      const rows = await database.query(dataSql, [...params, ...searchParams])

      return {
        status: true,
        filters: {
          university: query.university || '',
          fakultas_id: query.fakultas_id || '',
          prodi_id: query.prodi_id || '',
          subject_ids: query.subject_ids || '',
          date_start: dateStart,
          date_end: dateEnd
        },
        sorting: { sort_by: query.sort_by || 'sum', sort_order: sortOrder.toLowerCase() },
        pagination: {
          current_page: page,
          items_per_page: limit,
          total_items: Number(total || 0),
          total_pages: Math.ceil(Number(total || 0) / limit)
        },
        data: rows.map(r => ({
          id: Number(r.id),
          site: r.site,
          fakultas: r.fakultas,
          program_studi: r.program_studi,
          num_teacher: Number(r.num_teacher || 0),
          num_student: Number(r.num_student || 0),
          file: Number(r.file || 0),
          video: Number(r.video || 0),
          forum: Number(r.forum || 0),
          quiz: Number(r.quiz || 0),
          assignment: Number(r.assignment || 0),
          url: Number(r.url || 0),
          sum: Number(r.sum || 0),
          avg_activity_per_student_per_day: Number(r.avg_activity_per_student_per_day || 0)
        }))
      }
    } catch (error) {
      logger.error('SAS getSummaryTable error:', error.message)
      throw error
    }
  }
}

module.exports = sasSummaryService


