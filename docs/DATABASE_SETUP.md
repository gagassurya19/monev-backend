# Database Setup Guide - Monev Backend

## Overview

Dokumen ini menjelaskan cara setup database MySQL untuk project Monev Backend. Database ini dibuat standalone dan terpisah dari project lain.

## Prerequisites

- MySQL Server >= 8.0
- MySQL Client
- Access sebagai MySQL root user

## Database Configuration

### Default Configuration
- **Database Name**: `monev_db`
- **Test Database**: `monev_test_db`
- **User**: `monev_user`
- **Password**: `monev_password`
- **Host**: `localhost`
- **Port**: `3306`
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

## Setup Methods

### Method 1: Automated Setup (Recommended)

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file** (sesuaikan dengan konfigurasi MySQL Anda):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=monev_db
   DB_USER=monev_user
   DB_PASSWORD=monev_password
   ```

3. **Run automated setup**:
   ```bash
   npm run setup:db
   ```

### Method 2: Manual Setup

1. **Login ke MySQL sebagai root**:
   ```bash
   mysql -u root -p
   ```

2. **Jalankan script setup database**:
   ```sql
   source scripts/setup_database.sql;
   ```

3. **Buat tabel-tabel**:
   ```bash
   mysql -u monev_user -pmonev_password monev_db < scripts/create_monev_tables.sql
   ```

### Method 3: Step by Step Manual

1. **Create database**:
   ```sql
   CREATE DATABASE monev_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE monev_test_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Create user**:
   ```sql
   CREATE USER 'monev_user'@'localhost' IDENTIFIED BY 'monev_password';
   CREATE USER 'monev_user'@'%' IDENTIFIED BY 'monev_password';
   ```

3. **Grant privileges**:
   ```sql
   GRANT ALL PRIVILEGES ON monev_db.* TO 'monev_user'@'localhost';
   GRANT ALL PRIVILEGES ON monev_db.* TO 'monev_user'@'%';
   GRANT ALL PRIVILEGES ON monev_test_db.* TO 'monev_user'@'localhost';
   GRANT ALL PRIVILEGES ON monev_test_db.* TO 'monev_user'@'%';
   FLUSH PRIVILEGES;
   ```

4. **Create tables**:
   ```bash
   mysql -u monev_user -pmonev_password monev_db < scripts/create_monev_tables.sql
   ```

## Database Schema

### Tables Overview

| Table | Description | Records |
|-------|-------------|---------|
| `users` | User authentication | - |
| `raw_log` | Raw log data (updated schema) | - |
| `course_activity_summary` | Course activity summary (updated schema) | - |
| `student_profile` | Student profiles (updated schema) | - |
| `student_quiz_detail` | Quiz details (updated schema) | - |
| `student_assignment_detail` | Assignment details (updated schema) | - |
| `student_resource_access` | Resource access logs (updated schema) | - |
| `course_summary` | Course summaries (updated schema) | - |
| `log_scheduler` | Tracking ETL runs (new) | - |
| `etl_status` | Additional ETL tracking (new) | - |
| `etl_chart_categories` | Categories for ETL Chart (new) | - |
| `etl_chart_subjects` | Subjects for ETL Chart (new) | - |
| `etl_chart_logs` | Logs for ETL Chart (new) | - |
| `system_logs` | Application logs | - |
| `api_requests` | API request logs | - |

### Table Details

#### users
- Primary key: `id`
- Unique constraints: `username`, `email`
- Indexes: `username`, `email`, `role`

#### raw_log
- Primary key: `id`
- Indexes: `eventname`, `component`, `action`, `userid`, `courseid`, `timecreated`

#### course_activity_summary
- Primary key: `id`
- Indexes: `course_id`, `activity_type`, `section`

#### student_profile
- Primary key: `id`
- Unique constraint: `user_id`
- Indexes: `idnumber`, `email`, `program_studi`

#### student_quiz_detail
- Primary key: `id`
- Indexes: `quiz_id`, `user_id`, `nim`, `waktu_mulai`

#### student_assignment_detail
- Primary key: `id`
- Indexes: `assignment_id`, `user_id`, `nim`, `waktu_submit`

#### student_resource_access
- Primary key: `id`
- Indexes: `resource_id`, `user_id`, `nim`, `waktu_akses`

#### course_summary
- Primary key: `id`
- Unique constraint: `course_id`
- Indexes: `course_id`, `kelas`

#### system_logs
- Primary key: `id`
- Indexes: `level`, `timestamp`, `user_id`

#### api_requests
- Primary key: `id`
- Indexes: `method`, `path`, `status_code`, `created_at`, `user_id`

## Verification

### Check Database Connection
```bash
mysql -u monev_user -pmonev_password monev_db -e "SELECT 'Connection successful' as status;"
```

### Check Tables
```bash
mysql -u monev_user -pmonev_password monev_db -e "SHOW TABLES;"
```

### Check Table Structure
```bash
mysql -u monev_user -pmonev_password monev_db -e "DESCRIBE users;"
```

## Backup and Restore

### Backup Database
```bash
npm run db:backup
```

### Restore Database
```bash
# Restore from backup file
mysql -u monev_user -pmonev_password monev_db < backups/monev_db_backup_YYYYMMDD_HHMMSS.sql
```

## Migration

### Migrate Data from Old Database
```bash
npm run db:migrate
```

**Note**: Edit `scripts/migrate_data.sql` sesuai dengan struktur database lama Anda.

## Troubleshooting

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

4. **Tables don't exist**
   - Jalankan script create tables
   - Periksa apakah script berhasil dijalankan

### Debug Commands

```bash
# Test MySQL connection
mysql -u root -p -e "SELECT VERSION();"

# Check user privileges
mysql -u root -p -e "SHOW GRANTS FOR 'monev_user'@'localhost';"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'monev%';"

# Check table structure
mysql -u monev_user -pmonev_password monev_db -e "SHOW TABLES;"
```

## Security Considerations

1. **Change default passwords** setelah setup
2. **Use strong passwords** untuk production
3. **Limit user privileges** sesuai kebutuhan
4. **Enable SSL** untuk production
5. **Regular backups** database
6. **Monitor access logs**

## Performance Optimization

1. **Index optimization** untuk query yang sering digunakan
2. **Connection pooling** sudah dikonfigurasi
3. **Query optimization** untuk ETL processes
4. **Regular maintenance** (ANALYZE TABLE, OPTIMIZE TABLE)

## Environment Variables

Pastikan environment variables berikut sudah dikonfigurasi dengan benar:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=monev_db
DB_USER=monev_user
DB_PASSWORD=monev_password
```

## Next Steps

Setelah database setup selesai:

1. **Test connection** dari aplikasi
2. **Run application** dengan `npm run dev`
3. **Check API endpoints** di `http://localhost:3001/api/v1/documentation`
4. **Monitor logs** untuk error atau warning
5. **Setup monitoring** untuk production 