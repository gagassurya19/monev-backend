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
    echo "Backup completed successfully!"
    echo "File: $BACKUP_FILE"
    echo "Size: $(du -h $BACKUP_FILE | cut -f1)"
    
    # Compress backup file
    gzip $BACKUP_FILE
    echo "Compressed: ${BACKUP_FILE}.gz"
    echo "Compressed size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
    
    # Clean up old backups (keep last 7 days)
    find $BACKUP_DIR -name "monev_db_backup_*.sql.gz" -mtime +7 -delete
    echo "Cleaned up backups older than 7 days"
    
else
    echo "Error: Backup failed!"
    exit 1
fi

echo ""
echo "=== Backup Complete ===" 