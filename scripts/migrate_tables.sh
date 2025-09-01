#!/bin/bash

# Script Migration Tabel ke Database Monev Backend
# Script ini akan mengimport semua tabel yang sudah di-export

echo "=== Migration Tabel ke Database Monev Backend ==="
echo ""

# Konfigurasi database target
TARGET_DB_HOST=${TARGET_DB_HOST:-"localhost"}
TARGET_DB_PORT=${TARGET_DB_PORT:-"3308"}
TARGET_DB_NAME=${TARGET_DB_NAME:-"monev_db"}
TARGET_DB_USER=${TARGET_DB_USER:-"monev_user"}
TARGET_DB_PASSWORD=${TARGET_DB_PASSWORD:-"monev_password"}

# Direktori migration
MIGRATION_DIR="scripts"

echo "Database Target:"
echo "  Host: $TARGET_DB_HOST:$TARGET_DB_PORT"
echo "  Database: $TARGET_DB_NAME"
echo "  User: $TARGET_DB_USER"
echo ""

# Periksa apakah direktori migration ada
if [ ! -d "$MIGRATION_DIR" ]; then
    echo "❌ Direktori migration tidak ditemukan: $MIGRATION_DIR"
    echo ""
    echo "Langkah yang diperlukan:"
    echo "1. Jalankan dulu: npm run export:tables"
    echo "2. Atau buat direktori $MIGRATION_DIR dengan file .sql tabel"
    exit 1
fi

# Periksa apakah ada file migration_tables.sql
sql_file="$MIGRATION_DIR/migration_tables.sql"

if [ ! -f "$sql_file" ]; then
    echo "❌ File migration tidak ditemukan: $sql_file"
    echo ""
    echo "Langkah yang diperlukan:"
    echo "1. Pastikan file migration_tables.sql ada di direktori scripts/"
    echo "2. File ini berisi struktur tabel yang akan di-migrate"
    exit 1
fi

if [ -z "$sql_file" ]; then
    echo "❌ Tidak ada file .sql untuk di-migrate di direktori $MIGRATION_DIR"
    echo ""
    echo "Langkah yang diperlukan:"
    echo "1. Jalankan dulu: npm run export:tables"
    echo "2. Atau copy file .sql tabel ke direktori $MIGRATION_DIR"
    exit 1
fi

echo "📋 File migration yang akan digunakan:"
echo "  - $(basename "$sql_file")"
echo ""

# Test koneksi database
echo "🔍 Testing koneksi database..."
mysql -h $TARGET_DB_HOST -P $TARGET_DB_PORT -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD \
    -e "USE $TARGET_DB_NAME; SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Gagal koneksi ke database $TARGET_DB_NAME"
    echo "Pastikan:"
    echo "  1. Database $TARGET_DB_NAME sudah dibuat"
    echo "  2. User $TARGET_DB_USER sudah dibuat dan memiliki hak akses"
    echo "  3. Password yang benar"
    echo ""
    echo "Jalankan dulu: npm run setup:db"
    exit 1
fi

echo "✅ Koneksi database berhasil"
echo ""

# Mulai migration
echo "🔄 Memulai migration tabel..."
echo ""

echo "📥 Migrating semua tabel dari file migration_tables.sql..."

# Import semua tabel
mysql -h $TARGET_DB_HOST -P $TARGET_DB_PORT -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD \
    $TARGET_DB_NAME < "$sql_file"

if [ $? -eq 0 ]; then
    echo "✅ Berhasil migrate semua tabel"
    success_count=1
    failed_count=0
else
    echo "❌ Gagal migrate tabel"
    success_count=0
    failed_count=1
fi

echo ""

# Tampilkan hasil
echo "🎉 Migration selesai!"
echo "✅ Berhasil: $success_count tabel"
if [ $failed_count -gt 0 ]; then
    echo "❌ Gagal: $failed_count tabel"
fi
echo ""

# Tampilkan tabel yang ada di database target
echo "📋 Tabel yang tersedia di $TARGET_DB_NAME:"
mysql -h $TARGET_DB_HOST -P $TARGET_DB_PORT -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD \
    -e "SHOW TABLES FROM $TARGET_DB_NAME;" 2>/dev/null || echo "  (tidak dapat menampilkan tabel)"

echo ""
echo "🚀 Database siap digunakan!"
echo "Jalankan: npm run dev"
