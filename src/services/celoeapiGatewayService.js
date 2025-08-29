const axios = require('axios')
const config = require('../../config')
const logger = require('../utils/logger')

class CeloeApiGatewayService {
  constructor() {
    this.baseUrl = config.celoeapi.baseUrl
    this.token = 'default-webhook-token-change-this' // This should be configurable
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${this.token}`
      }
    })
  }

  // Helper method to make API calls
  async makeRequest(method, endpoint, data = null, params = null) {
    try {
      logger.info(`Making ${method} request to ${endpoint}`, { params, data })
      
      const response = await this.client.request({
        method,
        url: endpoint,
        data,
        params
      })
      
      logger.info(`Request successful: ${method} ${endpoint}`)
      return response.data
    } catch (error) {
      logger.error(`Request failed: ${method} ${endpoint}`, {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      if (error.response) {
        throw new Error(`API request failed: ${error.response.status} - ${error.response.data?.message || error.message}`)
      }
      throw new Error(`Network error: ${error.message}`)
    }
  }

  // ===== SAS (Student Activity Summary) ETL Methods =====

  // Run SAS ETL Pipeline
  async runSASETL(startDate = null, endDate = null, concurrency = 1) {
    const data = {}
    if (startDate) data.start_date = startDate
    if (endDate) data.end_date = endDate
    if (concurrency) data.concurrency = concurrency
    
    return await this.makeRequest('POST', '/api/etl_sas/run', data)
  }

  // Clean SAS ETL Data
  async cleanSASETL() {
    return await this.makeRequest('POST', '/api/etl_sas/clean', {})
  }

  // Stop SAS ETL Pipeline
  async stopSASETL() {
    return await this.makeRequest('POST', '/api/etl_sas/stop_pipeline', {})
  }

  // Get SAS ETL Logs
  async getSASETLLogs(limit = 50, offset = 0, status = null) {
    const params = { limit, offset }
    if (status) params.status = status
    
    return await this.makeRequest('GET', '/api/etl_sas/logs', null, params)
  }

  // Get SAS ETL Status
  async getSASETLStatus() {
    return await this.makeRequest('GET', '/api/etl_sas/status')
  }

  // Export SAS ETL Data
  async exportSASETLData(limit = 100, offset = 0, date = null, courseId = null) {
    const params = { limit, offset }
    if (date) params.date = date
    if (courseId) params.course_id = courseId
    
    return await this.makeRequest('GET', '/api/etl_sas/export', null, params)
  }

  // Get Course Information
  async getCourseInfo(courseId) {
    return await this.makeRequest('GET', `/api/courses/${courseId}`)
  }

  // ===== CP (Course Performance) ETL Methods =====

  // Run CP ETL Pipeline
  async runCPETL(startDate = null, endDate = null, concurrency = 1) {
    const data = {}
    if (startDate) data.start_date = startDate
    if (endDate) data.end_date = endDate
    if (concurrency) data.concurrency = concurrency
    
    return await this.makeRequest('POST', '/api/etl_cp/run', data)
  }

  // Clean CP ETL Data
  async cleanCPETL() {
    return await this.makeRequest('POST', '/api/etl_cp/clean', {})
  }

  // Stop CP ETL Pipeline
  async stopCPETL() {
    return await this.makeRequest('POST', '/api/etl_cp/stop_pipeline', {})
  }

  // Get CP ETL Logs
  async getCPETLLogs(limit = 50, offset = 0, status = null) {
    const params = { limit, offset }
    if (status) params.status = status
    
    return await this.makeRequest('GET', '/api/etl_cp/logs', null, params)
  }

  // Get CP ETL Status
  async getCPETLStatus() {
    return await this.makeRequest('GET', '/api/etl_cp/status')
  }

  // Export CP ETL Data
  async exportCPETLData(limit = 100, offset = 0, table = null, tables = null, debug = false) {
    const params = { limit, offset }
    if (table) params.table = table
    if (tables) params.tables = tables
    if (debug) params.debug = debug
    
    return await this.makeRequest('GET', '/api/etl_cp/export', null, params)
  }
}

module.exports = new CeloeApiGatewayService()