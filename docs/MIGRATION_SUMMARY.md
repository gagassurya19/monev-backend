# Migration Summary: Celoe-logs to Monev Backend

## Overview

Project ini telah berhasil di-rebrand dari `celoe-logs` ke `monev` (Monitoring dan Evaluasi) dengan database MySQL yang standalone dan terpisah dari project lain.

## 🔄 Changes Made

### 1. Database Configuration
- ✅ **New Database Config**: `config/database.js` - Konfigurasi database yang terpisah per environment
- ✅ **Updated Main Config**: `config/index.js` - Menggunakan konfigurasi database baru
- ✅ **Database Connection**: `src/database/connection.js` - Updated untuk menggunakan konfigurasi baru

### 2. Database Setup Scripts
- ✅ **Setup Database**: `scripts/setup_database.sql` - Script untuk membuat database dan user
- ✅ **Create Tables**: `scripts/create_monev_tables.sql` - Script untuk membuat semua tabel
- ✅ **Automated Setup**: `scripts/setup_database.sh` - Script bash untuk setup otomatis
- ✅ **Backup Script**: `scripts/backup_database.sh` - Script untuk backup database
- ✅ **Migration Script**: `scripts/migrate_data.sql` - Script untuk migrasi data (opsional)
- ✅ **Test Connection**: `scripts/test_connection.js` - Script untuk test koneksi database

### 3. Environment Configuration
- ✅ **Environment Template**: `.env.example` - Template konfigurasi environment
- ✅ **Environment File**: `.env` - File konfigurasi environment (dibuat dari template)
- ✅ **Updated .gitignore**: Menambahkan direktori backups dan file-file yang perlu diignore

### 4. Package.json Updates
- ✅ **New Scripts**: Menambahkan script untuk database management
  - `npm run setup:db` - Setup database otomatis
  - `npm run db:create` - Create database manual
  - `npm run db:tables` - Create tables manual
  - `npm run db:backup` - Backup database
  - `npm run db:migrate` - Migrate data
  - `npm run db:test` - Test database connection

### 5. Documentation
- ✅ **README.md**: Dokumentasi lengkap project monev
- ✅ **Database Setup Guide**: `docs/DATABASE_SETUP.md` - Panduan setup database
- ✅ **Migration Summary**: `MIGRATION_SUMMARY.md` - Dokumen ini

### 6. Project Structure
- ✅ **Directories Created**:
  - `docs/` - Dokumentasi
  - `backups/` - Database backups
  - `scripts/` - Database scripts (sudah ada, diperluas)

## 🗄️ Database Schema

### New Database Configuration
- **Database Name**: `monev_db`
- **Test Database**: `monev_test_db`
- **User**: `monev_user`
- **Password**: `monev_password`
- **Host**: `localhost`
- **Port**: `3306`
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

### Tables Created
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

## 🚀 Quick Start Guide

### 1. Setup Environment
```bash
# Copy environment file (sudah dilakukan)
cp .env.example .env

# Edit .env file sesuai konfigurasi MySQL Anda
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=monev_db
# DB_USER=monev_user
# DB_PASSWORD=monev_password
```

### 2. Setup Database
```bash
# Automated setup (recommended)
npm run setup:db

# Atau manual setup
npm run db:create
npm run db:tables
```

### 3. Test Database Connection
```bash
npm run db:test
```

### 4. Start Application
```bash
npm run dev
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm test` | Run tests |
| `npm run setup:db` | Setup database otomatis |
| `npm run db:create` | Create database manual |
| `npm run db:tables` | Create tables manual |
| `npm run db:backup` | Backup database |
| `npm run db:migrate` | Migrate data |
| `npm run db:test` | Test database connection |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |

## 🔒 Security Features

- ✅ **JWT-based authentication**
- ✅ **Password hashing dengan bcrypt**
- ✅ **Helmet.js untuk security headers**
- ✅ **Input validation dengan Joi**
- ✅ **SQL injection protection**
- ✅ **CORS configuration**
- ✅ **Environment-based configuration**

## 📊 Monitoring Features

- ✅ **Winston logging system**
- ✅ **API request monitoring**
- ✅ **Database connection monitoring**
- ✅ **Error tracking**
- ✅ **System logs table**
- ✅ **API requests table**

## 🔄 Migration from Old Database

Jika Anda ingin memindahkan data dari database lama:

1. **Edit migration script**: `scripts/migrate_data.sql`
2. **Uncomment dan sesuaikan** query migrasi
3. **Run migration**: `npm run db:migrate`

## 📝 Next Steps

1. **Test database connection**: `npm run db:test`
2. **Start application**: `npm run dev`
3. **Check API documentation**: `http://localhost:3001/api/v1/documentation`
4. **Monitor logs** untuk error atau warning
5. **Setup monitoring** untuk production

## 🆘 Troubleshooting

### Common Issues

1. **Access denied for user 'monev_user'@'localhost'**
   - Pastikan user sudah dibuat dengan benar
   - Periksa password yang digunakan
   - Pastikan privileges sudah diberikan

2. **Can't connect to MySQL server**
   - Periksa apakah MySQL server berjalan
   - Periksa host dan port configuration
   - Periksa firewall settings

3. **Database doesn't exist**
   - Jalankan script setup database
   - Periksa nama database di .env file

### Debug Commands

```bash
# Test MySQL connection
mysql -u root -p -e "SELECT VERSION();"

# Check user privileges
mysql -u root -p -e "SHOW GRANTS FOR 'monev_user'@'localhost';"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'monev%';"

# Test application connection
npm run db:test
```

## ✅ Migration Complete

Project telah berhasil di-rebrand dari `celoe-logs` ke `monev` dengan database MySQL yang standalone. Semua fitur utama tetap berfungsi dengan konfigurasi database yang baru dan terpisah dari project lain.

**Status**: ✅ **COMPLETED**
**Database**: ✅ **STANDALONE**
**Rebranding**: ✅ **COMPLETED** 