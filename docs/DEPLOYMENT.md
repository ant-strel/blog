# Deployment

Current production deployment documentation for the single-domain `d-antes.com` setup.

## Production Topology

The current VPS setup uses one public domain:

- `https://d-antes.com` - public site.
- `https://d-antes.com/blog` - public blog and full-text article search.
- `https://d-antes.com/admin` - direct editor login.
- `https://d-antes.com/blog/editor/new` - protected article editor.
- `https://d-antes.com/sitemap.xml` - dynamic sitemap for published articles.
- `https://d-antes.com/robots.txt` - generated robots file.

Active Docker services:

- `postgres`
- `auth-api`
- `blog-api`
- `public-site`
- `postgres-backup` only when the `backup` profile is enabled

The old `admin-site`, `account-site`, and `dashboard-site` containers are not part of the current deployment. The editor is served by `public-site` and is reachable only by direct URL.

Network layout:

- Host nginx terminates HTTP/HTTPS on ports `80/443`.
- Host nginx proxies all traffic for `PUBLIC_DOMAIN` to `127.0.0.1:${PUBLIC_SITE_PORT}`.
- `public-site` proxies `/api/...` to internal Docker services.
- `auth-api` and `blog-api` are not published to the internet.
- PostgreSQL data is stored in the Docker volume `postgres-data`.

## Production Env

Create the production env file on the VPS:

```bash
cd /opt/apps/personal_page_vue
cp deploy/.env.production.example deploy/.env.production
nano deploy/.env.production
```

Current values for `d-antes.com`:

```env
PUBLIC_DOMAIN=d-antes.com
PUBLIC_BASE_URL=https://d-antes.com
SITE_NAME=d-antes
SEO_DEFAULT_LOCALE=ru
EMAIL=admin@example.com
PROJECT_NAME=blog-platform

PUBLIC_SITE_PORT=8080

POSTGRES_USER=platform
POSTGRES_PASSWORD=replace-with-strong-db-password
POSTGRES_AUTH_DB=authdb
POSTGRES_BLOG_DB=blogdb

JWT_ISSUER=TemplateProject.AuthServer
JWT_AUDIENCE=TemplateProject.Frontends
JWT_SECRET_KEY=replace-with-a-long-random-secret-at-least-32-characters

SEED_EDITOR_EMAIL=editor@example.com
SEED_EDITOR_PASSWORD=replace-with-strong-editor-password
SEED_EDITOR_FIRST_NAME=Editorial
SEED_EDITOR_LAST_NAME=Owner
```

Notes:

- `EMAIL` is used by Let's Encrypt.
- `JWT_SECRET_KEY` must be identical for `auth-api` and `blog-api`; Docker Compose wires it into both.
- `SEED_EDITOR_EMAIL` and `SEED_EDITOR_PASSWORD` create the single editor/admin account on first startup.
- Do not commit `deploy/.env.production`.

Optional Postgres backup variables are already present in `deploy/.env.production.example`. Fill `BACKUP_S3_*` only if the `postgres-backup` service will be enabled.

Optional article markdown sync variables are also present in `deploy/.env.production.example`. They are used by `ops/articles/sync-markdown-backups.sh`, not by Docker Compose.

## Initial VPS Setup

Run this once on a clean Ubuntu VPS:

```bash
sudo mkdir -p /opt/apps
sudo chown "$USER":"$USER" /opt/apps
cd /opt/apps
git clone https://github.com/ant-strel/personal_page_vue.git
cd personal_page_vue
bash deploy/scripts/bootstrap-ubuntu.sh
```

`bootstrap-ubuntu.sh` installs Docker, Docker Compose plugin, nginx, certbot, and `envsubst`. If the script adds your user to the `docker` group, reconnect SSH before deployment.

Check DNS before requesting certificates:

```bash
dig +short d-antes.com
```

The command must return the VPS IP.

## Deploy Or Update

Full deploy:

```bash
cd /opt/apps/personal_page_vue
git pull origin main
bash deploy/scripts/deploy.sh
```

The deploy script:

- reads `deploy/.env.production`;
- renders `deploy/nginx/blog-platform.conf.template`;
- writes `/etc/nginx/sites-available/blog-platform.conf`;
- enables `/etc/nginx/sites-enabled/blog-platform.conf`;
- validates and reloads host nginx;
- rebuilds and starts Docker services with `--remove-orphans`;
- requests or renews the Let's Encrypt certificate for `PUBLIC_DOMAIN`.

If nginx and certbot are already configured and only containers need rebuilding:

```bash
cd /opt/apps/personal_page_vue
git pull origin main
docker compose --env-file deploy/.env.production up -d --build --remove-orphans
sudo nginx -t
sudo systemctl reload nginx
```

## Verify Production

```bash
docker compose --env-file deploy/.env.production ps
curl -I https://d-antes.com/
curl -I https://d-antes.com/blog
curl -I https://d-antes.com/admin
curl https://d-antes.com/robots.txt
curl https://d-antes.com/sitemap.xml
```

Expected:

- `public-site` is bound to `127.0.0.1:8080->80/tcp`.
- `/` and `/blog` return `200 OK`.
- `/admin` is served by `public-site`, but it is not linked from the public navigation.
- `robots.txt` contains `Sitemap: https://d-antes.com/sitemap.xml`.
- `sitemap.xml` contains published articles only.
- Draft and archived articles are absent from sitemap.

SEO spot check:

```bash
curl -s https://d-antes.com/blog/blog-boundary-editor-later | grep -E "<title>|canonical|application/ld\\+json|og:title"
```

Editor spot check:

```bash
curl -I https://d-antes.com/admin
curl -I https://d-antes.com/blog/editor/new
```

Both routes should be served by `public-site`. Editor pages are marked `noindex` and disallowed in `robots.txt`.

## Postgres Backup

`postgres-backup` is disabled by default through the `backup` profile.

Start it only after configuring S3-compatible storage variables in `deploy/.env.production`:

```bash
docker compose --env-file deploy/.env.production --profile backup up -d postgres-backup
```

Stop/remove it:

```bash
docker compose --env-file deploy/.env.production stop postgres-backup
docker compose --env-file deploy/.env.production rm -f postgres-backup
```

Restore example:

```bash
docker compose --env-file deploy/.env.production exec postgres-backup \
  bash /scripts/restore-from-backup.sh authdb
```

Use `blogdb` instead of `authdb` to restore blog content.

## Article Markdown Export

The protected editor can export all localized blog articles and platform variants to deterministic markdown files.

Current default export path:

```bash
content/articles
```

Docker mounts it into `blog-api` as:

```bash
/exports/articles
```

Recommended production flow:

1. The API rewrites markdown automatically after article or publication-variant mutations.
2. A VPS cron job runs `ops/articles/sync-markdown-backups.sh` hourly.
3. The script commits generated markdown and mirrors it to the configured git repository and Google Drive.

Default sync to the current application repository and Google Drive:

```bash
cd /opt/apps/personal_page_vue
ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE="gdrive:d-antes/articles" \
  bash ops/articles/sync-markdown-backups.sh
```

If article sync variables are stored in `deploy/.env.production`, export them before running the script:

```bash
cd /opt/apps/personal_page_vue
set -a
source deploy/.env.production
set +a
bash ops/articles/sync-markdown-backups.sh
```

External dedicated article repository with multiple git remotes:

```bash
sudo mkdir -p /opt/backups
sudo chown "$USER":"$USER" /opt/backups
git clone git@github.com:USER/articles-backup.git /opt/backups/articles
git -C /opt/backups/articles remote add mirror git@gitlab.com:USER/articles-backup.git

cd /opt/apps/personal_page_vue
ARTICLE_EXPORT_DIR="content/articles" \
ARTICLE_EXPORT_REPO_DIR="/opt/backups/articles" \
ARTICLE_EXPORT_GIT_REMOTES="origin mirror" \
ARTICLE_EXPORT_GIT_BRANCH="main" \
ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE="gdrive:d-antes/articles" \
  bash ops/articles/sync-markdown-backups.sh
```

Variable meanings:

- `ARTICLE_EXPORT_DIR` - source directory generated by the editor.
- `ARTICLE_EXPORT_REPO_DIR` - optional dedicated git repository for article backups.
- `ARTICLE_EXPORT_GIT_REMOTES` - whitespace-separated remotes to push, for example `origin mirror`.
- `ARTICLE_EXPORT_GIT_BRANCH` - target branch; defaults to the current branch or `main`.
- `ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE` - optional `rclone` destination.
- `ARTICLE_EXPORT_COMMIT_MESSAGE` - optional custom commit message.

Install host tools when using external repo or Google Drive sync:

```bash
sudo apt-get update
sudo apt-get install -y rsync rclone
rclone config
```

The current deploy script does not mount `/opt/backups/articles` directly into the container. By default the API writes to `content/articles`, and the host sync script mirrors that directory into the dedicated article repository.

Hourly cron on the VPS:

```bash
sudo touch /var/log/article-sync.log
sudo chown "$USER":"$USER" /var/log/article-sync.log
crontab -e
```

Add:

```cron
0 * * * * cd /opt/apps/personal_page_vue && set -a && . deploy/.env.production && set +a && bash ops/articles/sync-markdown-backups.sh >> /var/log/article-sync.log 2>&1
```

Check cron output:

```bash
tail -n 100 /var/log/article-sync.log
```

## Privacy Deployment Checklist

The intended current privacy posture is a personal blog without public data collection:

- Do not add analytics scripts, tracking pixels, comment widgets, embedded social feeds, maps, or third-party players without reassessing cookies and personal data processing.
- Do not add public contact forms unless a privacy policy and consent flow are added.
- Keep editor admin login available by direct URL only; do not add it to public navigation.
- Keep API services internal to Docker and exposed only through `public-site` same-origin proxy.
- Remember that nginx and hosting infrastructure can still produce access logs.

## Troubleshooting

Service status:

```bash
docker compose --env-file deploy/.env.production ps
docker compose --env-file deploy/.env.production logs -f public-site
docker compose --env-file deploy/.env.production logs -f auth-api
docker compose --env-file deploy/.env.production logs -f blog-api
```

Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
sudo journalctl -u nginx -n 100 --no-pager
```

If editor login works but article admin endpoints return `401`:

- verify that `JWT_ISSUER`, `JWT_AUDIENCE`, and `JWT_SECRET_KEY` match for both APIs;
- recreate `auth-api`, `blog-api`, and `public-site`;
- logout/login again or clear browser local storage for `d-antes.com`.

If certificate issuance fails:

- verify DNS points to the VPS;
- verify ports `80` and `443` are reachable;
- run `sudo certbot certificates`;
- rerun `bash deploy/scripts/deploy.sh` after fixing DNS/network issues.

## Important Files

- `docker-compose.yml` - current Docker stack.
- `deploy/.env.production.example` - production env template.
- `deploy/scripts/bootstrap-ubuntu.sh` - VPS dependency bootstrap.
- `deploy/scripts/deploy.sh` - production deploy/update script.
- `deploy/nginx/blog-platform.conf.template` - single-domain host nginx template.
- `ops/articles/sync-markdown-backups.sh` - markdown export backup sync.
- `ops/postgres/backup/pg-backup.sh` - Postgres backup loop.
- `ops/postgres/backup/restore-from-backup.sh` - Postgres restore helper.
- `apps/public-site-react/server.mjs` - production Node server, API proxy, SEO shell, robots, sitemap.
- `apps/public-site-react/src/pages/BlogIndexPage.tsx` - public blog list and search.
- `apps/public-site-react/src/pages/BlogArticleEditorPage.tsx` - protected article editor.
- `apps/blog-api-dotnet` - blog API.
- `apps/api-dotnet` - auth API.

## Local Development

```bash
npm install
npm run dev:api
npm run dev:blog-api
npm run dev:public
```

Customization notes are kept in [CUSTOMIZATION.md](CUSTOMIZATION.md).
