const Joi = require('joi');
const tpEtlApiController = require("../controllers/tpEtlApiController");

const routes = [
	// TP ETL Summary routes
	{
		method: "GET",
		path: "/summary",
		handler: tpEtlApiController.getSummaryData,
		options: {
			auth: "jwt",
			description: "Get TP ETL Summary data with pagination and search",
			tags: ["TP ETL"],
			validate: {
				query: Joi.object({
					page: Joi.number().default(1),
					limit: Joi.number().default(10),
					search: Joi.string().default(''),
					sortBy: Joi.string().default('id'),
					sortOrder: Joi.string().valid('asc', 'desc').default('desc')
				})
			},
		},
	},
	{
		method: "GET",
		path: "/summary/{id}",
		handler: tpEtlApiController.getSummaryById,
		options: {
			auth: "jwt",
			description: "Get TP ETL Summary data by ID",
			tags: ["TP ETL"],
			validate: {
				params: Joi.object({
					id: Joi.number().required()
				})
			}
		},
	},

	// TP ETL Detail routes
	{
		method: "GET",
		path: "/detail",
		handler: tpEtlApiController.getDetailData,
		options: {
			auth: "jwt",
			description: "Get TP ETL Detail data with pagination and search",
			tags: ["TP ETL"],
			validate: {
				query: Joi.object({
					page: Joi.number().default(1),
					limit: Joi.number().default(10),
					search: Joi.string().default(''),
					sortBy: Joi.string().default('id'),
					sortOrder: Joi.string().valid('asc', 'desc').default('desc')
					})
			},
		},
	},
	{
		method: "GET",
		path: "/detail/{id}",
		handler: tpEtlApiController.getDetailById,
		options: {
			auth: "jwt",
			description: "Get TP ETL Detail data by ID",
			tags: ["TP ETL"],
			validate: {
				params: Joi.object({
					id: Joi.number().required()
				})
			},
		},
	},
	{
		method: "GET",
		path: "/detail/user/{userId}",
		handler: tpEtlApiController.getDetailByUserId,
		options: {
			auth: "jwt",
			description: "Get TP ETL Detail data by User ID",
			tags: ["TP ETL"],
			validate: {
				params: Joi.object({
					userId: Joi.number().required()
				}),
				query: Joi.object({
					page: Joi.number().default(1),
					limit: Joi.number().default(10),
					sortBy: Joi.string().default('id'),
					sortOrder: Joi.string().valid('asc', 'desc').default('desc')
				})
			},
		},
	},

	// TP ETL Logs routes
	{
		method: "GET",
		path: "/logs",
		handler: tpEtlApiController.getLogs,
		options: {
			auth: "jwt",
			description: "Get TP ETL Logs with pagination and filtering",
			tags: ["TP ETL"],
			validate: {
				query: Joi.object({
					page: Joi.number().default(1),
					limit: Joi.number().default(10),
					process_type: Joi.string().default(''),
					status: Joi.string().default(''),
					sortBy: Joi.string().default('id'),
					sortOrder: Joi.string().valid('asc', 'desc').default('desc')
				})
			},
		},
	},
	{
		method: "GET",
		path: "/logs/{id}",
		handler: tpEtlApiController.getLogById,
		options: {
			auth: "jwt",
			description: "Get TP ETL Log by ID",
			tags: ["TP ETL"],
			validate: {
				params: Joi.object({
					id: Joi.number().required()
				})
			},
		},
	},
];

module.exports = routes;
