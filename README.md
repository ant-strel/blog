# personal_page_vue

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
