/**
 * Global Response Service for API
 * Provides standardized response formatting for all API endpoints
 */

class ResponseService {
  /**
   * Success Response
   * @param {Object|Array} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted success response
   */
  static success(
    data = null,
    message = "Success",
    statusCode = 200,
    metadata = {}
  ) {
    const response = {
      success: true,
      status: statusCode,
      message: message,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    if (data !== null) {
      response.data = data;
    }

    return response;
  }

  /**
   * Error Response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {string} errorCode - Custom error code
   * @param {Object} details - Additional error details
   * @returns {Object} Formatted error response
   */
  static error(
    message = "Internal Server Error",
    statusCode = 500,
    errorCode = null,
    details = {}
  ) {
    const response = {
      success: false,
      status: statusCode,
      message: message,
      timestamp: new Date().toISOString(),
      ...details,
    };

    if (errorCode) {
      response.error_code = errorCode;
    }

    return response;
  }

  /**
   * Pagination Response
   * @param {Array} data - Array of data items
   * @param {Object} pagination - Pagination information
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @returns {Object} Formatted pagination response
   */
  static pagination(
    data = [],
    pagination = {},
    message = "Data retrieved successfully",
    statusCode = 200
  ) {
    return {
      success: true,
      status: statusCode,
      message: message,
      timestamp: new Date().toISOString(),
      data: data,
      pagination: {
        current_page: pagination.current_page || 1,
        total_pages: pagination.total_pages || 1,
        total_records: pagination.total_records || 0,
        limit: pagination.limit || 10,
        has_next_page: pagination.has_next_page || false,
        has_prev_page: pagination.has_prev_page || false,
        next_page: pagination.next_page || null,
        prev_page: pagination.prev_page || null,
      },
    };
  }

  /**
   * List Response (for simple array data)
   * @param {Array} data - Array of data items
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted list response
   */
  static list(
    data = [],
    message = "Data retrieved successfully",
    statusCode = 200,
    metadata = {}
  ) {
    return {
      success: true,
      status: statusCode,
      message: message,
      timestamp: new Date().toISOString(),
      data: data,
      total_records: data.length,
      ...metadata,
    };
  }

  /**
   * Single Item Response
   * @param {Object} item - Single data item
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted single item response
   */
  static item(
    item = null,
    message = "Item retrieved successfully",
    statusCode = 200,
    metadata = {}
  ) {
    return {
      success: true,
      status: statusCode,
      message: message,
      timestamp: new Date().toISOString(),
      data: item,
      ...metadata,
    };
  }

  /**
   * Created Response (for POST requests)
   * @param {Object|Array} data - Created data
   * @param {string} message - Success message
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted created response
   */
  static created(
    data = null,
    message = "Resource created successfully",
    metadata = {}
  ) {
    return this.success(data, message, 201, metadata);
  }

  /**
   * Updated Response (for PUT/PATCH requests)
   * @param {Object|Array} data - Updated data
   * @param {string} message - Success message
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted updated response
   */
  static updated(
    data = null,
    message = "Resource updated successfully",
    metadata = {}
  ) {
    return this.success(data, message, 200, metadata);
  }

  /**
   * Deleted Response (for DELETE requests)
   * @param {string} message - Success message
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted deleted response
   */
  static deleted(message = "Resource deleted successfully", metadata = {}) {
    return this.success(null, message, 200, metadata);
  }

  /**
   * Validation Error Response
   * @param {Array|Object} errors - Validation errors
   * @param {string} message - Error message
   * @returns {Object} Formatted validation error response
   */
  static validationError(errors = [], message = "Validation failed") {
    return this.error(message, 400, "VALIDATION_ERROR", {
      errors: errors,
      error_type: "validation_error",
    });
  }

  /**
   * Not Found Response
   * @param {string} message - Error message
   * @param {string} resource - Resource name
   * @returns {Object} Formatted not found response
   */
  static notFound(message = "Resource not found", resource = null) {
    const details = {};
    if (resource) {
      details.resource = resource;
    }

    return this.error(message, 404, "NOT_FOUND", {
      ...details,
      error_type: "not_found",
    });
  }

  /**
   * Unauthorized Response
   * @param {string} message - Error message
   * @returns {Object} Formatted unauthorized response
   */
  static unauthorized(message = "Unauthorized access") {
    return this.error(message, 401, "UNAUTHORIZED", {
      error_type: "authentication_error",
    });
  }

  /**
   * Forbidden Response
   * @param {string} message - Error message
   * @returns {Object} Formatted forbidden response
   */
  static forbidden(message = "Access forbidden") {
    return this.error(message, 403, "FORBIDDEN", {
      error_type: "authorization_error",
    });
  }

  /**
   * Conflict Response (for duplicate resources)
   * @param {string} message - Error message
   * @param {Object} details - Conflict details
   * @returns {Object} Formatted conflict response
   */
  static conflict(message = "Resource conflict", details = {}) {
    return this.error(message, 409, "CONFLICT", {
      ...details,
      error_type: "conflict_error",
    });
  }

  /**
   * Too Many Requests Response
   * @param {string} message - Error message
   * @param {number} retryAfter - Retry after seconds
   * @returns {Object} Formatted rate limit response
   */
  static tooManyRequests(message = "Too many requests", retryAfter = null) {
    const details = {};
    if (retryAfter) {
      details.retry_after = retryAfter;
    }

    return this.error(message, 429, "RATE_LIMIT_EXCEEDED", {
      ...details,
      error_type: "rate_limit_error",
    });
  }

  /**
   * Internal Server Error Response
   * @param {string} message - Error message
   * @param {string} errorId - Error tracking ID
   * @returns {Object} Formatted internal server error response
   */
  static internalError(message = "Internal server error", errorId = null) {
    const details = {};
    if (errorId) {
      details.error_id = errorId;
    }

    return this.error(message, 500, "INTERNAL_ERROR", {
      ...details,
      error_type: "internal_error",
    });
  }

  /**
   * Service Unavailable Response
   * @param {string} message - Error message
   * @param {number} retryAfter - Retry after seconds
   * @returns {Object} Formatted service unavailable response
   */
  static serviceUnavailable(
    message = "Service temporarily unavailable",
    retryAfter = null
  ) {
    const details = {};
    if (retryAfter) {
      details.retry_after = retryAfter;
    }

    return this.error(message, 503, "SERVICE_UNAVAILABLE", {
      ...details,
      error_type: "service_error",
    });
  }

  /**
   * Custom Response with full control
   * @param {boolean} success - Success status
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {*} data - Response data
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Custom formatted response
   */
  static custom(success, statusCode, message, data = null, metadata = {}) {
    const response = {
      success: success,
      status: statusCode,
      message: message,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    if (data !== null) {
      response.data = data;
    }

    return response;
  }
}

module.exports = ResponseService;
