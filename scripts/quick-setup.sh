#!/bin/bash

# Script Setup Cepat Monev Backend
# Script ini akan membantu Anda menjalankan proyek dengan cepat

echo "🚀 Setup Cepat Monev Backend"
echo "=================================="
echo ""

# Periksa apakah Node.js terinstal
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js tidak terinstal. Silakan instal Node.js (>=16.0.0) terlebih dahulu."
    echo "   Download dari: https://nodejs.org/"
    exit 1
fi

# Periksa versi Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Versi Node.js harus 16 atau lebih tinggi. Versi saat ini: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) terinstal"

# Periksa apakah MySQL terinstal
if ! command -v mysql &> /dev/null; then
    echo "❌ Error: MySQL tidak terinstal. Silakan instal MySQL (>=8.0) terlebih dahulu."
    echo "   Download dari: https://dev.mysql.com/downloads/mysql/"
    exit 1
fi

echo "✅ MySQL terinstal"

# Periksa apakah file .env ada
if [ ! -f .env ]; then
    echo "📝 Membuat file .env dari .env.example..."
    cp .env.example .env
    echo "⚠️  Silakan edit file .env dengan kredensial database Anda sebelum melanjutkan"
    echo "   Tekan Enter ketika Anda siap untuk melanjutkan..."
    read
else
    echo "✅ File .env sudah ada"
fi

# Instal dependensi
echo "📦 Menginstal dependensi..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Gagal menginstal dependensi"
    exit 1
fi

echo "✅ Dependensi berhasil diinstal"

# Setup database
echo "🗄️  Setup database..."
chmod +x scripts/setup_database.sh
npm run setup:db

if [ $? -ne 0 ]; then
    echo "❌ Error: Setup database gagal"
    echo "   Silakan periksa konfigurasi MySQL dan file .env Anda"
    exit 1
fi

echo "✅ Setup database selesai"

# Check if migration file exists
if [ -f "scripts/migration_tables.sql" ]; then
    echo "📦 Migration file ditemukan, memulai migration..."
    
    # Make migration script executable
    chmod +x scripts/migrate_tables.sh
    
    # Run migration
    ./scripts/migrate_tables.sh
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration tabel selesai"
    else
        echo "⚠️  Migration tabel gagal, lanjut tanpa tabel"
    fi
else
    echo "ℹ️  Tidak ada migration file, lanjut tanpa tabel"
fi

# Buat direktori logs
echo "📁 Membuat direktori logs..."
mkdir -p logs

# Mulai aplikasi
echo "🚀 Memulai aplikasi..."
echo "   Server akan tersedia di: http://localhost:3001"
echo "   Dokumentasi API: http://localhost:3001/swagger"
echo "   Tekan Ctrl+C untuk menghentikan server"
echo ""

npm run dev
