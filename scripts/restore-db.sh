#!/bin/bash
# Restore SQLite database to Docker named volume

VOLUME_NAME="z-ancestor_db-data"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ Usage: ./scripts/restore-db.sh <backup-file>"
  echo "   Example: ./scripts/restore-db.sh backups/db_backup_20260109_164800.db"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "🔄 Restoring database to volume ${VOLUME_NAME}..."
echo "⚠️  WARNING: This will OVERWRITE the current database!"
read -p "Continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Restore cancelled"
  exit 1
fi

# Copy backup file into volume
docker run --rm \
  -v "${VOLUME_NAME}:/data" \
  -v "$(pwd)/$(dirname "$BACKUP_FILE"):/backup" \
  alpine \
  sh -c "cp /backup/$(basename "$BACKUP_FILE") /data/production.db"

if [ $? -eq 0 ]; then
  echo "✅ Restore successful!"
  echo "🔄 Restart your containers for changes to take effect:"
  echo "   docker-compose restart"
else
  echo "❌ Restore failed!"
  exit 1
fi
