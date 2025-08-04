# Monev Backend

Sistem monitoring dan evaluasi (Monev) backend yang dibangun dengan Node.js, Hapi.js, dan MySQL.

## 🚀 Fitur

- **Authentication & Authorization**: JWT-based authentication dengan role-based access control
- **Database Management**: MySQL database dengan connection pooling
- **API Documentation**: Swagger/OpenAPI documentation
- **Logging**: Winston-based logging system
- **Security**: Helmet.js untuk security headers
- **CORS**: Cross-origin resource sharing support
- **ETL Processing**: Data extraction, transformation, and loading
- **Student Activity Monitoring**: Monitoring aktivitas mahasiswa
- **Course Performance**: Analisis performa kursus

## 📋 Prerequisites

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm atau yarn

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd monev-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env file dengan konfigurasi database Anda
```

### 4. Setup Database

#### Option A: Menggunakan Script Otomatis
```bash
npm run setup:db
```

#### Option B: Manual Setup
```bash
# Login ke MySQL sebagai root
mysql -u root -p

# Jalankan script setup database
source scripts/setup_database.sql;

# Buat tabel-tabel
mysql -u monev_user -pmonev_password monev_db < scripts/create_monev_tables.sql
```

### 5. Start Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🗄️ Database Schema

### Tables
1. **users** - User authentication dan authorization
2. **raw_log** - Raw log data dari sistem (updated schema)
3. **course_activity_summary** - Ringkasan aktivitas kursus (updated schema)
4. **student_profile** - Profil mahasiswa (updated schema)
5. **student_quiz_detail** - Detail quiz mahasiswa (updated schema)
6. **student_assignment_detail** - Detail assignment mahasiswa (updated schema)
7. **student_resource_access** - Akses resource mahasiswa (updated schema)
8. **course_summary** - Ringkasan kursus (updated schema)
9. **log_scheduler** - Tracking ETL runs (new)
10. **etl_status** - Additional ETL tracking (new)
11. **etl_chart_categories** - Categories for ETL Chart (new)
12. **etl_chart_subjects** - Subjects for ETL Chart (new)
13. **etl_chart_logs** - Logs for ETL Chart (new)
14. **system_logs** - Log sistem aplikasi
15. **api_requests** - Monitoring API requests

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `HOST` | Server host | 0.0.0.0 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | monev_db |
| `DB_USER` | Database user | monev_user |
| `DB_PASSWORD` | Database password | monev_password |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 24h |

## 📚 API Documentation

Setelah aplikasi berjalan, dokumentasi API tersedia di:
- Swagger UI: `http://localhost:3001/api/v1/documentation`
- JSON: `http://localhost:3001/api/v1/documentation.json`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm test` | Run tests |
| `npm run setup:db` | Setup database otomatis |
| `npm run db:create` | Create database manual |
| `npm run db:tables` | Create tables manual |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |

## 🔒 Security

- JWT-based authentication
- Password hashing dengan bcrypt
- Helmet.js untuk security headers
- Input validation dengan Joi
- SQL injection protection
- CORS configuration

## 📊 Monitoring

- Winston logging system
- API request monitoring
- Database connection monitoring
- Error tracking

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

Untuk bantuan dan dukungan, silakan buat issue di repository ini. 