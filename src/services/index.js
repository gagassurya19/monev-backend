// Centralized service exports
// This file provides a single point of import for all services

const AuthService = require('./authService')
const CoursePerformanceService = require('./course-performance')
const CronService = require('./cronService')
const EtlCoursePerformanceService = require('./etlCoursePerformanceService')
const FetchSASCategorySubjectService = require('./fetch-sas-category-subject')
const StudentActivitySummaryService = require('./student-activity-summary')
const LogService = require('./logService')
const RealtimeLogService = require('./realtimeLogService')
const CeloeApiGatewayService = require('./celoeapiGatewayService')

module.exports = {
  AuthService,
  CoursePerformanceService,
  CronService,
  EtlCoursePerformanceService,
  FetchSASCategorySubjectService,
  StudentActivitySummaryService,
  LogService,
  RealtimeLogService,
  CeloeApiGatewayService,
  
  // Aliases for backward compatibility
  authService: AuthService,
  coursePerformanceService: CoursePerformanceService,
  cronService: CronService,
  etlService: EtlCoursePerformanceService,
  fetchSASCategorySubjectService: FetchSASCategorySubjectService,
  studentActivitySummaryService: StudentActivitySummaryService,
  logService: LogService,
  realtimeLogService: RealtimeLogService,
  celoeApiGatewayService: CeloeApiGatewayService
} 