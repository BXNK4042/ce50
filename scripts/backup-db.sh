#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
DB_FILE="${PROJECT_DIR}/server/ce50.db"

mkdir -p "${BACKUP_DIR}"

if [ ! -f "${DB_FILE}" ]; then
  echo "Error: DB file ${DB_FILE} not found." >&2
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/ce50_${TIMESTAMP}.sqlite"

sqlite3 "${DB_FILE}" ".backup '${BACKUP_FILE}'"
echo "Backup created: ${BACKUP_FILE}"

# Retention: purge backups older than 7 days
find "${BACKUP_DIR}" -name "ce50_*.sqlite" -type f -mtime +7 -delete
