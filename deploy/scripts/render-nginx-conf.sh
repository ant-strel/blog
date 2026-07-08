#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/deploy/.env.production}"
OUTPUT_FILE="${2:-/etc/nginx/sites-available/blog-platform.conf}"
TEMPLATE_FILE="$ROOT_DIR/deploy/nginx/blog-platform.conf.template"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

envsubst '${PUBLIC_DOMAIN} ${PUBLIC_SITE_PORT}' < "$TEMPLATE_FILE" | sudo tee "$OUTPUT_FILE" >/dev/null
