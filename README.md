# Celoe Logs Backend

A corporate-standard HAPI.js backend application with MySQL database for log management, built with clean architecture principles and designed for easy maintenance and understanding.

## Project Structure

```
celoe-logs-backend/
├── src/                          # Source code
│   ├── controllers/              # Route handlers
│   ├── database/                 # Database related files
│   ├── middlewares/              # Custom middlewares
│   ├── models/                   # Data access layer
│   ├── routes/                   # Route definitions
│   ├── services/                 # Business logic services
│   ├── utils/                    # Utility functions
│   ├── validators/               # Input validation schemas
│   └── server.js                 # Main server file
├── config/                       # Configuration files
├── scripts/                      # Utility scripts
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## Features

- Clean Architecture with separation of concerns
- Webhook token-based authentication
- MySQL with connection pooling (no ORM)
- Request/response validation using Joi
- Comprehensive logging with Winston
- Health monitoring endpoints
- Environment-based configuration
- Automated ETL process with cron scheduling (runs every hour)
- Manual ETL trigger endpoints

## Installation

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd celoe-logs-backend
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Create MySQL database with required tables (see Database Schema section below)

4. Start the server:
```bash
npm run dev  # Development
npm start    # Production
```

## Authentication

This API uses webhook token authentication. To access protected endpoints, include your webhook token in one of the following ways:

1. **Query Parameter** (recommended for webhooks):
   ```
   GET /api/v1/logs?token=your-webhook-token
   ```

2. **Authorization Header**:
   ```
   Authorization: Bearer your-webhook-token
```

## ETL Process

The application includes an automated ETL (Extract, Transform, Load) process that extracts data from the Moodle database and transforms it into analytical tables. The ETL process runs automatically every hour and can also be triggered manually.

### ETL Operations

The ETL process performs the following operations:

1. **raw_log** - Copies log data from `mdl_logstore_standard_log` to `moodle_logs.raw_log`
2. **course_activity_summary** - Aggregates course activity data including access counts and submissions
3. **student_profile** - Extracts student profile information with program study details
4. **student_quiz_detail** - Detailed quiz attempt data with timing and scoring
5. **student_assignment_detail** - Assignment submission details with timing and grades
6. **student_resource_access** - Resource access logs for tracking material usage
7. **course_summary** - High-level course statistics including activity and student counts

### Automatic Scheduling

- **Schedule**: Every hour at minute 0 (e.g., 01:00, 02:00, 03:00, etc.)
- **Timezone**: Asia/Jakarta (configurable in `src/services/cronService.js`)
- **Overlap Protection**: If ETL is already running, scheduled runs are skipped

### Manual Triggers

You can manually trigger the ETL process using the API endpoints with webhook authentication.

## API Endpoints

### Authentication
- GET /api/v1/auth/validate?token={webhook-token} - Validate webhook token
- POST /api/v1/auth/validate - Validate webhook token (POST body)
- GET /api/v1/auth/webhook - Get current webhook info (requires token)

### ETL (Extract, Transform, Load)
- POST /api/v1/etl/run?token={webhook-token} - Manually trigger ETL process
- GET /api/v1/etl/status?token={webhook-token} - Get ETL status and schedule info

### User Management
- GET /api/v1/users - Get all users
- GET /api/v1/users/{id} - Get user by ID
- PUT /api/v1/users/{id} - Update user
- DELETE /api/v1/users/{id} - Delete user

### Log Management
- POST /api/v1/logs - Create log entry
- GET /api/v1/logs - Get logs with filtering
- GET /api/v1/logs/search - Search logs
- GET /api/v1/logs/stats - Get statistics

### Health Check
- GET /health - Basic health check
- GET /health/detailed - Detailed health check

## Configuration

Edit .env file with your settings:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=celoe_logs
DB_USER=root
DB_PASSWORD=your_password
WEBHOOK_TOKENS=token1,token2,token3  # Comma-separated webhook tokens
JWT_SECRET=your-secret-key  # Kept for future use
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run lint` - Run code linting

## Database Schema

Create the following tables in your MySQL database:

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user', 'viewer') NOT NULL DEFAULT 'user',
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_active (isActive),
  INDEX idx_users_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Logs Table
```sql
CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level ENUM('error', 'warn', 'info', 'debug') NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(100) NOT NULL,
  userId INT NULL,
  metadata JSON NULL,
  tags JSON NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_logs_level (level),
  INDEX idx_logs_source (source),
  INDEX idx_logs_timestamp (timestamp),
  INDEX idx_logs_user (userId),
  INDEX idx_logs_created (createdAt),
  INDEX idx_logs_level_source (level, source),
  INDEX idx_logs_timestamp_level (timestamp, level),
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
``` 