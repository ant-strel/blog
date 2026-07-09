#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/deploy/.env.production}"
NGINX_OUTPUT="${2:-/etc/nginx/sites-available/blog-platform.conf}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

bash "$ROOT_DIR/deploy/scripts/render-nginx-conf.sh" "$ENV_FILE" "$NGINX_OUTPUT"
sudo ln -sf "$NGINX_OUTPUT" /etc/nginx/sites-enabled/blog-platform.conf
sudo nginx -t
sudo systemctl reload nginx

docker compose --env-file "$ENV_FILE" -f "$ROOT_DIR/docker-compose.yml" up -d --build --remove-orphans

sudo certbot --nginx \
  -d "$PUBLIC_DOMAIN" \
  --non-interactive \
  --agree-tos \
  -m "$EMAIL" \
  --redirect
