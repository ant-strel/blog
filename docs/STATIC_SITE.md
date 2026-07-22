# Static public blog

The public blog can be built as a static artifact. In this mode the browser reads
published articles from static JSON files and every public article route is
prerendered to HTML for crawlers and mirrors.

## Source of truth

Editorial writes still go through `blog-api` and PostgreSQL. Article mutations
export deterministic backups to:

```text
content/articles/<slug>/article.json
content/articles/<slug>/blog.<locale>.md
```

The static frontend build reads that backup format and generates:

```text
apps/public-site-react/public/articles/index.json
apps/public-site-react/public/articles/<slug>.json
apps/public-site-react/dist/blog/index.html
apps/public-site-react/dist/blog/<slug>/index.html
apps/public-site-react/dist/sitemap.xml
apps/public-site-react/dist/robots.txt
apps/public-site-react/dist/rss.xml
```

Only `published` articles are included in the public static JSON, prerendered
HTML, sitemap, and RSS feed.

## Build modes

Static builds read whatever is already present in `content/articles`. They do
not pull GitHub or Google Drive backups by themselves. Restore backups first
when building on a clean machine or a mirror runner.

Restore from an article Git repository:

```bash
ARTICLE_EXPORT_DIR=content/articles \
ARTICLE_RESTORE_SOURCE=git \
ARTICLE_RESTORE_REPO_DIR=/opt/backups/articles \
ARTICLE_RESTORE_GIT_URL=git@github.com:USER/articles-backup.git \
ARTICLE_EXPORT_GIT_BRANCH=main \
  bash ops/articles/restore-markdown-backups.sh
```

Restore from Google Drive instead:

```bash
ARTICLE_EXPORT_DIR=content/articles \
ARTICLE_RESTORE_SOURCE=drive \
ARTICLE_RESTORE_GOOGLE_DRIVE_REMOTE=gdrive:d-antes/articles \
  bash ops/articles/restore-markdown-backups.sh
```

Static public build:

```bash
VITE_BLOG_MODE=static \
VITE_AUTH_MODE=disabled \
VITE_PUBLIC_BASE_URL=https://d-antes.com \
VITE_CANONICAL_BASE_URL=https://d-antes.com \
VITE_ROBOTS_MODE=index-follow \
npm run build --workspace @template/public-site-react
```

Mirror build:

```bash
VITE_BLOG_MODE=static \
VITE_AUTH_MODE=disabled \
VITE_PUBLIC_BASE_URL=https://d-antes.github.io \
VITE_CANONICAL_BASE_URL=https://d-antes.com \
VITE_ROBOTS_MODE=noindex-follow \
npm run build --workspace @template/public-site-react
```

API-backed production builds can keep using:

```bash
VITE_BLOG_MODE=api
VITE_AUTH_MODE=api
```

When `VITE_BLOG_MODE` is not `static`, the static generation/prerender scripts
skip themselves so Docker API deployments do not receive static `/blog/*.html`
files that would bypass the existing Node SEO shell.

## Runtime behavior

Static mode:

- `/blog` fetches `/articles/index.json`;
- `/blog/<slug>` fetches `/articles/<slug>.json`;
- auth starts disabled, so public reads do not call auth or blog APIs;
- theme preference remains local to `localStorage`;
- prerendered article HTML contains title, description, canonical, OpenGraph,
  Twitter metadata, article timestamps, tags, and JSON-LD `BlogPosting`.

The public static site is therefore suitable for GitHub Pages, nginx static
hosting, S3/CDN, and mirror domains.
