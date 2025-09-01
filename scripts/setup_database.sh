#!/bin/bash

# Script Setup Database Monev Backend
# Script ini akan membantu Anda setup database MySQL untuk proyek Monev

echo "=== Setup Database Monev Backend ==="
echo "Script ini akan membuat database dan user untuk proyek Monev"
echo ""

# Periksa apakah MySQL terinstal
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL tidak terinstal. Silakan instal MySQL terlebih dahulu."
    exit 1
fi

# Periksa apakah file .env ada
if [ ! -f .env ]; then
    echo "Membuat file .env dari .env.example..."
    cp .env.example .env
    echo "Silakan edit file .env dengan kredensial database Anda"
    echo ""
fi

# Baca konfigurasi database yang diperlukan dari file .env (hindari parsing baris dengan spasi atau string cron)
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

# Tanya password MySQL root (opsional)
echo "Silakan masukkan password MySQL root Anda (tekan Enter jika tidak ada password):"
read -s MYSQL_ROOT_PASSWORD

echo ""
echo "Setup database..."

# Buat database dan user
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    mysql -u root --port=$DB_PORT << EOF
-- Buat database
CREATE DATABASE IF NOT EXISTS $DB_NAME
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Buat user untuk aplikasi monev
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';

-- Berikan hak istimewa ke monev_user
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Tampilkan database yang dibuat
SHOW DATABASES LIKE '${DB_NAME}%';
EOF
else
    mysql -u root --port=$DB_PORT << EOF
-- Buat database
CREATE DATABASE IF NOT EXISTS $DB_NAME
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Buat user untuk aplikasi monev
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
EOF
fi

if [ $? -eq 0 ]; then
    echo "Database setup completed successfully!"
    echo ""
    echo "=== Setup Complete ==="
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    echo "You can now start the application with: npm run dev"
else
    echo "Error: Failed to setup database"
    exit 1
fi 