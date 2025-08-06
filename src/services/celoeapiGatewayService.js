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
        'Authorization': `Bearer ${this.token}`
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

  // Get ETL Status
  async getETLStatus() {
    return await this.makeRequest('GET', '/api/etl/status')
  }

  // Get ETL Logs with pagination
  async getETLLogs(limit = 10, offset = 0) {
    return await this.makeRequest('GET', '/api/etl/logs', null, { limit, offset })
  }

  // Run ETL Process
  async runETL() {
    return await this.makeRequest('POST', '/api/etl/run')
  }

  // Run Incremental ETL
  async runIncrementalETL() {
    return await this.makeRequest('POST', '/api/etl/run-incremental')
  }

  // Clear Stuck ETL Processes
  async clearStuckETL() {
    return await this.makeRequest('POST', '/api/etl/clear-stuck')
  }

  // Force Clear All Inprogress ETL
  async forceClearETL() {
    return await this.makeRequest('POST', '/api/etl/force-clear')
  }

  // Get Debug ETL Status
  async getDebugETL() {
    return await this.makeRequest('GET', '/api/etl/debug')
  }
}

module.exports = new CeloeApiGatewayService()