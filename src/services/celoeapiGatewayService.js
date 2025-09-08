const axios = require("axios");
const config = require("../../config");
const logger = require("../utils/logger");

class CeloeApiGatewayService {
  constructor() {
    this.baseUrl = config.celoeapi.baseUrl;
    this.token = "default-webhook-token-change-this"; // This should be configurable
    this.timeout = config.celoeapi.timeout || 300000; // 5 minutes default
    this.retryAttempts = config.celoeapi.retryAttempts || 3;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${this.token}`
      },
    });
  }

  // Helper method to make API calls
  async makeRequest(method, endpoint, data = null, params = null) {
    try {
      logger.info(`Making ${method} request to ${endpoint}`, { params, data });

      const response = await this.client.request({
        method,
        url: endpoint,
        data,
        params,
      });

      logger.info(`Request successful: ${method} ${endpoint}`);
      return response.data;
    } catch (error) {
      logger.error(`Request failed: ${method} ${endpoint}`, {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response) {
        throw new Error(
          `API request failed: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        );
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // ===== SAS (Student Activity Summary) ETL Methods =====

  // Run SAS ETL Pipeline
  async runSASETL(startDate = null, endDate = null, concurrency = 1) {
    const data = {};
    if (startDate) data.start_date = startDate;
    if (endDate) data.end_date = endDate;
    if (concurrency) data.concurrency = concurrency;

    return await this.makeRequest("POST", "/api/etl_sas/run", data);
  }

  // Clean SAS ETL Data
  async cleanSASETL() {
    return await this.makeRequest("POST", "/api/etl_sas/clean", {});
  }

  // Get SAS ETL Logs
  async getSASETLLogs(limit = 50, offset = 0, status = null) {
    const params = { limit, offset };
    if (status) params.status = status;

    return await this.makeRequest("GET", "/api/etl_sas/logs", null, params);
  }

  // Get SAS ETL Status
  async getSASETLStatus() {
    return await this.makeRequest("GET", "/api/etl_sas/status");
  }

  // Export SAS ETL Data
  async exportSASETLData(
    limit = 100,
    offset = 0,
    date = null,
    courseId = null
  ) {
    const params = { limit, offset };
    if (date) params.date = date;
    if (courseId) params.course_id = courseId;

    return await this.makeRequest("GET", "/api/etl_sas/export", null, params);
  }

  // Get Course Information
  async getCourseInfo(courseId) {
    return await this.makeRequest("GET", `/api/courses/${courseId}`);
  }

  // ===== CP (Course Performance) ETL Methods =====

  // Run CP ETL Pipeline
  async runCPETL(startDate = null, endDate = null, concurrency = 1) {
    const data = {};
    if (startDate) data.start_date = startDate;
    if (endDate) data.end_date = endDate;
    if (concurrency) data.concurrency = concurrency;

    return await this.makeRequest("POST", "/api/etl_cp/run", data);
  }

  // Clean CP ETL Data
  async cleanCPETL() {
    return await this.makeRequest("POST", "/api/etl_cp/clean", {});
  }

  // Get CP ETL Logs
  async getCPETLLogs(limit = 50, offset = 0, status = null) {
    const params = { limit, offset };
    if (status) params.status = status;

    return await this.makeRequest("GET", "/api/etl_cp/logs", null, params);
  }

  // Get CP ETL Status
  async getCPETLStatus() {
    return await this.makeRequest("GET", "/api/etl_cp/status");
  }

  // Export CP ETL Data
  async exportCPETLData(
    limit = 100,
    offset = 0,
    table = null,
    tables = null,
    debug = false
  ) {
    const params = { limit, offset };
    if (table) params.table = table;
    if (tables) params.tables = tables;
    if (debug) params.debug = debug;

    return await this.makeRequest("GET", "/api/etl_cp/export", null, params);
  }

  // ===== SAS Users Login Activity ETL Methods =====
  // Run SAS Users Login Activity ETL Pipeline
  async runSASUsersLoginActivityETL(
    concurrency = 2,
    extraction_date = new Date().toISOString().slice(0, 10)
  ) {
    const data = {};
    if (concurrency) data.concurrency = concurrency;
    if (extraction_date) data.extraction_date = extraction_date;

    return await this.makeRequest(
      "POST",
      "/api/sas_users_login_hourly_etl/run",
      data
    );
  }

  // Get SAS Users Login Activity ETL Logs
  async getSASUsersLoginActivityETLLogs(limit = 50, offset = 0) {
    const params = { limit, offset };

    return await this.makeRequest(
      "GET",
      "/api/sas_users_login_hourly_etl/login_hourly",
      null,
      params
    );
  }

  async runSPETL(concurrency = 2) {
    const data = {};
    if (concurrency) data.concurrency = concurrency;

    return await this.makeRequest("POST", "/api/sp_etl/run", data);
  }

  async exportSPETLData(batch_size = 100, table_name = null, offset = 0) {
    const data = {};
    if (batch_size) data.batch_size = batch_size;
    if (table_name) data.table_name = table_name;
    if (offset) data.offset = offset;

    return await this.makeRequest(
      "POST",
      "/api/sp_etl/export_incremental",
      data
    );
  }

  async runTPETL(concurrency = 2, retryAttempts = null) {
    const data = {};
    if (concurrency) data.concurrency = concurrency;

    const attempts = retryAttempts || this.retryAttempts;
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        logger.info(`TP ETL attempt ${attempt}/${attempts}`, {
          timeout: this.timeout,
          concurrency: concurrency,
        });
        return await this.makeRequest("POST", "/api/tp_etl/run", data);
      } catch (error) {
        lastError = error;
        logger.warn(`TP ETL attempt ${attempt} failed: ${error.message}`);

        if (attempt < attempts) {
          const waitTime = attempt * 30000; // Wait 30s, 60s, 90s between retries
          logger.info(`Waiting ${waitTime / 1000}s before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError;
  }

  async exportTPETLData(
    page = 1,
    per_page = 100,
    table_name = null,
    order_by = "id",
    order_direction = "desc"
  ) {
    const params = {
      page,
      per_page,
      table_name,
      order_by,
      order_direction,
    };
    return await this.makeRequest("GET", "/api/tp_etl/export", null, params);
  }

  async runUDLETL(concurrency = 2) {
    const data = {};
    if (concurrency) data.concurrency = concurrency;

    return await this.makeRequest("POST", "/api/udl_etl/run", data);
  }

  async exportUDLETLData(page = 1, limit = 100) {
    const params = {
      page,
      limit,
    };

    return await this.makeRequest("GET", "/api/udl_etl/export", null, params);
  }
}

module.exports = new CeloeApiGatewayService();
