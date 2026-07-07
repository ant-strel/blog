# Customization Map

Документ перечисляет места, где меняются публичные описания сайта, контакты, языки, seed-статьи, домены и служебные значения.

## Домены, Порты, Креды, Secrets

Файл: `deploy/.env.production`

Основные переменные:

- `PUBLIC_DOMAIN` - домен публичного сайта.
- `ADMIN_DOMAIN` - домен админки и редактора.
- `ACCOUNT_DOMAIN` - домен прямого login/account.
- `DASHBOARD_DOMAIN` - домен dashboard.
- `EMAIL` - email для Let's Encrypt.
- `PUBLIC_SITE_PORT`, `ADMIN_SITE_PORT`, `ACCOUNT_SITE_PORT`, `DASHBOARD_SITE_PORT` - loopback-порты на VPS.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_AUTH_DB`, `POSTGRES_BLOG_DB` - Postgres.
- `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_SECRET_KEY` - JWT-настройки, общие для `auth-api` и `blog-api`.
- `SEED_EDITOR_EMAIL`, `SEED_EDITOR_PASSWORD`, `SEED_EDITOR_FIRST_NAME`, `SEED_EDITOR_LAST_NAME` - первый editor-пользователь.
- `BACKUP_S3_*` - S3-compatible backup.

Шаблон: `deploy/.env.production.example`.

## Host Nginx

Файл: `deploy/nginx/blog-platform.conf.template`

Менять вручную обычно не нужно. Он использует домены и порты из `deploy/.env.production`.

Рендер:

```bash
bash deploy/scripts/render-nginx-conf.sh deploy/.env.production /etc/nginx/sites-available/blog-platform.conf
```

## Публичные Тексты Сайта

Файл: `apps/public-site-react/src/content/siteContent.ts`

Здесь меняются:

- `brandName` - название в шапке.
- `footerText` - footer.
- `nav` - пункты меню.
- `languageLabel` и `languages` - подпись и названия языков.
- `home.title`, `home.subtitle`, `home.blogCta`, `home.contactCta` - главная страница.
- `blog.title`, `blog.subtitle`, `blog.loading`, `blog.continueReading`, `blog.previous`, `blog.next`, `blog.tagsLabel` - список статей.
- `article.loading`, `article.notFound`, `article.backToBlog`, `article.backToAllPosts` - страница статьи.
- `contact.*` - заголовки, placeholders, кнопка и статус формы.
- `contact.methods` - email, LinkedIn, GitHub и другие контакты.

Все публичные описания поддерживают `en`, `ru`, `es`.

Пример:

```ts
home: {
  title: {
    en: "My blog",
    ru: "Мой блог",
    es: "Mi blog"
  }
}
```

## Статьи Блога

Создание и редактирование:

- URL: `https://<ADMIN_DOMAIN>/login`
- после входа: `https://<ADMIN_DOMAIN>/blog`

Поля `title`, `excerpt`, `content` поддерживают языки:

- `en`
- `ru`
- `es`

Редактор показывает языковые вкладки. Английская версия обязательна как fallback. Если `ru` или `es` не заполнены, публичный сайт покажет `en`.

## Seed-Статьи

Файл backend seed: `apps/blog-api-dotnet/Services/BlogSeeder.cs`

Используется только когда таблица статей пустая. Если база уже содержит статьи, изменение seed-файла не перезапишет существующие записи.

Формат локализованных полей хранится JSON-строкой:

```csharp
Title = "{\"en\":\"Title\",\"ru\":\"Заголовок\",\"es\":\"Título\"}"
```

Mock-данные для фронтенда без API:

- `packages/api-client-ts/src/blog.ts`

Эти данные используются только когда приложение запущено в `mock` mode.

## Добавление Нового Языка

Сейчас поддержаны `en`, `ru`, `es`.

Чтобы добавить язык, нужно изменить:

- `packages/contracts/src/blog.ts` - тип `LocaleCode`.
- `apps/public-site-react/src/content/siteContent.ts` - все локализованные тексты и `languages`.
- `apps/public-site-react/src/App.tsx` - `<option>` в selector.
- `apps/public-site-react/src/lib/localize.ts` - fallback order, если нужен особый порядок.
- `apps/admin-react/src/pages/BlogArticleEditorPage.tsx` - массив `locales`.
- `apps/blog-api-dotnet/Services/BlogSeeder.cs` - seed-статьи.
- `packages/api-client-ts/src/blog.ts` - mock-статьи.

После изменения:

```bash
npx tsc -p apps/public-site-react/tsconfig.json --noEmit
npx tsc -p apps/admin-react/tsconfig.json --noEmit
dotnet build apps/blog-api-dotnet/Blog.Api.csproj
```

## Admin, Account, Dashboard Тексты

Основные файлы:

- `apps/admin-react/src/App.tsx`
- `apps/admin-react/src/pages/LoginPage.tsx`
- `apps/admin-react/src/pages/BlogArticlesPage.tsx`
- `apps/admin-react/src/pages/BlogArticleEditorPage.tsx`
- `apps/account-react/src/App.tsx`
- `apps/account-react/src/pages/LoginPage.tsx`
- `apps/dashboard-react/src/App.tsx`
- `apps/dashboard-react/src/pages/LoginPage.tsx`

Эти внутренние экраны пока не имеют полного UI i18n. Они служебные и доступны после прямого входа.

## Стили

Публичный сайт:

- `apps/public-site-react/src/styles.css`

Внутренние приложения:

- `apps/admin-react/src/styles.css`
- `apps/account-react/src/styles.css`
- `apps/dashboard-react/src/styles.css`

Дизайн приведен к минималистичному белому стилю из Vue-референса. Если меняешь типографику или сетку, начинай с public styles и затем синхронизируй внутренние overrides.
