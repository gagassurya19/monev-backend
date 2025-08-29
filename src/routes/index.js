const config = require("../../config");
const healthRoutes = require("./health");
const authRoutes = require("./auth");
const coursePerformanceRoutes = require("./course-performance");
const sasCategorySubjectRoutes = require("./sas-category-subject");
const sasSummaryRoutes = require("./sas-summary");
const sasEtlRoutes = require("./etl-student-activity-summary");
const etlCoursePerformanceRoutes = require("./etl-course-performance");
const celoeApiRoutes = require("./celoe-api");
const spEtlRoutes = require("./sp-etl-router");

// Combine all routes
const routes = [
  // Health check routes (no prefix needed)
  ...healthRoutes.map((route) => {
    return {
      ...route,
      path: `${config.api.prefix}/health${route.path}`,
    };
  }),

  // API routes with prefix
  ...authRoutes.map((route) => ({
    ...route,
    path: `${config.api.prefix}/auth${route.path}`,
  })),

  ...coursePerformanceRoutes.map((route) => ({
    ...route,
    path: `${config.api.prefix}/cp${route.path}`,
  })),

  ...sasCategorySubjectRoutes.map((route) => ({
    ...route,
    path: `${config.api.prefix}/sas-category-subject${route.path}`,
  })),

  ...sasEtlRoutes.map((route) => ({
    ...route,
    path: `${config.api.prefix}/etl-sas${route.path}`,
  })),

  ...celoeApiRoutes.map((route) => ({
    ...route,
    path: `${config.api.prefix}${config.celoeapi.prefix}${route.path}`,
  })),

  ...etlCoursePerformanceRoutes.map((route) => ({
    ...route,
    path: `${config.api.prefix}/etl-cp${route.path}`,
  })),

  ...sasSummaryRoutes.map((route) => ({
    ...route,
    path: `${config.api.prefix}/sas/summary${route.path}`,
  })),
  ...spEtlRoutes.map((route) => ({
    ...route,
    path: `${config.api.prefix}/sp-etl${route.path}`,
  })),
];

module.exports = routes;
