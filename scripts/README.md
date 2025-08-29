# Scripts Setup Monev Backend

Direktori ini berisi script-script untuk setup dan maintenance proyek Monev Backend.

## Script yang Tersedia

### 1. `quick-setup.sh` - Setup Cepat
Script utama untuk setup cepat proyek Monev Backend.

**Fitur:**
- ✅ Pemeriksaan Node.js dan MySQL
- ✅ Instalasi dependensi
- ✅ Setup database dengan pilihan versi MySQL
- ✅ Pembuatan direktori logs
- ✅ Menjalankan aplikasi

**Cara Penggunaan:**
```bash
# Jalankan dari root directory proyek
npm run quick-setup

# Atau langsung
bash scripts/quick-setup.sh
```

### 2. `setup_database.sh` - Setup Database
Script untuk setup database dan menjalankan migration.

**Fitur:**
- ✅ Pembuatan database dan user
- ✅ Pilihan versi MySQL (5.7 atau 8.0)
- ✅ Jalankan migration otomatis
- ✅ Konfigurasi dari file .env

**Cara Penggunaan:**
```bash
# Jalankan dari root directory proyek
npm run setup:db

# Atau langsung
bash scripts/setup_database.sh
```

### 3. `migrate_tables.sh` - Migration Tabel
Script untuk menjalankan migration tabel secara manual.

**Fitur:**
- ✅ Pilihan versi MySQL (5.7 atau 8.0)
- ✅ Jalankan migration berdasarkan file yang dipilih
- ✅ Konfigurasi dari file .env

**Cara Penggunaan:**
```bash
# Jalankan dari root directory proyek
npm run migrate:tables

# Atau langsung
bash scripts/migrate_tables.sh
```

## Pilihan Versi MySQL

Script setup mendukung dua versi MySQL:

### MySQL 5.7
- File migration: `migrations_tables_mysql5.7.sql`
- Kompatibel dengan MySQL 5.7 dan versi yang lebih rendah
- Struktur tabel yang disesuaikan untuk MySQL 5.7

### MySQL 8.0
- File migration: `migrations_tables_mysql8.0.sql`
- Kompatibel dengan MySQL 8.0 dan versi yang lebih tinggi
- Struktur tabel yang disesuaikan untuk MySQL 8.0
- Fitur modern MySQL 8.0

## File Migration

### `migrations_tables_mysql5.7.sql`
- Struktur tabel untuk MySQL 5.7
- Kompatibel dengan versi MySQL yang lebih lama
- Tidak menggunakan fitur MySQL 8.0 yang tidak tersedia di 5.7

### `migrations_tables_mysql8.0.sql`
- Struktur tabel untuk MySQL 8.0
- Menggunakan fitur modern MySQL 8.0
- Optimized untuk performa MySQL 8.0

## Langkah Setup

### 1. Setup Cepat (Recommended)
```bash
npm run quick-setup
```

### 2. Setup Manual
```bash
# Setup database
npm run setup:db

# Jalankan migration (jika diperlukan)
npm run migrate:tables

# Jalankan aplikasi
npm run dev
```

## Troubleshooting

### Error: MySQL tidak terinstal
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS
brew install mysql

# CentOS/RHEL
sudo yum install mysql-server
```

### Error: File .env tidak ditemukan
```bash
# Copy dari .env.example
cp .env.example .env

# Edit file .env dengan konfigurasi database Anda
nano .env
```

### Error: Migration gagal
1. Pastikan database sudah dibuat
2. Pastikan user memiliki hak akses yang cukup
3. Periksa versi MySQL yang dipilih
4. Jalankan migration secara manual: `npm run migrate:tables`

## Konfigurasi .env

Pastikan file `.env` berisi konfigurasi database yang benar:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=monev_db
DB_USER=monev_user
DB_PASSWORD=your_password
```

## Catatan Penting

- Script memerlukan akses root MySQL untuk setup database
- Pastikan MySQL service berjalan sebelum menjalankan script
- Backup database sebelum menjalankan migration jika ada data penting
- Script otomatis memilih file migration berdasarkan versi MySQL yang dipilih
