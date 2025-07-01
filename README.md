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
- JWT-based authentication with refresh tokens
- MySQL with connection pooling (no ORM)
- Request/response validation using Joi
- Comprehensive logging with Winston
- Health monitoring endpoints
- Environment-based configuration

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

3. Create MySQL database and run migrations:
```bash
npm run db:migrate
```

4. Start the server:
```bash
npm run dev  # Development
npm start    # Production
```

## API Endpoints

### Authentication
- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - User login
- POST /api/v1/auth/refresh - Refresh access token
- GET /api/v1/auth/me - Get current user info

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
JWT_SECRET=your-secret-key
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run db:migrate` - Run database migrations
- `npm test` - Run tests
- `npm run lint` - Run code linting 