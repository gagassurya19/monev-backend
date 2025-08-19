const Boom = require('@hapi/boom')
const { SASFetchCategorySubjectService, StudentActivitySummaryService, LogService, RealtimeLogService } = require('../services')
const logger = require('../utils/logger')
const database = require('../database/connection')

const sasFetchCategorySubjectController = {
    // Initialize the service
    service: null,
    logService: null,
    realtimeLogService: null,
    studentActivitySummaryService: null,

    // Initialize the service
    async init() {
        try {
            if (!this.service) {
                this.service = new SASFetchCategorySubjectService()
                await this.service.init()
            }
            
            if (!this.logService) {
                this.logService = new LogService()
            }
            
            if (!this.realtimeLogService) {
                this.realtimeLogService = new RealtimeLogService()
            }

            // StudentActivitySummaryService is an object literal, not a class
            if (!this.studentActivitySummaryService) {
                this.studentActivitySummaryService = StudentActivitySummaryService
            }
        } catch (error) {
            logger.error('Failed to initialize services:', error.message)
            throw error
        }
    },

    // Test database connection
    testConnection: async (request, h) => {
        try {
            // Test database connection
            await database.init()
            const testResult = await database.query('SELECT 1 as test')
            
            return h.response({
                status: true,
                message: 'Database connection test successful',
                data: testResult
            }).code(200)
        } catch (error) {
            logger.error('Database connection test failed:', error.message)
            return h.response({
                status: false,
                message: 'Database connection test failed',
                error: error.message
            }).code(500)
        }
    },

    // Filter endpoints
    getFakultas: async (request, h) => {
        try {
            await sasFetchCategorySubjectController.init()
            const decodedToken = request.auth.credentials;
            const { search } = request.query;
            
            const data = await sasFetchCategorySubjectController.studentActivitySummaryService.getFakultas(decodedToken, search, request.query.page, request.query.limit);

            return h.response({
                status: true,
                dataUser: decodedToken,
                ...data,
            });
        } catch (err) {
            logger.error('Failed to get fakultas:', err.message)
            return h.response({
                status: false,
                message: 'Failed to get fakultas',
                error: err.message
            }).code(500);
        }
    },

    getProdiByFakultas: async (request, h) => {
        try {
            await sasFetchCategorySubjectController.init()
            const decodedToken = request.auth.credentials;
            const { fakultas, kampus, search } = request.query;
            
            const data = await sasFetchCategorySubjectController.studentActivitySummaryService.getProdiByFakultas(decodedToken, fakultas, kampus, search, request.query.page, request.query.limit);

            return h.response({
                status: true,
                dataUser: decodedToken,
                ...data,
            });
        } catch (err) {
            logger.error('Failed to get prodi by id_fakultas & kampus:', err.message)
            return h.response({
                status: false,
                message: 'Failed to get prodi by id_fakultas & kampus',
                error: err.message
            }).code(500);
        }
    },

    getMatkulByProdi: async (request, h) => {
        try {
            await sasFetchCategorySubjectController.init()
            const decodedToken = request.auth.credentials;
            const { prodi, search } = request.query;
            
            const data = await sasFetchCategorySubjectController.studentActivitySummaryService.getMatkulByProdi(decodedToken, prodi, search, request.query.page, request.query.limit);

            return h.response({
                status: true,
                dataUser: decodedToken,
                ...data,
            });
        } catch (err) {
            logger.error('Failed to get matakuliah with id_prodi:', err.message)
            return h.response({
                status: false,
                message: 'Failed to get matakuliah with id_prodi',
                error: err.message
            }).code(500);
        }
    },

    // Trigger ETL process for fetching categories and subjects
    triggerSASCategorySubjectETL: async (request, h) => {
        try {
            await sasFetchCategorySubjectController.init()

            logger.info('SAS Category Subject ETL background process requested')

            // Check if ETL is already running
            const isRunning = await sasFetchCategorySubjectController.logService.isEtlRunning('fetch_category_subject')
            if (isRunning) {
                throw Boom.conflict('SAS Category Subject ETL process is already running')
            }

            // Run ETL process in background (non-blocking) - let service handle log creation
            sasFetchCategorySubjectController.service.runEtlProcess().catch(error => {
                logger.error('Background ETL process failed:', error.message)
            })

            return h.response({
                status: true,
                message: 'SAS Category Subject ETL process started in background',
                data: {
                    status: 'started',
                    message: 'ETL process is running in background. Check logs for progress.'
                }
            }).code(200)
        } catch (error) {
            logger.error('SAS Category Subject ETL background trigger failed:', error.message)
            if (error.isBoom) throw error
            throw Boom.badImplementation('SAS Category Subject ETL process failed')
        }
    },

    // Get SAS Category Subject ETL logs history
    getSASCategorySubjectLogs: async (request, h) => {
        try {
            await sasFetchCategorySubjectController.init()

            const { limit = 5, offset = 0 } = request.query

            // Ensure parameters are properly converted to integers
            const limitInt = parseInt(limit) || 5
            const offsetInt = parseInt(offset) || 0

            const result = await sasFetchCategorySubjectController.logService.getLogsByType('fetch_category_subject', limitInt, offsetInt)

            return h.response({
                status: true,
                message: 'Get SAS Category Subject ETL logs history completed successfully',
                data: result
            }).code(200)
        } catch (error) {
            logger.error('Get SAS Category Subject ETL logs history failed:', error.message)
            if (error.isBoom) throw error
            throw Boom.badImplementation('Failed to get SAS Category Subject ETL logs history')
        }
    },

    // Stream real-time logs for specific ETL run
    streamRealtimeCategorySubjectLogs: async (request, h) => {
        try {
            await sasFetchCategorySubjectController.init();

            const { logId } = request.params;
            const res = request.raw.res; // ✅ native Node.js response

            // Check if log_id exists
            const logExists = await sasFetchCategorySubjectController.logService.getLogById(logId);

            if (!logExists) {
                throw Boom.notFound(`ETL log with ID ${logId} not found`);
            }

            // Set header SSE
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            });

            // Send initial connection message
            res.write(`data: ${JSON.stringify({
                type: 'connection',
                message: 'Connected to realtime log stream',
                log_id: logId,
                timestamp: new Date().toISOString(),
            })}\n\n`);

            let lastLogId = 0;
            const pollInterval = setInterval(async () => {
                try {
                    const newLogs = await sasFetchCategorySubjectController.realtimeLogService.getLatestRealtimeLogs(logId, 50);
                    const filteredLogs = newLogs.filter(log => log.id > lastLogId);

                    if (filteredLogs.length > 0) {
                        lastLogId = Math.max(...filteredLogs.map((log) => log.id));

                        for (const log of filteredLogs) {
                            const logData = {
                                type: 'log',
                                id: log.id,
                                log_id: log.log_id,
                                timestamp: log.timestamp,
                                level: log.level,
                                message: log.message,
                                progress: log.progress,
                            };
                            res.write(`data: ${JSON.stringify(logData)}\n\n`);
                        }
                    }

                    const etlStatus = await sasFetchCategorySubjectController.logService.getLogById(logId);

                    if (etlStatus && etlStatus.status !== 'running') {
                        res.write(`data: ${JSON.stringify({
                            type: 'completion',
                            status: etlStatus.status,
                            message: 'ETL process completed',
                            timestamp: new Date().toISOString(),
                        })}\n\n`);

                        clearInterval(pollInterval);
                        res.end();
                    }

                } catch (error) {
                    console.error('Polling error:', error.message);
                    res.write(`data: ${JSON.stringify({
                        type: 'error',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                    })}\n\n`);
                }
            }, 1000);

            // Handle disconnect
            request.raw.req.on('close', () => {
                clearInterval(pollInterval);
                res.end();
                console.log(`Client disconnected from log ${logId}`);
            });

            return h.abandon; // ✅ Tanda bahwa Hapi tidak harus tangani response lagi

        } catch (error) {
            console.error('Stream realtime logs failed:', error);
            if (error.isBoom) throw error;
            throw Boom.badImplementation('Failed to stream realtime logs');
        }
    },

    // Get realtime logs for specific log_id (non-streaming)
    getRealtimeCategorySubjectLogs: async (request, h) => {
        try {
            await sasFetchCategorySubjectController.init()

            const { logId } = request.params
            const { limit = 100, offset = 0 } = request.query

            // Ensure parameters are properly converted to integers
            const limitInt = parseInt(limit) || 100
            const offsetInt = parseInt(offset) || 0
            const logIdInt = parseInt(logId)

            // Validate log_id exists
            const logExists = await sasFetchCategorySubjectController.logService.getLogById(logIdInt)

            if (!logExists) {
                throw Boom.notFound(`ETL log with ID ${logId} not found`)
            }

            // Get realtime logs using realtime log service
            const result = await sasFetchCategorySubjectController.realtimeLogService.getRealtimeLogs(logIdInt, limitInt, offsetInt)

            return h.response({
                status: true,
                message: 'Get realtime logs completed successfully',
                data: result
            }).code(200)

        } catch (error) {
            logger.error('Get realtime logs failed:', error.message)
            if (error.isBoom) throw error
            throw Boom.badImplementation('Failed to get realtime logs')
        }
    }
}

module.exports = sasFetchCategorySubjectController
