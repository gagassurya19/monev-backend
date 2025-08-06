const sasEtlController = require('../controllers/sas-etl-controller')
const Joi = require('joi')

// Validators for SAS ETL routes
const validators = {
    // SAS ETL logs pagination
    sasEtlPagination: Joi.object({
        limit: Joi.number().integer().min(1).max(50).default(5),
        offset: Joi.number().integer().min(0).default(0)
    }),
    // Realtime logs pagination
    realtimeLogsPagination: Joi.object({
        limit: Joi.number().integer().min(1).max(200).default(100),
        offset: Joi.number().integer().min(0).default(0)
    })
}

const routes = [
    {
        method: 'POST',
        path: '/sas-etl/category-subject/run',
        handler: sasEtlController.triggerSASCategorySubjectETL,
        options: {
            description: 'Run SAS ETL process in background',
            notes: 'Manually trigger the SAS ETL process to fetch and sync categories and subjects from external API. Process runs in background.',
            tags: ['api', 'sas-etl'],
            auth: 'jwt',
        }
    },
    {
        method: 'GET',
        path: '/sas-etl/category-subject/logs',
        handler: sasEtlController.getSASCategorySubjectLogs,
        options: {
            description: 'Get SAS ETL logs history',
            notes: 'Get paginated list of SAS ETL process logs history',
            tags: ['api', 'sas-etl'],
            validate: {
                query: validators.sasEtlPagination
            },
            auth: 'jwt',
        }
    },
    {
        method: 'GET',
        path: '/sas-etl/logs/{log_id}/realtime',
        handler: sasEtlController.streamRealtimeCategorySubjectLogs,
        options: {
            description: 'Stream realtime logs for specific ETL process',
            notes: `
                Stream realtime logs using Server-Sent Events (SSE).\n
                ⚠️ Swagger UI does not support SSE endpoints. Use curl or browser EventSource API instead.\n
                Example curl:\n
                curl -N http://localhost:3000/sas-etl/logs/123/realtime
            `,
            tags: ['api', 'sas-etl', 'streaming'],
            validate: {
                params: Joi.object({
                    log_id: Joi.number().integer().required().description('ETL log ID')
                })
            },
            auth: 'jwt', // No auth for testing
        }
    },
    {
        method: 'GET',
        path: '/sas-etl/logs/{log_id}',
        handler: sasEtlController.getRealtimeCategorySubjectLogs,
        options: {
            description: 'Get realtime logs for specific ETL process',
            notes: 'Get paginated list of realtime logs for a specific ETL process log ID',
            tags: ['api', 'sas-etl'],
            validate: {
                params: Joi.object({
                    log_id: Joi.number().integer().required().description('ETL log ID')
                }),
                query: validators.realtimeLogsPagination
            },
            auth: 'jwt', // No auth for testing
        }
    },
]

module.exports = routes 