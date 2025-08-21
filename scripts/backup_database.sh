#!/bin/bash

# Monev Database Backup Script
# Script ini untuk backup database monev_db

# Konfigurasi
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="monev_db"
DB_USER="monev_user"
DB_PASSWORD="monev_password"

# Buat direktori backup jika belum ada
mkdir -p $BACKUP_DIR

# Nama file backup
BACKUP_FILE="$BACKUP_DIR/monev_db_backup_$DATE.sql"

echo "=== Monev Database Backup ==="
echo "Backup file: $BACKUP_FILE"
echo ""

# Backup database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Backup berhasil diselesaikan!"
    echo "File: $BACKUP_FILE"
    echo "Ukuran: $(du -h $BACKUP_FILE | cut -f1)"
    
    # Kompres file backup
    gzip $BACKUP_FILE
    echo "Dikompres: ${BACKUP_FILE}.gz"
    echo "Ukuran terkompres: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
    
    # Bersihkan backup lama (simpan 7 hari terakhir)
    find $BACKUP_DIR -name "monev_db_backup_*.sql.gz" -mtime +7 -delete
    echo "Membersihkan backup yang lebih dari 7 hari"
    
else
    echo "Error: Backup gagal!"
    exit 1
fi

echo ""
echo "=== Backup Selesai ===" 