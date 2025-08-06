const Boom = require('@hapi/boom')
const { FetchSASCategorySubjectService, LogService, RealtimeLogService } = require('../services')
const logger = require('../utils/logger')

const sasEtlController = {
    // Initialize the service
    service: null,
    logService: null,
    realtimeLogService: null,

    // Initialize the service
    async init() {
        if (!this.service) {
            this.service = new FetchSASCategorySubjectService()
            await this.service.init()
        }
        
        if (!this.logService) {
            this.logService = new LogService()
        }
        
        if (!this.realtimeLogService) {
            this.realtimeLogService = new RealtimeLogService()
        }
    },

    //   fetch category and subject 
    triggerSASCategorySubjectETL: async (request, h) => {
        try {
            await sasEtlController.init()

            logger.info('SAS ETL background process requested', {
                user: request.auth.credentials?.user || 'anonymous'
            })

            // Check if ETL is already running
            const isRunning = await sasEtlController.logService.isEtlRunning('fetch_category_subject')
            if (isRunning) {
                throw Boom.conflict('SAS ETL process is already running')
            }

            // Run ETL process in background (non-blocking) - let service handle log creation
            sasEtlController.service.runEtlProcess().catch(error => {
                logger.error('Background ETL process failed:', error.message)
            })

            return h.response({
                status: true,
                message: 'SAS ETL process started in background',
                data: {
                    status: 'started',
                    message: 'ETL process is running in background. Check logs for progress.'
                }
            }).code(200)
        } catch (error) {
            logger.error('SAS ETL background trigger failed:', error.message)
            if (error.isBoom) throw error
            throw Boom.badImplementation('SAS ETL process failed')
        }
    },

    // Get SAS ETL logs history
    getSASCategorySubjectLogs: async (request, h) => {
        try {
            await sasEtlController.init()

            const { limit = 5, offset = 0 } = request.query

            logger.info('Get SAS ETL logs history', { limit, offset })

            // Ensure parameters are properly converted to integers
            const limitInt = parseInt(limit) || 5
            const offsetInt = parseInt(offset) || 0

            const result = await sasEtlController.logService.getLogsByType('fetch_category_subject', limitInt, offsetInt)

            return h.response({
                status: true,
                message: 'Get SAS ETL logs history completed successfully',
                data: result
            }).code(200)
        } catch (error) {
            logger.error('Get SAS ETL logs history failed:', error.message)
            if (error.isBoom) throw error
            throw Boom.badImplementation('Failed to get SAS ETL logs history')
        }
    },

    streamRealtimeCategorySubjectLogs: async (request, h) => {
        try {
            await sasEtlController.init();

            const { log_id } = request.params;
            const res = request.raw.res; // ✅ native Node.js response

            // Cek apakah log_id ada
            const logExists = await sasEtlController.logService.getLogById(log_id);

            if (!logExists) {
                throw Boom.notFound(`ETL log with ID ${log_id} not found`);
            }

            // Set header SSE
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            });

            // Kirim pesan awal koneksi
            res.write(`data: ${JSON.stringify({
                type: 'connection',
                message: 'Connected to realtime log stream',
                log_id,
                timestamp: new Date().toISOString(),
            })}\n\n`);

            let lastLogId = 0;
            const pollInterval = setInterval(async () => {
                try {
                    const newLogs = await sasEtlController.realtimeLogService.getLatestRealtimeLogs(log_id, 50);
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

                    const etlStatus = await sasEtlController.logService.getLogById(log_id);

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
                console.log(`Client disconnected from log ${log_id}`);
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
            await sasEtlController.init()

            const { log_id } = request.params
            const { limit = 100, offset = 0 } = request.query

            // Ensure parameters are properly converted to integers
            const limitInt = parseInt(limit) || 100
            const offsetInt = parseInt(offset) || 0
            const logIdInt = parseInt(log_id)

            logger.info('Get realtime logs requested', { log_id: logIdInt, limit: limitInt, offset: offsetInt })

            // Validate log_id exists
            const logExists = await sasEtlController.logService.getLogById(logIdInt)

            if (!logExists) {
                throw Boom.notFound(`ETL log with ID ${log_id} not found`)
            }

            // Get realtime logs using universal service
            const result = await sasEtlController.realtimeLogService.getRealtimeLogs(logIdInt, limitInt, offsetInt)

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

module.exports = sasEtlController 