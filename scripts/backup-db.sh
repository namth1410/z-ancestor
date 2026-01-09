#!/bin/bash
# Backup SQLite database from Docker named volume

VOLUME_NAME="z-ancestor_db-data"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.db"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "🔄 Backing up database from volume ${VOLUME_NAME}..."

# Create temporary container to access volume and copy database
docker run --rm \
  -v "${VOLUME_NAME}:/data" \
  -v "$(pwd)/${BACKUP_DIR}:/backup" \
  alpine \
  sh -c "cp /data/production.db /backup/db_backup_${TIMESTAMP}.db"

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: ${BACKUP_FILE}"
  echo "📦 Backup size: $(du -h "${BACKUP_FILE}" | cut -f1)"
else
  echo "❌ Backup failed!"
  exit 1
fi
