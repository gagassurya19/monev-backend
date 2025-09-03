const swaggerOptions = {
  info: {
    title: "MONEV API",
    version: "1.0.0",
    description: "API for MONEV - Educational Analytics Platform",
  },
  documentationPath: "/swagger",
  jsonPath: "/swagger.json",
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        "JWT Authorization header using the Bearer scheme. Enter your JWT token in the format: Bearer {your-jwt-token}",
    },
    token: {
      type: "apiKey",
      name: "token",
      in: "query",
      description:
        "JWT token as query parameter. Example: ?token=your-jwt-token",
    },
  },
  security: [{ Bearer: [] }, { token: [] }],
  grouping: "tags",
  sortTags: "alpha",
  tags: [
    {
      name: "sp-etl",
      description: "SP ETL (Student Performance ETL) endpoints",
    },
    {
      name: "tp-etl",
      description: "TP ETL (Teacher Performance ETL) endpoints",
    },
    { name: "api", description: "API endpoints" },
    { name: "summary", description: "Summary data endpoints" },
    { name: "detail", description: "Detail data endpoints" },
    { name: "logs", description: "Log data endpoints" },
    { name: "auth", description: "Authentication endpoints" },
    { name: "health", description: "Health check endpoints" },
    { name: "etl", description: "ETL process endpoints" },
    { name: "sas", description: "Student Activity Summary endpoints" },
    { name: "celoe", description: "External CELOE API proxy endpoints" },
  ],
  schemes: ["http", "https"],
  host: "localhost:3001",
  basePath: "/api/v1",
  consumes: ["application/json"],
  produces: ["application/json"],
  swaggerUIPath: "/swagger/",
  swaggerUI: true,
  expanded: "none",
  sortEndpoints: "alpha",
};

module.exports = swaggerOptions;
