# CELOE API Proxy Service

This document describes the CELOE API Proxy service that acts as a gateway to the external CELOE API for ETL operations.

## Overview

The CELOE API Proxy service provides a unified interface to interact with the external CELOE API endpoints. It acts as a proxy, forwarding requests to the external API and returning the responses.

## Configuration

The service uses the following configuration from `config/index.js`:

```javascript
celoeapi: {
  baseUrl: process.env.CELOE_API_MOODLE_BASE_URL || 'http://localhost:8081'
}
```

## Available Endpoints

All endpoints are prefixed with `/api/v1/celoe/etl/` and require JWT authentication.

### 1. Get ETL Status
- **Method**: `GET`
- **Endpoint**: `/api/v1/celoe/etl/status`
- **Description**: Get the current ETL status from the external API
- **Response**: Returns the ETL status including last run, next run, and running state

### 2. Get ETL Logs
- **Method**: `GET`
- **Endpoint**: `/api/v1/celoe/etl/logs`
- **Query Parameters**:
  - `limit` (optional): Number of logs to return (default: 10, max: 100)
  - `offset` (optional): Number of logs to skip (default: 0)
- **Description**: Get ETL logs with pagination from the external API
- **Response**: Returns paginated ETL logs with metadata

### 3. Run ETL Process
- **Method**: `POST`
- **Endpoint**: `/api/v1/celoe/etl/run`
- **Description**: Trigger a full ETL process on the external API
- **Response**: Returns confirmation that the ETL process has started

### 4. Run Incremental ETL
- **Method**: `POST`
- **Endpoint**: `/api/v1/celoe/etl/run-incremental`
- **Description**: Trigger an incremental ETL process on the external API
- **Response**: Returns confirmation that the incremental ETL process has started

### 5. Clear Stuck ETL Processes
- **Method**: `POST`
- **Endpoint**: `/api/v1/celoe/etl/clear-stuck`
- **Description**: Clear stuck ETL processes on the external API
- **Response**: Returns information about cleared processes

### 6. Force Clear All Inprogress ETL
- **Method**: `POST`
- **Endpoint**: `/api/v1/celoe/etl/force-clear`
- **Description**: Force clear all inprogress ETL processes on the external API
- **Response**: Returns information about force cleared processes

### 7. Get Debug ETL Status
- **Method**: `GET`
- **Endpoint**: `/api/v1/celoe/etl/debug`
- **Description**: Get detailed debug information about ETL processes
- **Response**: Returns debug data including all processes and running count

## Usage Examples

### Using the Service Directly

```javascript
const { CeloeApiGatewayService } = require('../services')

// Get ETL status
const status = await CeloeApiGatewayService.getETLStatus()
console.log('ETL Status:', status)

// Get ETL logs
const logs = await CeloeApiGatewayService.getETLLogs(5, 0)
console.log('ETL Logs:', logs)

// Run ETL process
const result = await CeloeApiGatewayService.runETL()
console.log('ETL Result:', result)
```

### Using the REST API

```bash
# Get ETL status
curl -X GET "http://localhost:3001/api/v1/celoe/etl/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get ETL logs
curl -X GET "http://localhost:3001/api/v1/celoe/etl/logs?limit=5&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Run ETL process
curl -X POST "http://localhost:3001/api/v1/celoe/etl/run" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Run incremental ETL
curl -X POST "http://localhost:3001/api/v1/celoe/etl/run-incremental" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

The service includes comprehensive error handling:

- **Network Errors**: Handles connection timeouts and network issues
- **API Errors**: Properly formats error responses from the external API
- **Authentication Errors**: Validates JWT tokens before making requests
- **Validation Errors**: Validates query parameters and request bodies

## Testing

Use the provided test script to verify the proxy functionality:

```bash
npm run test:celoe-api
```

This will test all endpoints and provide detailed output for each request.

## Architecture

```
Client Request → CELOE API Proxy → External CELOE API → Response
```

The proxy service:
1. Validates the incoming request
2. Forwards the request to the external API
3. Logs the request and response
4. Returns the response to the client
5. Handles errors gracefully

## Security

- All endpoints require JWT authentication
- Requests are logged for audit purposes
- Error messages are sanitized to prevent information leakage
- Timeout protection prevents hanging requests

## Monitoring

The service includes comprehensive logging:
- Request/response logging
- Error logging with stack traces
- Performance metrics
- External API health monitoring 