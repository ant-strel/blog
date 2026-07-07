# personal_page_vue

## VPS Docker Deploy Под Ключ

Ниже порядок для чистого Ubuntu VPS, где внешний nginx принимает реальные домены, проксирует на локальные Docker-порты, а контейнерные nginx внутри фронтендов проксируют `/api/...` в приватную Docker-сеть.

### 1. Подготовить DNS

Создай DNS A/AAAA-записи на IP VPS:

- `blog.example.com` - публичный блог.
- `admin.blog.example.com` - закрытая админка и редактор.
- `account.blog.example.com` - прямая страница login/account.
- `dashboard.blog.example.com` - служебный dashboard.

Можно использовать любые домены. Их нужно будет вписать в `deploy/.env.production`.

### 2. Скопировать проект на сервер

```bash
git clone <repo-url>
cd personal_page_vue
git checkout codex/react-blog-platform
```

### 3. Установить Docker, Compose plugin, nginx, certbot

```bash
bash deploy/scripts/bootstrap-ubuntu.sh
```

Если скрипт добавил пользователя в группу `docker`, перелогинься в SSH-сессию перед deploy.

### 4. Создать production env

```bash
cp deploy/.env.production.example deploy/.env.production
nano deploy/.env.production
```

Заполни реальные значения:

```env
PUBLIC_DOMAIN=blog.example.com
ADMIN_DOMAIN=admin.blog.example.com
ACCOUNT_DOMAIN=account.blog.example.com
DASHBOARD_DOMAIN=dashboard.blog.example.com
EMAIL=admin@example.com
PROJECT_NAME=blog-platform

PUBLIC_SITE_PORT=8080
ADMIN_SITE_PORT=8081
ACCOUNT_SITE_PORT=8082
DASHBOARD_SITE_PORT=8083

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

BACKUP_INTERVAL_SECONDS=86400
BACKUP_LOCAL_RETENTION_DAYS=14
BACKUP_REMOTE_RETENTION_DAYS=30
BACKUP_S3_BUCKET=blog-platform-backups
BACKUP_S3_PREFIX=postgres
BACKUP_S3_REGION=us-east-1
BACKUP_S3_ENDPOINT=https://s3.amazonaws.com
BACKUP_S3_ACCESS_KEY_ID=replace-me
BACKUP_S3_SECRET_ACCESS_KEY=replace-me
```

Что куда вписывать:

- `PUBLIC_DOMAIN`, `ADMIN_DOMAIN`, `ACCOUNT_DOMAIN`, `DASHBOARD_DOMAIN` - реальные домены, которые смотрят на VPS.
- `EMAIL` - email для Let's Encrypt.
- `PUBLIC_SITE_PORT`, `ADMIN_SITE_PORT`, `ACCOUNT_SITE_PORT`, `DASHBOARD_SITE_PORT` - loopback-порты на VPS. Если `8080` занят, меняй здесь.
- `POSTGRES_PASSWORD` - пароль Postgres внутри Docker-сети.
- `JWT_SECRET_KEY` - общий секрет для `auth-api` и `blog-api`; не меняй его отдельно только для одного сервиса.
- `SEED_EDITOR_EMAIL` и `SEED_EDITOR_PASSWORD` - логин и пароль для входа в `https://<ADMIN_DOMAIN>/login`.
- `BACKUP_S3_*` - S3-compatible storage для backup. Bucket нужно создать заранее.

### 5. Проверить DNS перед certbot

```bash
dig +short blog.example.com
dig +short admin.blog.example.com
dig +short account.blog.example.com
dig +short dashboard.blog.example.com
```

Все команды должны вернуть IP VPS. Если `dig` не установлен, используй `nslookup`.

### 6. Запустить deploy

```bash
bash deploy/scripts/deploy.sh
```

Скрипт делает следующее:

- читает `deploy/.env.production`;
- рендерит host nginx config из `deploy/nginx/blog-platform.conf.template`;
- включает конфиг в `/etc/nginx/sites-enabled/blog-platform.conf`;
- проверяет и перезагружает nginx;
- собирает и запускает Docker Compose stack;
- выпускает Let's Encrypt сертификаты через certbot и включает HTTPS redirect.

### 7. Проверить результат

Открой:

- `https://<PUBLIC_DOMAIN>` - публичный сайт.
- `https://<PUBLIC_DOMAIN>/blog` - публичный блог.
- `https://<ADMIN_DOMAIN>/login` - вход редактора.
- `https://<ADMIN_DOMAIN>/blog` - список статей после входа.
- `https://<ACCOUNT_DOMAIN>/login` - прямой account login.
- `https://<DASHBOARD_DOMAIN>/login` - dashboard login.

На публичном сайте нет ссылки на login. Вход редактора доступен только по прямой ссылке admin/account.

### 8. Обновление после изменений

```bash
git pull
docker compose --env-file deploy/.env.production up -d --build
sudo nginx -t
sudo systemctl reload nginx
```

Если менялись домены или порты, заново отрендери nginx:

```bash
bash deploy/scripts/render-nginx-conf.sh deploy/.env.production /etc/nginx/sites-available/blog-platform.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Диагностика

```bash
docker compose --env-file deploy/.env.production ps
docker compose --env-file deploy/.env.production logs -f auth-api
docker compose --env-file deploy/.env.production logs -f blog-api
docker compose --env-file deploy/.env.production logs -f admin-site
```

Если после входа editor получает `401` на admin blog endpoints:

- пересоздай `auth-api`, `blog-api`, `admin-site`;
- очисти `localStorage` для admin-домена или сделай logout/login;
- проверь, что `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_SECRET_KEY` одинаковые для `auth-api` и `blog-api`.

## Кастомизация Контента

Отдельный список мест для изменения текстов, контактов, описаний, seed-статей и языков находится в [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md).

This repository now contains two layers:

- `personal_page/` - the original Vue project kept as a reference.
- `apps/` + `packages/` - the new React/.NET blog platform stack.

Current stack:

- `apps/public-site-react` - public React blog.
- `apps/admin-react` - React admin with article list, editor, publish, archive, and status management.
- `apps/account-react` - auth/account shell for login and profile flows.
- `apps/dashboard-react` - React private dashboard shell.
- `apps/api-dotnet` - standalone JWT auth server.
- `apps/blog-api-dotnet` - standalone blog API with protected article editing endpoints.
- `personal_page/` - Vue reference, kept untouched in role.

Local development:

```bash
npm install
npm run dev:api
npm run dev:blog-api
npm run dev:public
npm run dev:admin
npm run dev:account
npm run dev:dashboard
```

Compose network layout:

- `auth-api` and `blog-api` are internal-only Docker services.
- `public-site`, `admin-site`, `account-site`, and `dashboard-site` are published only on loopback.
- External traffic should terminate on host nginx and route by domain to local frontend ports.

Loopback ports on the VPS host:

- `127.0.0.1:8080` - public React blog.
- `127.0.0.1:8081` - admin React.
- `127.0.0.1:8082` - account React.
- `127.0.0.1:8083` - dashboard React.

For local Docker runs, you can override these host ports without editing `docker-compose.yml`:

```bash
PUBLIC_SITE_PORT=18080
ADMIN_SITE_PORT=18081
ACCOUNT_SITE_PORT=18082
DASHBOARD_SITE_PORT=18083
docker compose up --build postgres auth-api blog-api public-site admin-site account-site dashboard-site
```

Cross-app frontend links are also derived from these same port variables during Docker build, so admin/account/dashboard navigation stays on the published Docker ports instead of falling back to Vite `localhost:517x`. The public site does not expose an account/login menu entry; login remains available only by direct account URL.

The editor account is seeded by `auth-api` into the auth database on startup. For Docker runs, override it with runtime environment variables:

```bash
SEED_EDITOR_EMAIL=editor@example.com
SEED_EDITOR_PASSWORD=Editor123!
SEED_EDITOR_FIRST_NAME=Editorial
SEED_EDITOR_LAST_NAME=Owner
```

The same values map to ASP.NET configuration keys `Seed__EditorEmail`, `Seed__EditorPassword`, `Seed__EditorFirstName`, and `Seed__EditorLastName`. React login forms do not embed these credentials.

Auth and blog APIs must share the same JWT settings. Docker Compose wires these into both services; override them together if needed:

```bash
JWT_ISSUER=TemplateProject.AuthServer
JWT_AUDIENCE=TemplateProject.Frontends
JWT_SECRET_KEY=replace-with-a-long-random-secret
```

The same values map to ASP.NET configuration keys `Jwt__Issuer`, `Jwt__Audience`, and `Jwt__SecretKey`.

Blog articles support localized title, excerpt, and content values for `en`, `ru`, and `es`. The admin editor exposes language tabs for these locales. Existing one-language records are treated as English fallback content when read by the API.

Deployment package:

- `deploy/.env.production.example` - production domains and email variables.
- `deploy/nginx/blog-platform.conf.template` - nginx vhost template for arbitrary domains.
- `deploy/scripts/bootstrap-ubuntu.sh` - installs Docker, Compose plugin, nginx, certbot, and envsubst.
- `deploy/scripts/render-nginx-conf.sh` - renders the nginx config from env variables.
- `deploy/scripts/deploy.sh` - reloads nginx, builds containers, and requests TLS certificates.

Database and backup deployment:

- PostgreSQL data is stored in the Docker volume `postgres-data`.
- Logical backups are created by `postgres-backup` and uploaded to S3-compatible object storage.
- Backup configuration lives in `deploy/.env.production`.
- Restore helper script is available at `ops/postgres/backup/restore-from-backup.sh`.
- Create the destination bucket before the first deploy and provide working S3 credentials in `deploy/.env.production`.
- Remote retention is controlled by `BACKUP_REMOTE_RETENTION_DAYS`; local retention inside the Docker volume uses `BACKUP_LOCAL_RETENTION_DAYS`.

Restore example:

```bash
docker compose --env-file deploy/.env.production exec postgres-backup \
  bash /scripts/restore-from-backup.sh authdb
```

Typical VPS flow:

```bash
cp deploy/.env.production.example deploy/.env.production
bash deploy/scripts/bootstrap-ubuntu.sh
bash deploy/scripts/deploy.sh
```

Result:

- Public visitors hit only frontend domains.
- React frontends call `/api/...` on the same origin.
- Container nginx proxies those API calls to internal Docker services.
- Auth and blog APIs are not exposed as internet-facing ports.

## Порядок деплоя на VPS

Ниже порядок для чистого Ubuntu-сервера, на который нужно перенести весь проект и поднять блог с админкой, авторизацией и reverse proxy.

### 1. Подготовить домены

Нужны DNS-записи, указывающие на IP вашего VPS:

- `blog.example.com` - публичный блог
- `admin.blog.example.com` - админка
- `account.blog.example.com` - аккаунт / логин
- `dashboard.blog.example.com` - служебный dashboard

Можно использовать любые свои домены и поддомены, главное потом прописать их в `deploy/.env.production`.

### 2. Перенести проект на сервер

Склонируйте репозиторий на VPS и перейдите в каталог проекта:

```bash
git clone <repo-url>
cd personal_page_vue
```

Если нужен конкретный вариант сборки, переключитесь на ветку с платформой блога:

```bash
git checkout codex/react-blog-platform
```

### 3. Подготовить production env

Создайте production-конфиг из шаблона:

```bash
cp deploy/.env.production.example deploy/.env.production
```

Заполните в `deploy/.env.production` свои значения:

```env
PUBLIC_DOMAIN=blog.example.com
ADMIN_DOMAIN=admin.blog.example.com
ACCOUNT_DOMAIN=account.blog.example.com
DASHBOARD_DOMAIN=dashboard.blog.example.com
EMAIL=admin@example.com
PROJECT_NAME=blog-platform
```

`EMAIL` используется для выпуска Let's Encrypt сертификатов.

### 4. Установить системные зависимости

Скрипт установит Docker, Docker Compose plugin, nginx, certbot и `envsubst`:

```bash
bash deploy/scripts/bootstrap-ubuntu.sh
```

После выполнения желательно перелогиниться на сервере, если текущего пользователя добавили в группу `docker`.

### 5. Проверить, что DNS уже смотрит на сервер

Перед выпуском сертификатов домены должны резолвиться в IP VPS. Иначе `certbot` не сможет подтвердить владение доменом.

Минимальная проверка:

```bash
ping blog.example.com
ping admin.blog.example.com
```

Или через `dig` / `nslookup`, если они установлены.

### 6. Запустить deploy

Основной скрипт делает все нужное:

- рендерит nginx-конфиг из шаблона
- включает сайт в host nginx
- проверяет конфигурацию nginx
- перезагружает nginx
- собирает и поднимает контейнеры
- получает SSL-сертификаты через Let's Encrypt

Команда:

```bash
bash deploy/scripts/deploy.sh
```

### 7. Что поднимется после deploy

На сервере будут работать:

- host nginx как внешняя точка входа на `80/443`
- `public-site` на `127.0.0.1:8080`
- `admin-site` на `127.0.0.1:8081`
- `account-site` на `127.0.0.1:8082`
- `dashboard-site` на `127.0.0.1:8083`
- `auth-api` только во внутренней Docker-сети
- `blog-api` только во внутренней Docker-сети

То есть снаружи доступны только страницы фронтенда через домены, а backend-порты напрямую не опубликованы.

### 8. Проверка после запуска

Проверьте, что открываются:

- `https://<PUBLIC_DOMAIN>`
- `https://<ADMIN_DOMAIN>`
- `https://<ACCOUNT_DOMAIN>`
- `https://<DASHBOARD_DOMAIN>`

Дополнительно проверьте:

- логин через account/admin
- загрузку списка статей
- создание или редактирование статьи в админке
- отсутствие прямого доступа к API-портам `7067` и `7071`, так как они больше не должны слушать внешний интерфейс

### 9. Повторный деплой после изменений

После обновления кода достаточно выполнить:

```bash
git pull
bash deploy/scripts/deploy.sh
```

Это пересоберет контейнеры и заново применит nginx-конфигурацию.

### 10. Если нужен другой домен или новый VPS

Ничего в коде менять не нужно:

1. переносите проект
2. меняете значения в `deploy/.env.production`
3. настраиваете DNS на новый IP
4. снова запускаете `bootstrap-ubuntu.sh` и `deploy.sh`

Вся привязка к доменам вынесена в env и nginx template.
