#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: restore-from-backup.sh <database-name> [backup-file]" >&2
  exit 1
fi

DATABASE_NAME="$1"
BACKUP_FILE="${2:-}"
TMP_DIR="${TMP_DIR:-/tmp/restore}"
S3_PREFIX="${BACKUP_S3_PREFIX:-postgres}"

mkdir -p "$TMP_DIR"

if [ -z "$BACKUP_FILE" ]; then
  BACKUP_FILE="$(aws s3 ls "s3://${BACKUP_S3_BUCKET}/${S3_PREFIX}/" --endpoint-url "$BACKUP_S3_ENDPOINT" \
    | awk "/${DATABASE_NAME}_[0-9]{8}T[0-9]{6}Z\\.sql\\.gz$/ { print \$4 }" \
    | sort \
    | tail -n 1)"
fi

if [ -z "$BACKUP_FILE" ]; then
  echo "Backup file was not found for database ${DATABASE_NAME}." >&2
  exit 1
fi

LOCAL_FILE="$TMP_DIR/$(basename "$BACKUP_FILE")"

if [ ! -f "$BACKUP_FILE" ]; then
  aws s3 cp "s3://${BACKUP_S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" "$LOCAL_FILE" --endpoint-url "$BACKUP_S3_ENDPOINT"
else
  LOCAL_FILE="$BACKUP_FILE"
fi

gunzip -c "$LOCAL_FILE" | psql \
  "host=${POSTGRES_HOST} port=${POSTGRES_PORT:-5432} user=${POSTGRES_USER} password=${POSTGRES_PASSWORD} dbname=postgres"
