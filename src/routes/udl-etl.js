const Joi = require("joi");
const udlEtlApiController = require("../controllers/udlEtlApiController");

const routes = [
  {
    method: "GET",
    path: "/udl-etl/logs",
    handler: udlEtlApiController.getUdlEtlLogs,
    options: {
      auth: "jwt",
      description: "Get UDL ETL logs",
      tags: ["udl-etl", "api"],
      validate: {
        query: Joi.object({
          page: Joi.number().default(1),
          limit: Joi.number().default(10),
          sort_by: Joi.string().default("created_at"),
          sort_order: Joi.string().default("desc"),
          filters: Joi.object({
            type_run: Joi.string().default(""),
            status: Joi.string().default(""),
            start_date: Joi.string().default(""),
            end_date: Joi.string().default(""),
          }),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/udl-etl/status",
    handler: udlEtlApiController.getUdlEtlStatus,
    options: {
      auth: "jwt",
      description: "Get UDL ETL status",
      tags: ["udl-etl", "api"],
    },
  },
  {
    method: "POST",
    path: "/udl-etl/start",
    handler: udlEtlApiController.startUdlEtlContinuous,
    options: {
      auth: "jwt",
      description: "Start UDL ETL continuously",
      tags: ["udl-etl", "api"],
      validate: {
        payload: Joi.object({
          interval: Joi.number()
            .integer()
            .min(1)
            .optional()
            .description("Interval in seconds (default: 300 = 5 minutes)"),
          retry_interval: Joi.number()
            .integer()
            .min(1)
            .optional()
            .description(
              "Retry interval in seconds (default: 120 = 2 minutes)"
            ),
        }).optional(),
      },
    },
  },
  {
    method: "POST",
    path: "/udl-etl/stop-continuous",
    handler: udlEtlApiController.stopUdlEtlContinuous,
    options: {
      auth: "jwt",
      description: "Stop UDL ETL continuously",
      tags: ["udl-etl", "api"],
    },
  },
];

module.exports = routes;
