#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
BACKUP_LOCAL_RETENTION_DAYS="${BACKUP_LOCAL_RETENTION_DAYS:-14}"
BACKUP_REMOTE_RETENTION_DAYS="${BACKUP_REMOTE_RETENTION_DAYS:-30}"
DATABASES="${POSTGRES_DATABASES:-authdb blogdb}"
S3_PREFIX="${BACKUP_S3_PREFIX:-postgres}"

mkdir -p "$BACKUP_DIR"

require_env() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "Missing required environment variable: $name" >&2
    exit 1
  fi
}

require_env POSTGRES_HOST
require_env POSTGRES_USER
require_env POSTGRES_PASSWORD
require_env BACKUP_S3_BUCKET
require_env BACKUP_S3_REGION
require_env BACKUP_S3_ENDPOINT
require_env BACKUP_S3_ACCESS_KEY_ID
require_env BACKUP_S3_SECRET_ACCESS_KEY

export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$BACKUP_S3_REGION"

backup_once() {
  local timestamp output_file remote_path cutoff
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"

  for db in $DATABASES; do
    output_file="$BACKUP_DIR/${db}_${timestamp}.sql.gz"
    remote_path="s3://${BACKUP_S3_BUCKET}/${S3_PREFIX}/$(basename "$output_file")"

    pg_dump \
      --host="$POSTGRES_HOST" \
      --port="${POSTGRES_PORT:-5432}" \
      --username="$POSTGRES_USER" \
      --dbname="$db" \
      --clean \
      --if-exists \
      --create | gzip -c > "$output_file"

    aws s3 cp "$output_file" "$remote_path" --endpoint-url "$BACKUP_S3_ENDPOINT"
  done

  find "$BACKUP_DIR" -type f -name '*.sql.gz' -mtime +"$BACKUP_LOCAL_RETENTION_DAYS" -delete

  cutoff="$(date -u -d "${BACKUP_REMOTE_RETENTION_DAYS} days ago" +%Y%m%dT%H%M%SZ)"
  while read -r remote_file; do
    [ -z "$remote_file" ] && continue
    if [[ "$remote_file" =~ _([0-9]{8}T[0-9]{6}Z)\.sql\.gz$ ]]; then
      if [[ "${BASH_REMATCH[1]}" < "$cutoff" ]]; then
        aws s3 rm "s3://${BACKUP_S3_BUCKET}/${S3_PREFIX}/${remote_file}" --endpoint-url "$BACKUP_S3_ENDPOINT"
      fi
    fi
  done < <(aws s3 ls "s3://${BACKUP_S3_BUCKET}/${S3_PREFIX}/" --endpoint-url "$BACKUP_S3_ENDPOINT" | awk '{ print $4 }')
}

while true; do
  backup_once
  sleep "$BACKUP_INTERVAL_SECONDS"
done
