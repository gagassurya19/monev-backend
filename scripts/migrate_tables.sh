#!/bin/bash

# Script Migration Tabel Monev Backend
# Script ini akan menjalankan migration tabel berdasarkan versi MySQL yang dipilih

echo "=== Migration Tabel Monev Backend ==="
echo "Script ini akan menjalankan migration tabel untuk database Monev"
echo ""

# Periksa apakah MySQL terinstal
if ! command -v mysql &> /dev/null; then
    echo "❌ Error: MySQL tidak terinstal. Silakan instal MySQL terlebih dahulu."
    exit 1
fi

# Periksa apakah file .env ada
if [ ! -f .env ]; then
    echo "❌ Error: File .env tidak ditemukan. Silakan jalankan setup database terlebih dahulu."
    exit 1
fi

# Baca konfigurasi database yang diperlukan dari file .env
load_env_var() {
    local key="$1"
    local value
    value=$(grep -E "^${key}=" .env | head -n 1 | cut -d '=' -f2-)
    # Hapus tanda kutip opsional di sekitarnya
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    echo "$value"
}

DB_HOST=$(load_env_var DB_HOST)
DB_PORT=$(load_env_var DB_PORT)
DB_NAME=$(load_env_var DB_NAME)
DB_USER=$(load_env_var DB_USER)
DB_PASSWORD=$(load_env_var DB_PASSWORD)

echo "Konfigurasi Database:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Pilih versi MySQL
echo "Pilih versi MySQL yang Anda gunakan:"
echo "1) MySQL 5.7"
echo "2) MySQL 8.0"
echo ""
read -p "Masukkan pilihan (1 atau 2): " MYSQL_VERSION_CHOICE

case $MYSQL_VERSION_CHOICE in
    1)
        MYSQL_VERSION="5.7"
        MIGRATION_FILE="scripts/migrations_tables_mysql5.7.sql"
        echo "✅ Anda memilih MySQL 5.7"
        ;;
    2)
        MYSQL_VERSION="8.0"
        MIGRATION_FILE="scripts/migrations_tables_mysql8.0.sql"
        echo "✅ Anda memilih MySQL 8.0"
        ;;
    *)
        echo "❌ Pilihan tidak valid. Menggunakan MySQL 8.0 sebagai default."
        MYSQL_VERSION="8.0"
        MIGRATION_FILE="scripts/migrations_tables_mysql8.0.sql"
        ;;
esac

echo "📁 File migration yang akan digunakan: $MIGRATION_FILE"

# Periksa apakah file migration ada
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: File migration tidak ditemukan: $MIGRATION_FILE"
    exit 1
fi

echo ""

# Tanya password MySQL root (opsional)
echo "Silakan masukkan password MySQL root Anda (tekan Enter jika tidak ada password):"
read -s MYSQL_ROOT_PASSWORD

echo ""
echo "🚀 Menjalankan migration untuk MySQL $MYSQL_VERSION..."

# Jalankan migration
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    mysql -u root $DB_NAME < "$MIGRATION_FILE"
else
    mysql -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME < "$MIGRATION_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Migration berhasil dijalankan!"
    echo ""
    echo "=== Migration Complete ==="
    echo "Database: $DB_NAME"
    echo "MySQL Version: $MYSQL_VERSION"
    echo "File: $MIGRATION_FILE"
else
    echo "❌ Error: Migration gagal"
    exit 1
fi
