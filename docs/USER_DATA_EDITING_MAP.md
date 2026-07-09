# Карта редактирования пользовательских данных

Документ перечисляет места, где сейчас меняются пользовательские данные сайта: заголовки, описания, контакты, SEO-тексты, статьи, авторы, учётка редактора и служебные публичные подписи.

Актуальная версия сайта работает на одном домене `d-antes.com`. Папка `personal_page/` является старым Vue-референсом и не используется в текущем Docker-деплое.

## Короткая карта

| Что менять | Где менять | Когда применяется |
| --- | --- | --- |
| Домен, canonical URL, имя сайта для серверного SEO | `deploy/.env.production` | После deploy/restart контейнеров |
| Название сайта, меню, главная, блог, контакты | `apps/public-site-react/src/content/siteContent.ts` | После rebuild `public-site` |
| Тексты интерфейса редактора | `apps/public-site-react/src/content/editorContent.ts` | После rebuild `public-site` |
| Статьи, slug, title, excerpt, content, author, tags, status | Через редактор `/admin` -> `/blog` | Сразу после сохранения/публикации |
| Начальные seed-статьи для пустой БД | `apps/blog-api-dotnet/Services/BlogSeeder.cs` | Только если таблица статей пустая |
| Mock-статьи для фронта без API | `packages/api-client-ts/src/blog.ts` | Только в mock mode |
| Учётка первого редактора | `deploy/.env.production` (`SEED_EDITOR_*`) | При старте `auth-api`, если пользователь ещё не создан |
| SEO shell, robots, sitemap, fallback SEO-тексты | `apps/public-site-react/server.mjs` | После rebuild `public-site` |
| Client-side SEO title/description после React-навигации | `apps/public-site-react/src/components/Seo.tsx` и страницы в `apps/public-site-react/src/pages/` | После rebuild `public-site` |
| Светлая/тёмная тема, цвета, сетка, формы | `apps/public-site-react/src/styles.css` | После rebuild `public-site` |

## Production env

Файл на VPS:

```text
deploy/.env.production
```

Пользовательские значения:

- `PUBLIC_DOMAIN` - домен, например `d-antes.com`.
- `PUBLIC_BASE_URL` - canonical URL, например `https://d-antes.com`.
- `SITE_NAME` - имя сайта для серверного SEO.
- `SEO_DEFAULT_LOCALE` - язык серверного SEO HTML, сейчас обычно `ru`.
- `EMAIL` - email для Let's Encrypt.
- `SEED_EDITOR_EMAIL` - email редактора.
- `SEED_EDITOR_PASSWORD` - пароль редактора.
- `SEED_EDITOR_FIRST_NAME` - имя редактора.
- `SEED_EDITOR_LAST_NAME` - фамилия редактора.
- `BACKUP_S3_*` - настройки backup, если используется S3.

Шаблон:

```text
deploy/.env.production.example
```

После изменения env на VPS:

```bash
docker compose --env-file deploy/.env.production up -d --build --remove-orphans
sudo nginx -t
sudo systemctl reload nginx
```

## Публичные тексты сайта

Файл:

```text
apps/public-site-react/src/content/siteContent.ts
```

Основные поля:

- `brandName` - название в шапке сайта.
- `footerText` - текст footer.
- `nav.home`, `nav.blog`, `nav.contact` - пункты меню.
- `languageLabel` - подпись переключателя языка.
- `languages` - названия языков в select.
- `home.title` - главный заголовок на главной.
- `home.subtitle` - описание на главной.
- `home.blogCta` - кнопка перехода в блог.
- `home.contactCta` - кнопка перехода в контакты.
- `blog.title` - заголовок страницы блога.
- `blog.subtitle` - описание страницы блога.
- `blog.loading` - текст загрузки списка статей.
- `blog.continueReading` - ссылка "читать дальше".
- `blog.previous`, `blog.next` - пагинация.
- `blog.tagsLabel` - подпись тегов.
- `article.loading` - текст загрузки статьи.
- `article.notFound` - текст, если статья не найдена.
- `article.backToBlog` - кнопка назад в блог.
- `article.backToAllPosts` - кнопка назад ко всем статьям.
- `contact.title` - заголовок страницы контактов.
- `contact.subtitle` - описание страницы контактов.
- `contact.nameLabel`, `contact.namePlaceholder` - поле имени.
- `contact.emailLabel`, `contact.emailPlaceholder` - поле email.
- `contact.messageLabel`, `contact.messagePlaceholder` - поле сообщения.
- `contact.submitLabel` - кнопка отправки.
- `contact.sentStatus` - текст после отправки формы.
- `contact.otherWaysTitle` - заголовок блока других способов связи.
- `contact.methods` - список контактов: email, LinkedIn, GitHub и другие ссылки.

Формат локализованного текста:

```ts
title: {
  en: "English title",
  ru: "Русский заголовок",
  es: "Titulo en espanol"
}
```

## Контакты

Контакты сейчас задаются в:

```text
apps/public-site-react/src/content/siteContent.ts
```

Блок:

```ts
contact: {
  emailPlaceholder: { ... },
  methods: [
    {
      label: "Email",
      value: "your.email@example.com"
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/yourprofile",
      href: "https://linkedin.com/in/yourprofile"
    }
  ]
}
```

Важно: текущая contact-форма не отправляет письмо на сервер. Она очищает черновик сообщения в интерфейсе. Если нужна реальная отправка, нужно добавить backend endpoint или внешний сервис.

## Тексты интерфейса редактора

Файл:

```text
apps/public-site-react/src/content/editorContent.ts
```

Основные группы:

- `articleList` - список статей для авторизованного пользователя.
- `articleEditor` - форма создания/редактирования статьи.
- `markdownEditor` - toolbar markdown-редактора.
- `statuses` - статусы `draft`, `published`, `archived`.

Эти тексты видит только авторизованный редактор, но они тоже переключаются языком в хедере.

## Статьи блога

Основной способ менять статьи:

```text
https://d-antes.com/admin
```

После входа:

```text
https://d-antes.com/blog
```

Редактируемые поля:

- `slug` - часть URL статьи, например `/blog/my-article`.
- `title` - заголовок статьи.
- `excerpt` - краткое описание; используется в списке и SEO description.
- `content` - текст статьи.
- `author` - автор.
- `tags` - теги.
- `status` - draft/published/archived.

Поведение:

- `draft` не виден публично и не попадает в sitemap.
- `published` виден публично и попадает в sitemap.
- `archived` не должен попадать в публичный список и sitemap.
- `updatedAtUtc` используется как `lastmod` в sitemap.

## Начальные seed-статьи

Файл:

```text
apps/blog-api-dotnet/Services/BlogSeeder.cs
```

Поля внутри каждой seed-статьи:

- `Slug`
- `Title`
- `Excerpt`
- `Content`
- `Author`
- `Tags`
- `Status`
- `CreatedAtUtc`
- `UpdatedAtUtc`
- `PublishedAtUtc`

Seed запускается только когда таблица статей пустая. Если в production уже есть статьи, изменение этого файла не перезапишет существующие записи.

## Mock-данные статей

Файл:

```text
packages/api-client-ts/src/blog.ts
```

Блок:

```ts
const mockPosts: BlogPost[] = [...]
```

Используется только если фронт запущен в mock mode. В Docker production используется API mode, поэтому реальные статьи берутся из БД через `blog-api`.

## SEO

### Server-side SEO

Файл:

```text
apps/public-site-react/server.mjs
```

Что там можно менять:

- fallback `siteName`;
- fallback description для главной;
- title/description для `/blog`;
- title/description для protected editor routes;
- правила `robots.txt`;
- статические URL в sitemap: `/`, `/blog`, `/contact`;
- приоритеты sitemap;
- JSON-LD `Blog` и `Article`.

Большинство production-значений лучше задавать через env:

- `PUBLIC_BASE_URL`
- `SITE_NAME`
- `SEO_DEFAULT_LOCALE`

### Client-side SEO

Файл:

```text
apps/public-site-react/src/components/Seo.tsx
```

Там сейчас есть:

- site name для client-side meta;
- canonical URL;
- `description`;
- `robots`;
- Open Graph;
- Twitter meta;
- Article meta;
- JSON-LD.

Также в страницах есть заголовки вида `... | d-antes`:

- `apps/public-site-react/src/pages/HomePage.tsx`
- `apps/public-site-react/src/pages/ContactPage.tsx`
- `apps/public-site-react/src/pages/BlogIndexPage.tsx`
- `apps/public-site-react/src/pages/BlogArticlePage.tsx`
- `apps/public-site-react/src/pages/BlogArticlesPage.tsx`
- `apps/public-site-react/src/pages/BlogArticleEditorPage.tsx`

Если меняется бренд сайта, проверь эти места.

## Login и учётка редактора

Текст формы логина:

```text
apps/public-site-react/src/pages/LoginPage.tsx
```

Сидируемая учётка:

```text
deploy/.env.production
```

Переменные:

- `SEED_EDITOR_EMAIL`
- `SEED_EDITOR_PASSWORD`
- `SEED_EDITOR_FIRST_NAME`
- `SEED_EDITOR_LAST_NAME`

Backend seed логики пользователя:

```text
apps/api-dotnet/Services/AuthSeeder.cs
```

## Автор по умолчанию в редакторе

Файл:

```text
apps/public-site-react/src/pages/BlogArticleEditorPage.tsx
```

Текущее значение:

```ts
"Editorial Owner"
```

Это значение подставляется при создании новой статьи, но автор также редактируется вручную в форме.

## Визуальная тема

Файл стилей:

```text
apps/public-site-react/src/styles.css
```

Где менять:

- `:root` - светлая тема.
- `:root[data-theme="dark"]` - тёмная тема.
- `--background`, `--surface-muted`, `--surface-strong`, `--text`, `--text-muted`, `--line`, `--accent` - основные цвета.

Переключатель темы:

```text
apps/public-site-react/src/App.tsx
```

Выбор темы хранится в `localStorage` под ключом:

```text
site-theme
```

## Старые приложения

В репозитории всё ещё есть:

- `apps/admin-react`
- `apps/account-react`
- `apps/dashboard-react`
- `personal_page/`

Они не используются текущим production Docker-деплоем для `d-antes.com`. Не меняй пользовательские тексты там, если цель - обновить реальный сайт.

## После изменения файлов

Для локальной проверки:

```bash
npm run build --workspace @template/public-site-react
dotnet build apps/blog-api-dotnet/Blog.Api.csproj
docker compose up --build -d public-site
```

Для production:

```bash
git pull origin main
docker compose --env-file deploy/.env.production up -d --build --remove-orphans
sudo nginx -t
sudo systemctl reload nginx
```
