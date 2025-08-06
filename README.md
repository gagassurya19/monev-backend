# CeLOE Logs Backend

Backend service for CeLOE (Center for e-Learning and Open Education) monitoring system.

## Features

- **ETL Processing**: Extract, Transform, Load data from external APIs
- **Real-time Logging**: Monitor ETL processes with live streaming
- **Authentication**: JWT-based authentication
- **Database**: MySQL with optimized queries
- **API Documentation**: Swagger/OpenAPI documentation

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd celoe-logs-backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup database
```bash
mysql -u root -p < scripts/setup_database.sql
```

5. Start the server
```bash
npm start
```

## API Endpoints

### Health Check
```bash
GET /health
```

### SAS ETL Endpoints

#### 1. Run ETL Process
```bash
POST /api/v1/sas-etl/run
Authorization: Bearer <jwt-token>
```

#### 2. Get ETL Logs History
```bash
GET /api/v1/sas-etl/logs?limit=5&offset=0
Authorization: Bearer <jwt-token>
```

#### 3. Stream Realtime Logs (SSE)
```bash
GET /api/v1/sas-etl/logs/{log_id}/realtime
Authorization: Bearer <jwt-token>
Content-Type: text/event-stream
```

#### 4. Get Realtime Logs (REST)
```bash
GET /api/v1/sas-etl/logs/{log_id}/realtime-logs?limit=100&offset=0
Authorization: Bearer <jwt-token>
```

## Real-time Monitoring

### Web Interface

Access the real-time monitoring interface at:
```
http://localhost:3001/public/realtime-logs-test.html
```

### JavaScript Example

```javascript
// Connect to realtime logs stream
const eventSource = new EventSource('/api/v1/sas-etl/logs/123/realtime');

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    switch(data.type) {
        case 'connection':
            console.log('Connected to stream');
            break;
        case 'log':
            console.log(`[${data.level}] ${data.message}`);
            updateProgress(data.progress);
            break;
        case 'completion':
            console.log(`ETL completed with status: ${data.status}`);
            eventSource.close();
            break;
        case 'error':
            console.error(`Stream error: ${data.message}`);
            break;
    }
};

eventSource.onerror = function(event) {
    console.error('EventSource failed');
    eventSource.close();
};
```

### cURL Example

```bash
# Stream realtime logs
curl -N -H "Accept: text/event-stream" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/sas-etl/logs/123/realtime

# Get realtime logs (REST)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3001/api/v1/sas-etl/logs/123/realtime-logs?limit=50&offset=0"
```

## Database Schema

### ETL Logs
```sql
CREATE TABLE monev_sas_fetch_categories_subject_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATETIME,
    end_date DATETIME,
    duration VARCHAR(20),
    status VARCHAR(20),
    total_records INT,
    offset INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Realtime Logs
```sql
CREATE TABLE monev_sas_realtime_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    level ENUM('info', 'warning', 'error', 'debug') NOT NULL,
    message TEXT NOT NULL,
    progress DECIMAL(5,2) NULL,
    INDEX idx_log_id (log_id),
    INDEX idx_timestamp (timestamp)
);
```

## Configuration

### Environment Variables

```bash
# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=monev_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# API
API_PREFIX=/api/v1
CELOE_API_BASE_URL=https://celoe.telkomuniversity.ac.id/api/v1
CELOE_API_KEY=your_api_key

# ETL
ETL_BATCH_SIZE=1000
ETL_TIMEOUT=1800000
ETL_RETRY_ATTEMPTS=3
```

## Development

### Scripts

```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

### Project Structure

```
src/
├── controllers/          # Request handlers
├── database/            # Database connection
├── middlewares/         # Custom middlewares
├── models/              # Data models
├── routes/              # API routes
├── services/            # Business logic
├── utils/               # Utility functions
├── validators/          # Request validation
└── server.js           # Main server file

public/                  # Static files
├── realtime-logs-test.html

docs/                   # Documentation
├── REALTIME_LOGS_API.md
└── ...

scripts/                # Database scripts
├── setup_database.sql
└── ...
```

## Monitoring

### Log Files

- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Access logs: `logs/access.log`

### Health Checks

```bash
# Basic health check
curl http://localhost:3001/health

# Detailed health check
curl http://localhost:3001/health/detailed
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **JWT Authentication Failed**
   - Check JWT_SECRET is set
   - Verify token format and expiration

3. **ETL Process Fails**
   - Check external API connectivity
   - Verify API credentials
   - Check database constraints

4. **Streaming Connection Drops**
   - Check network stability
   - Verify server load
   - Check client-side EventSource implementation

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

## API Documentation

For detailed API documentation, visit:
```
http://localhost:3001/documentation
```

## License

This project is licensed under the MIT License. 