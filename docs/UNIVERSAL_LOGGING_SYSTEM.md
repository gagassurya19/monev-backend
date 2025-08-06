# Universal Logging System

## Overview

Sistem logging universal telah dibuat untuk menggantikan tabel spesifik `monev_sas_fetch_categories_subject_logs` dengan tabel universal `monev_sas_logs` yang dapat digunakan untuk semua jenis ETL process.

## Perubahan Utama

### 1. Tabel Database Universal

**Tabel Lama:**
```sql
monev_sas_fetch_categories_subject_logs
```

**Tabel Baru:**
```sql
monev_sas_logs
```

**Struktur Tabel Universal:**
```sql
CREATE TABLE IF NOT EXISTS monev_sas_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_run ENUM('fetch_category_subject', 'fetch_course_performance', 'fetch_student_activity_summary') NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    duration VARCHAR(20),
    status VARCHAR(20),
    total_records INT,
    offset INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_type_run (type_run),
    INDEX idx_type_status (type_run, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. Service Universal

#### LogService (`src/services/logService.js`)
Service universal untuk mengelola log ETL:

```javascript
const { LogService } = require('../services')
const logService = new LogService()

// Create log entry
const logEntry = await logService.createLog('fetch_category_subject', {
  startDate: new Date(),
  status: 'running',
  totalRecords: 0
})

// Update log entry
await logService.updateLog(logId, {
  endDate: new Date(),
  status: 'finished',
  totalRecords: 1000
})

// Get logs by type
const logs = await logService.getLogsByType('fetch_category_subject', 10, 0)

// Check if ETL is running
const isRunning = await logService.isEtlRunning('fetch_category_subject')
```

#### RealtimeLogService (`src/services/realtimeLogService.js`)
Service universal untuk mengelola realtime logs:

```javascript
const { RealtimeLogService } = require('../services')
const realtimeLogService = new RealtimeLogService()

// Create realtime log
await realtimeLogService.createRealtimeLog(logId, 'info', 'Processing started')

// Create progress log
await realtimeLogService.createProgressLog(logId, 50, 100, '50% complete')

// Get realtime logs
const logs = await realtimeLogService.getRealtimeLogs(logId, 100, 0)
```

### 3. Controller Updates

Controller SAS ETL telah diperbarui untuk menggunakan service universal:

```javascript
// Before
const result = await sasEtlController.service.getEtlLogs(limitInt, offsetInt)

// After
const result = await sasEtlController.logService.getLogsByType('fetch_category_subject', limitInt, offsetInt)
```

### 4. Routes Updates

Routes telah diperbarui untuk menggunakan nama yang lebih spesifik:

```javascript
// Before
path: '/sas-etl/logs'
handler: sasEtlController.getSASSubjectCategoryLogs

// After
path: '/sas-etl/category-subject/logs'
handler: sasEtlController.getSASCategorySubjectLogs
```

## Keuntungan Sistem Universal

### 1. **Reusability**
- Service dapat digunakan ulang untuk ETL process lainnya
- Tidak perlu membuat service baru untuk setiap jenis ETL

### 2. **Consistency**
- Format log yang konsisten untuk semua ETL process
- Struktur database yang terstandarisasi

### 3. **Maintainability**
- Kode lebih mudah dipelihara
- Perubahan pada sistem logging hanya perlu dilakukan di satu tempat

### 4. **Scalability**
- Mudah menambahkan jenis ETL baru
- Performa query yang lebih baik dengan indexing

### 5. **Type Safety**
- Enum `type_run` memastikan konsistensi data
- Validasi otomatis untuk jenis ETL

## Cara Menambahkan ETL Process Baru

### 1. Update Enum di Database
```sql
ALTER TABLE monev_sas_logs 
MODIFY COLUMN type_run ENUM(
  'fetch_category_subject', 
  'fetch_course_performance', 
  'fetch_student_activity_summary',
  'new_etl_type'
) NOT NULL;
```

### 2. Buat Service ETL Baru
```javascript
// src/services/new-etl-service.js
const { LogService, RealtimeLogService } = require('./index')

class NewEtlService {
  constructor() {
    this.logService = new LogService()
    this.realtimeLogService = new RealtimeLogService()
  }

  async runEtlProcess() {
    const logId = await this.logService.createLog('new_etl_type', {
      status: 'running'
    })

    try {
      // ETL process logic
      await this.realtimeLogService.createInfoLog(logId, 'ETL started')
      
      // ... process logic ...
      
      await this.logService.updateLog(logId, {
        status: 'finished',
        totalRecords: 1000
      })
    } catch (error) {
      await this.logService.updateLog(logId, {
        status: 'failed'
      })
      throw error
    }
  }
}
```

### 3. Update Services Index
```javascript
// src/services/index.js
const NewEtlService = require('./new-etl-service')

module.exports = {
  // ... existing services
  NewEtlService,
  newEtlService: NewEtlService
}
```

## API Endpoints

### SAS ETL Category Subject
- `POST /api/v1/sas-etl/category-subject/run` - Trigger ETL process
- `GET /api/v1/sas-etl/category-subject/logs` - Get ETL logs
- `GET /api/v1/sas-etl/logs/{log_id}/realtime` - Stream realtime logs
- `GET /api/v1/sas-etl/logs/{log_id}` - Get realtime logs

## Database Migration

Script untuk membuat tabel universal:
```bash
mysql -u root -p < scripts/create_universal_logs_table.sql
```

## Testing

Test script untuk memverifikasi sistem:
```bash
node scripts/test_log_service.js
```

## Troubleshooting

### Common Issues

1. **MySQL2 Parameter Issues**
   - Gunakan string interpolation untuk LIMIT/OFFSET
   - Konversi parameter ke integer sebelum query

2. **Circular Dependency**
   - Import service langsung dari file, bukan dari index
   - Contoh: `const LogService = require('./logService')`

3. **Query Result Structure**
   - INSERT: `result.insertId`
   - SELECT: `[rows]` (destructuring)
   - COUNT: `result[0].total`

## Future Enhancements

1. **Log Retention Policy**
   - Implementasi auto-cleanup untuk log lama
   - Configurable retention period

2. **Advanced Filtering**
   - Filter berdasarkan status, date range
   - Search functionality

3. **Real-time Monitoring**
   - WebSocket untuk real-time updates
   - Dashboard untuk monitoring ETL processes

4. **Export Functionality**
   - Export logs ke CSV/JSON
   - Scheduled report generation 