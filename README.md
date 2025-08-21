# Monev Backend

Layanan backend Node.js yang robust dibangun dengan framework Hapi.js untuk mengelola sistem monitoring dan evaluasi (Monev), proses ETL, dan integrasi API.

## 🚀 Ikhtisar Proyek

Layanan backend ini menyediakan solusi komprehensif untuk:
- **Manajemen Log**: Sistem logging terpusat untuk aktivitas monitoring dan evaluasi
- **Proses ETL**: Ekstraksi, transformasi, dan loading data untuk performa kursus dan aktivitas siswa
- **Gateway API**: Layanan proxy dan integrasi untuk endpoint API eksternal
- **Autentikasi**: Sistem autentikasi berbasis JWT
- **Monitoring Real-time**: Cron job dan tugas terjadwal untuk sinkronisasi data

## 🏗️ Arsitektur

```
src/
├── controllers/          # Penanganan request dan logika bisnis
├── services/            # Logika bisnis dan integrasi API eksternal
├── models/              # Model data dan skema database
├── routes/              # Definisi endpoint API
├── middlewares/         # Autentikasi dan pemrosesan request
├── database/            # Koneksi dan konfigurasi database
├── utils/               # Fungsi pembantu dan utilitas
├── validators/          # Skema validasi request
└── server.js            # Titik masuk utama aplikasi
```

## 📁 Struktur Proyek

```
monev-backend/
├── config/              # File konfigurasi
│   ├── database.js      # Konfigurasi database
│   ├── index.js         # Konfigurasi utama
│   └── swagger.js       # Konfigurasi dokumentasi Swagger
├── scripts/             # Script database dan utilitas
│   ├── setup_database.sh    # Script setup database
│   ├── backup_database.sh   # Script backup database
│   ├── migrate_tables.sh    # Script migration tabel
│   ├── migration_tables.sql # Struktur tabel lengkap (19 tabel)
│   └── quick-setup.sh      # Script setup otomatis
├── src/                 # Kode sumber
│   ├── constants/       # Konstanta aplikasi
│   ├── controllers/     # Controller request
│   ├── database/        # Koneksi database
│   ├── middlewares/     # Middleware kustom
│   ├── models/          # Model data
│   ├── routes/          # Rute API
│   ├── services/        # Layanan logika bisnis
│   ├── utils/           # Fungsi utilitas
│   ├── validators/      # Validasi request
│   └── server.js        # File server utama
├── .env.example         # Template variabel lingkungan lengkap
├── jest.config.js       # Konfigurasi testing Jest
├── package.json         # Dependensi dan script
└── README.md            # File ini
```

## 🛠️ Teknologi yang Digunakan

- **Runtime**: Node.js (>=16.0.0)
- **Framework**: Hapi.js 21.4.0
- **Database**: MySQL 8.0+
- **Autentikasi**: JWT dengan bcrypt
- **Validasi**: Validasi skema Joi
- **Dokumentasi**: Swagger/OpenAPI
- **Logging**: Logger Winston
- **Testing**: Jest, Supertest
- **Development**: Nodemon, ESLint
- **HTTP Client**: Axios
- **Scheduling**: Node-cron
- **Security**: Helmet, CORS

## 📋 Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda memiliki:

- **Node.js** (>=16.0.0)
- **MySQL** (>=8.0)
- **npm** atau **yarn** package manager
- **Git** untuk kontrol versi

## 🔧 Instalasi & Setup

### Opsi 1: Setup Cepat (Direkomendasikan)

Untuk memulai dengan cepat, gunakan script setup otomatis kami:

```bash
git clone <repository-url>
cd monev-backend
npm run quick-setup
```

Script ini akan:
- Memeriksa prasyarat (Node.js, MySQL)
- Menginstal dependensi
- Membuat konfigurasi lingkungan
- Setup database
- Memulai server development

### Opsi 2: Setup Manual

#### 1. Clone Repository

```bash
git clone <repository-url>
cd monev-backend
```

#### 2. Instal Dependensi

```bash
npm install
```

#### 3. Konfigurasi Lingkungan

Buat file `.env` di direktori root:

```bash
cp .env.example .env
```

Konfigurasi variabel lingkungan berikut:

```env
# ========================================
# Konfigurasi Server
# ========================================
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ========================================
# Konfigurasi Database
# ========================================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=monev_db
DB_USER=monev_user
DB_PASSWORD=password_aman_anda

# ========================================
# Konfigurasi JWT
# ========================================
JWT_SECRET=kunci_rahasia_jwt_anda_buat_panjang_dan_acak
JWT_EXPIRES_IN=24h

# ========================================
# Konfigurasi Logging
# ========================================
LOG_LEVEL=info
LOG_FILE=logs/app.log

# ========================================
# Konfigurasi Keamanan
# ========================================
BCRYPT_SALT_ROUNDS=10

# ========================================
# Konfigurasi API
# ========================================
API_PREFIX=/api/v1

# ========================================
# Konfigurasi API Eksternal
# ========================================
EXTERNAL_API_MOODLE_BASE_URL=http://localhost:8081
EXTERNAL_API_PREFIX=/api
EXTERNAL_API_ENDPOINT_CATEGORIES=/course/category
EXTERNAL_API_ENDPOINT_SUBJECTS=/course/subject

# ========================================
# Konfigurasi ETL
# ========================================
ETL_BATCH_SIZE=1000
ETL_TIMEOUT=1800000
ETL_RETRY_ATTEMPTS=3
```

#### 4. Setup Database

##### Opsi 1: Menggunakan Script Setup (Direkomendasikan)

```bash
# Buat script dapat dieksekusi
chmod +x scripts/setup_database.sh

# Jalankan script setup
npm run setup:db
```

##### Opsi 2: Setup Manual

```sql
-- Hubungkan ke MySQL sebagai root
mysql -u root -p

-- Buat database
CREATE DATABASE monev_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user
CREATE USER 'monev_user'@'localhost' IDENTIFIED BY 'password_aman_anda';
CREATE USER 'monev_user'@'%' IDENTIFIED BY 'password_aman_anda';

-- Berikan hak istimewa
GRANT ALL PRIVILEGES ON monev_db.* TO 'monev_user'@'localhost';
GRANT ALL PRIVILEGES ON monev_db.* TO 'monev_user'@'%';

FLUSH PRIVILEGES;
```

#### 5. Mulai Aplikasi

##### Mode Development
```bash
npm run dev
```

##### Mode Production
```bash
npm start
```

Server akan mulai di `http://localhost:3001` (atau port yang ditentukan di file `.env` Anda).

### 🔄 Migration Tabel (Otomatis)

Script migration sudah tersedia dengan struktur tabel yang lengkap untuk Monev Backend. File `scripts/migration_tables.sql` berisi 19 tabel yang sudah dioptimasi:

#### Tabel yang Tersedia:
- **Course Performance (CP)**: 7 tabel untuk monitoring performa kursus
- **Student Activity Summary (SAS)**: 8 tabel untuk aktivitas siswa
- **System**: 4 tabel untuk sistem dan user management

#### Langkah 1: Setup Database Baru
```bash
# Setup database baru
npm run setup:db
```

#### Langkah 2: Migrate Tabel
```bash
# Migrate semua tabel yang diperlukan
npm run migrate:tables
```

#### Atau Langsung dengan Quick Setup
```bash
# Quick setup akan otomatis migrate tabel jika ada file migration
npm run quick-setup
```

**Catatan**: Migration akan membuat semua tabel dengan struktur yang sudah dioptimasi, termasuk index dan foreign key yang tepat.

#### Variabel Environment Tambahan (Opsional)
File `.env.example` juga menyediakan konfigurasi opsional untuk:
- **Redis**: Caching dan session storage
- **Email**: SMTP untuk notifikasi
- **API Eksternal**: Konfigurasi tambahan untuk layanan eksternal

Lihat file `.env.example` untuk konfigurasi lengkap.

## 📚 Dokumentasi API

Setelah server berjalan, Anda dapat mengakses dokumentasi API interaktif di:

```
http://localhost:3001/documentation
```

## 🔐 Autentikasi

API menggunakan autentikasi berbasis JWT. Untuk mengakses endpoint yang dilindungi:

1. **Login** untuk mendapatkan token JWT
2. **Sertakan** token di header `Authorization`:
   ```
   Authorization: Bearer <token_jwt_anda>
   ```

## 🚀 Script yang Tersedia

```bash
# Mulai Cepat
npm run quick-setup      # Setup otomatis dan mulai (direkomendasikan)

# Development
npm run dev              # Mulai dengan nodemon (restart otomatis)
npm start                # Mulai server production

# Testing
npm test                 # Jalankan test
npm run test:watch       # Jalankan test dalam mode watch
npm run test:coverage    # Jalankan test dengan coverage

# Kualitas Kode
npm run lint             # Jalankan ESLint
npm run lint:fix         # Perbaiki masalah ESLint

# Database
npm run setup:db         # Setup database dan user
npm run db:backup        # Buat backup database
npm run migrate:tables   # Migrate tabel ke database baru

# Semua Script Tersedia
npm run                  # Lihat semua script yang tersedia
```

## 📊 Fitur Utama

### 1. Manajemen Log
- Sistem logging terpusat dengan 19 tabel terstruktur
- Format log terstruktur untuk Course Performance dan Student Activity Summary
- Log real-time untuk monitoring progress ETL
- Rotasi dan arsip log otomatis

### 2. Proses ETL
- **ETL Performa Kursus**: 7 tabel untuk monitoring performa kursus, assignment, quiz, dan resource access
- **ETL Ringkasan Aktivitas Siswa**: 8 tabel untuk aktivitas siswa, kategori, mata pelajaran, dan user activity
- **ETL Kategori & Mata Pelajaran**: Sinkronisasi kategori fakultas, program studi, dan mata pelajaran
- **Cron Jobs**: Eksekusi otomatis proses ETL secara terjadwal

### 3. Gateway API
- Proxy request ke API eksternal
- Rate limiting dan caching
- Transformasi request/response

### 4. Monitoring Real-time
- Sinkronisasi data terjadwal
- Health check dan monitoring
- Metrik performa

## 🗄️ Skema Database

Aplikasi menggunakan 19 tabel yang sudah dioptimasi dengan struktur lengkap:

### Course Performance (CP) Tables
- `monev_cp_activity_summary` - Ringkasan aktivitas kursus
- `monev_cp_course_summary` - Ringkasan kursus
- `monev_cp_fetch_logs` - Log fetch data
- `monev_cp_student_assignment_detail` - Detail assignment siswa
- `monev_cp_student_profile` - Profil siswa
- `monev_cp_student_quiz_detail` - Detail quiz siswa
- `monev_cp_student_resource_access` - Akses resource siswa

### Student Activity Summary (SAS) Tables
- `monev_sas_activity_counts_etl` - Hitungan aktivitas ETL
- `monev_sas_categories` - Kategori
- `monev_sas_courses` - Kursus
- `monev_sas_logs` - Log SAS
- `monev_sas_realtime_logs` - Log real-time SAS
- `monev_sas_subjects` - Mata pelajaran
- `monev_sas_user_activity_etl` - Aktivitas user ETL
- `monev_sas_user_counts_etl` - Hitungan user ETL

### System Tables
- `monev_users` - User sistem

**Catatan**: Semua tabel sudah memiliki index yang tepat untuk performa optimal dan foreign key untuk integritas data.

## 🔍 Monitoring & Health Checks

### Endpoint Health
```
GET /health
```

### Endpoint Metrik
```
GET /metrics
```

## 🧪 Testing

Jalankan suite test:

```bash
# Jalankan semua test
npm test

# Jalankan test dalam mode watch
npm run test:watch

# Generate laporan coverage
npm run test:coverage
```

## 📝 Logging

Aplikasi menggunakan Winston untuk logging dengan level berikut:
- `error`: Pesan error
- `warn`: Pesan peringatan
- `info`: Pesan informasi
- `debug`: Informasi debug

Log ditulis ke console dan file (jika dikonfigurasi).

## 🔒 Fitur Keamanan

- **Autentikasi JWT**: Autentikasi berbasis token yang aman
- **Hashing Password**: Bcrypt dengan salt rounds yang dapat dikonfigurasi
- **Proteksi CORS**: Cross-origin resource sharing yang dapat dikonfigurasi
- **Validasi Input**: Validasi skema Joi untuk semua input
- **Helmet**: Middleware header keamanan

## 🚨 Penanganan Error

Aplikasi mengimplementasikan penanganan error yang komprehensif:
- **Error Validasi**: Pesan error validasi yang detail
- **Error Database**: Penanganan error database yang graceful
- **Error API**: Response error yang standar
- **Logging**: Semua error di-log untuk debugging

## 🔄 Cron Jobs

Aplikasi menyertakan beberapa tugas terjadwal:

- **Sinkronisasi Data**: Eksekusi proses ETL secara teratur
- **Pembersihan Database**: Pembersihan data lama secara berkala
- **Monitoring Health**: Health check secara teratur

## 📈 Optimasi Performa

- **Connection Pooling**: Optimasi koneksi database
- **Batch Processing**: Pemrosesan data ETL yang efisien
- **Caching**: Caching response API yang sesuai
- **Operasi Async**: Operasi I/O non-blocking

## 🐛 Troubleshooting

### Masalah Umum

1. **Koneksi Database Gagal**
   - Periksa layanan MySQL berjalan
   - Verifikasi kredensial database di `.env`
   - Pastikan database ada
   - Jalankan `npm run setup:db` untuk setup database

2. **Port Sudah Digunakan**
   - Ubah port di file `.env`
   - Matikan proses yang menggunakan port: `lsof -ti:3001 | xargs kill -9`

3. **Token JWT Tidak Valid**
   - Periksa `JWT_SECRET` di `.env`
   - Verifikasi expired token
   - Pastikan format token benar

4. **Migration Tabel Gagal**
   - Pastikan database sudah dibuat dengan `npm run setup:db`
   - Periksa file `scripts/migration_tables.sql` ada
   - Jalankan `npm run migrate:tables` secara manual

### Mode Debug

Aktifkan logging debug dengan mengatur:
```env
LOG_LEVEL=debug
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch
3. Lakukan perubahan Anda
4. Tambahkan test untuk fungsionalitas baru
5. Pastikan semua test lulus
6. Submit pull request

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi ISC.

## 📞 Dukungan

Untuk dukungan dan pertanyaan:
- Buat issue di repository
- Hubungi tim development
- Periksa dokumentasi API

## 🔄 Riwayat Versi

- **v1.0.0**: Rilis awal dengan fungsionalitas inti
- **v1.1.0**: Menambahkan proses ETL dan monitoring real-time
- **v1.2.0**: Peningkatan keamanan dan optimasi performa
- **v1.3.0**: Migration table otomatis dengan 19 tabel terstruktur

---

**Catatan**: Ini adalah layanan backend yang siap untuk production dengan 19 tabel database yang sudah dioptimasi. Pastikan langkah-langkah keamanan yang tepat diterapkan sebelum deploy ke lingkungan production. 