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

  // Date range (kept for backward compatibility but not used in view queries)
  let dateStart = query.date_start
  let dateEnd = query.date_end
  if (!dateStart || !dateEnd) {
    const def = coalesceDate()
    dateStart = def.start
    dateEnd = def.end
  }

  // University filter (site from view)
  if(query.university){
    where.push('site = ?')
    params.push(query.university)
  }

  // Fakultas filter (faculty_id from view)
  if (query.fakultas_id) {
    where.push('faculty_id = ?')
    params.push(query.fakultas_id)
  }

  // Prodi filter (program_id from view)
  if (query.prodi_id) {
    where.push('program_id = ?')
    params.push(query.prodi_id)
  }

  // Subject filter (id from view)
  if (query.subject_id) {
    // Single subject filter
    where.push('id = ?')
    params.push(query.subject_id)
  } else if (query.subject_ids) {
    // Multiple subjects filter
    const ids = String(query.subject_ids)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (ids.length > 0) {
      where.push(`id IN (${ids.map(() => '?').join(',')})`)
      params.push(...ids)
    }
  }

  return { whereClause: where.length ? `AND ${where.join(' AND ')}` : '', params, dateStart, dateEnd }
}

function getGroupSelect(groupBy) {
  switch (groupBy) {
    case 'kampus':
    case 'site':
      return `COALESCE(site, 'UNKNOWN')`
    case 'fakultas':
      return `fakultas`
    case 'prodi':
      return `program_studi`
    case 'subject':
      return `COALESCE(course_shortname, 'UNKNOWN')`
    default:
      return `COALESCE(course_shortname, 'UNKNOWN')`
  }
}

const sasSummaryService = {
  getChartAggregation: async (query) => {
    try {
      // Auto-determine the appropriate grouping level based on filters
      let autoGroupBy = 'site' // default
      
      // Check for most specific filter first (highest level of detail)
      if (query.subject_id) {
        // if there is subject_id show only one subject by id
        autoGroupBy = 'subject'
        // Add subject_id filter to whereClause
        if (!query.subject_ids) {
          query.subject_ids = query.subject_id
        }
      } else if (query.prodi_id) {
        // If filtering by program, show course/subject level
        autoGroupBy = 'subject'
      } else if (query.fakultas_id) {
        // If filtering by faculty, show program level
        autoGroupBy = 'prodi'
      } else if (query.university) {
        // If filtering by university, show faculty level
        autoGroupBy = 'fakultas'
      } else {
        // Use manual group_by if no filters, or default to faculty level
        autoGroupBy = 'site'
      }
      
      const { whereClause, params, dateStart, dateEnd } = buildFilters(query)

      // Pagination parameters
      const limit = Number(query.limit) > 0 ? Number(query.limit) : 10
      const offset = Number(query.offset) > 0 ? Number(query.offset) : 0

      const groupSelect = getGroupSelect(autoGroupBy)

      const sql = `
        SELECT 
          ${groupSelect} AS category,
          SUM(file) AS file,
          SUM(video) AS video,
          SUM(forum) AS forum,
          SUM(quiz) AS quiz,
          SUM(assignment) AS assignment,
          SUM(url) AS url,
          (SUM(file) + SUM(video) + SUM(forum) + SUM(quiz) + SUM(assignment) + SUM(url)) AS total_activities
        FROM v_sas_course_subject_summary
        WHERE 1=1 ${whereClause} ${autoGroupBy === 'site' ? 'AND site IS NOT NULL' : ''}
        GROUP BY ${groupSelect}
        ORDER BY 8 DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      // Debug logging
      console.log('Auto Group By:', autoGroupBy)
      console.log('Group Select:', groupSelect)
      console.log('Chart SQL:', sql)
      console.log('Chart params:', params)
      console.log('whereClause:', whereClause)
      
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
          group_by: autoGroupBy,
          auto_determined: true,
          university: query.university || '',
          fakultas_id: query.fakultas_id || '',
          prodi_id: query.prodi_id || '',
          subject_id: query.subject_id || '',
          subject_ids: query.subject_ids || '',
          date_start: dateStart,
          date_end: dateEnd
        },
        pagination: {
          limit,
          offset,
          total_items: data.length
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
      // Distribution and totals from view
      const distSql = `
        SELECT 
          SUM(file) AS file,
          SUM(video) AS video,
          SUM(forum) AS forum,
          SUM(quiz) AS quiz,
          SUM(assignment) AS assignment,
          SUM(url) AS url,
          SUM(sum) AS total_activities,
          AVG(avg_activity_per_student_per_day) AS average_score
        FROM v_sas_course_subject_summary
        WHERE 1=1 ${whereClause}
      `

      const [dist] = await database.query(distSql, params)

      // Active users: use the same approach as table endpoint - GROUP BY course_id to get latest per course
      // This will give us 6 instead of 12 by taking only the most recent record per course
      const activeSql = `
        SELECT 
          SUM(num_student) AS total_students,
          SUM(num_teacher) AS total_teachers
        FROM v_sas_course_subject_summary
        WHERE 1=1 ${whereClause}
      `
      const [active] = await database.query(activeSql, params)
      
      // Debug logging
      logger.info('Active users query result (from view):', { active })
      
      // Additional debugging: check individual records to see why we get 12 instead of 6
      const debugSql = `
        SELECT 
          id,
          course_name,
          num_student AS num_students,
          num_teacher AS num_teachers,
          site,
          fakultas,
          program_studi
        FROM v_sas_course_subject_summary
        WHERE 1=1 ${whereClause}
        ORDER BY id
      `
      const debugRecords = await database.query(debugSql, params)
    //   logger.info('Debug: Individual records breakdown:', { 
    //     totalRecords: debugRecords.length,
    //     records: debugRecords.map(r => ({
    //       course_id: r.course_id,
    //       date: r.extraction_date,
    //       students: r.num_students,
    //       teachers: r.num_teachers,
    //       course_name: r.course_name,
    //       subject_id: r.subject_id
    //     }))
    //   })

      // Completion rate: fraction of courses with any activity in range
      const completionSql = `
        SELECT 
          SUM(CASE WHEN sum > 0 THEN 1 ELSE 0 END) AS active_courses,
          COUNT(*) AS total_courses
        FROM v_sas_course_subject_summary
        WHERE 1=1 ${whereClause}
      `
      const [comp] = await database.query(completionSql, params)

      const totalActivities = Number(dist?.total_activities || 0)
      const averageScore = dist?.average_score != null ? Number(dist.average_score) : 0
      const totalStudents = Number(active?.total_students || 0)
      const totalTeachers = Number(active?.total_teachers || 0)
      const activeUsers = totalStudents + totalTeachers
      const completionRate = comp && comp.total_courses > 0 
        ? (Number((Number(comp.active_courses || 0) / Number(comp.total_courses || 1))) * 100).toFixed(2)
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

      console.log(whereClause)

      const page = Number(query.page) > 0 ? Number(query.page) : 1
      const limit = Number(query.limit) > 0 ? Number(query.limit) : 10
      const offset = (page - 1) * limit

      const search = query.search ? String(query.search).trim() : ''
      const searchClause = search
        ? ` AND (t.course_name LIKE ? OR t.course_shortname LIKE ? OR t.fakultas LIKE ? OR t.program_studi LIKE ?)`
        : ''
      const searchParams = search ? [
        `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`
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

      // Use prebuilt view instead of inline aggregation
      const baseSql = `
        FROM v_sas_course_subject_summary t
        WHERE 1=1 ${whereClause} ${searchClause}
      `

    //   console.log(baseSql,whereClause,searchClause)
      const countSql = `SELECT COUNT(*) AS total ${baseSql}`
      const [{ total }] = await database.query(countSql, [...params, ...searchParams])

      const dataSql = `
        SELECT 
          id, course_name, course_shortname, site, fakultas, program_studi,
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
          date_end: dateEnd,
          search: search
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
          course_name: r.course_name || '',
          course_shortname: r.course_shortname || '',
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


