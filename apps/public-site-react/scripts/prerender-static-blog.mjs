import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.resolve(appRoot, "dist");
const templatePath = path.join(distRoot, "index.html");
const articlesRoot = path.join(distRoot, "articles");
const indexPath = path.join(articlesRoot, "index.json");
const blogMode = process.env.VITE_BLOG_MODE ?? "static";

if (blogMode !== "static") {
  console.log(`Skipping static blog prerender because VITE_BLOG_MODE=${blogMode}.`);
  process.exit(0);
}

const siteName = process.env.VITE_SITE_NAME ?? "d-antes";
const defaultLocale = process.env.VITE_STATIC_DEFAULT_LOCALE ?? "en";
const publicBaseUrl = trimTrailingSlash(process.env.VITE_PUBLIC_BASE_URL ?? "https://d-antes.com");
const canonicalBaseUrl = trimTrailingSlash(process.env.VITE_CANONICAL_BASE_URL ?? publicBaseUrl);
const robotsMode = process.env.VITE_ROBOTS_MODE ?? "index-follow";
const shouldNoIndex = robotsMode === "noindex-follow";

if (!fs.existsSync(templatePath)) {
  throw new Error(`Vite index.html not found: ${templatePath}`);
}

const template = fs.readFileSync(templatePath, "utf8");
const index = fs.existsSync(indexPath)
  ? JSON.parse(fs.readFileSync(indexPath, "utf8"))
  : { generatedAtUtc: new Date().toISOString(), items: [] };
const articles = index.items.map((summary) => {
  const articlePath = path.join(articlesRoot, `${summary.slug}.json`);
  return JSON.parse(fs.readFileSync(articlePath, "utf8"));
});

writePage("blog/index.html", renderBlogIndexPage(articles));
for (const article of articles) {
  writePage(`blog/${article.slug}/index.html`, renderArticlePage(article));
}

writeSitemap(articles);
writeRobots();
writeRss(articles);

console.log(`Prerendered static blog HTML for ${articles.length} articles.`);

function renderBlogIndexPage(items) {
  const title = `Blog | ${siteName}`;
  const description = "Articles, notes and project updates.";
  const canonicalPath = "/blog";
  const itemList = items.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: canonicalUrl(`/blog/${article.slug}`),
    name: localize(article.title)
  }));

  const content = `
    <main class="public-main">
      <div class="public-container blog">
        <section class="blog-hero">
          <h1 class="title">Blog</h1>
          <p class="subtitle">${escapeHtml(description)}</p>
        </section>
        <section class="blog-list">
          ${items.map(renderArticleCard).join("\n")}
        </section>
      </div>
    </main>`;

  return renderShell({
    title,
    description,
    path: canonicalPath,
    type: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: title,
      url: canonicalUrl(canonicalPath),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: itemList
      }
    },
    content
  });
}

function renderArticlePage(article) {
  const titleText = localize(article.title);
  const description = localize(article.excerpt);
  const pagePath = `/blog/${article.slug}`;
  const content = `
    <main class="public-main">
      <div class="public-container">
        <article class="blog-post-full">
          <h1 class="article-title">${escapeHtml(titleText)}</h1>
          <div class="article-meta">${escapeHtml(article.author)} | ${formatDate(article.publishedAtUtc)}</div>
          ${renderTags(article.tags)}
          <div class="article-body">${markdownToHtml(localize(article.content))}</div>
          <footer class="article-footer">
            <a class="btn btn-text" href="/blog">Back to all posts</a>
          </footer>
        </article>
      </div>
    </main>`;

  return renderShell({
    title: `${titleText} | ${siteName}`,
    description,
    path: pagePath,
    type: "article",
    article: {
      publishedAtUtc: article.publishedAtUtc,
      updatedAtUtc: article.updatedAtUtc,
      tags: article.tags
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: titleText,
      description,
      datePublished: article.publishedAtUtc,
      dateModified: article.updatedAtUtc,
      author: {
        "@type": "Person",
        name: article.author
      },
      keywords: article.tags,
      mainEntityOfPage: canonicalUrl(pagePath)
    },
    content
  });
}

function renderShell({ title, description, path: pagePath, type, article, structuredData, content }) {
  const canonical = canonicalUrl(pagePath);
  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeAttribute(description)}">`,
    `<meta name="robots" content="${shouldNoIndex ? "noindex, follow" : "index, follow"}">`,
    `<link rel="canonical" href="${escapeAttribute(canonical)}">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:site_name" content="${escapeAttribute(siteName)}">`,
    `<meta property="og:title" content="${escapeAttribute(title)}">`,
    `<meta property="og:description" content="${escapeAttribute(description)}">`,
    `<meta property="og:url" content="${escapeAttribute(canonical)}">`,
    `<meta property="og:locale" content="${escapeAttribute(defaultLocale)}">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}">`,
    `<link rel="alternate" type="application/rss+xml" title="${escapeAttribute(siteName)}" href="/rss.xml">`,
    themeBootScript()
  ];

  if (article?.publishedAtUtc) {
    head.push(`<meta property="article:published_time" content="${escapeAttribute(article.publishedAtUtc)}">`);
  }

  if (article?.updatedAtUtc) {
    head.push(`<meta property="article:modified_time" content="${escapeAttribute(article.updatedAtUtc)}">`);
  }

  for (const tag of article?.tags ?? []) {
    head.push(`<meta property="article:tag" content="${escapeAttribute(tag)}">`);
  }

  head.push(`<script type="application/ld+json">${escapeScriptJson(structuredData)}</script>`);

  return template
    .replace(/<html([^>]*)>/, `<html$1 data-theme="light">`)
    .replace(/<title>.*?<\/title>/s, "")
    .replace("</head>", `  ${head.join("\n    ")}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

function renderArticleCard(article) {
  return `
    <article class="blog-post">
      <h2 class="post-title"><a href="/blog/${escapeAttribute(article.slug)}">${escapeHtml(localize(article.title))}</a></h2>
      <div class="post-meta">${formatDate(article.publishedAtUtc)}${article.tags.length > 0 ? ` | Tags: ${escapeHtml(article.tags.join(", "))}` : ""}</div>
      <div class="post-content"><p>${escapeHtml(localize(article.excerpt))}</p></div>
      <footer class="post-footer"><a class="btn btn-text" href="/blog/${escapeAttribute(article.slug)}">Continue reading</a></footer>
    </article>`;
}

function renderTags(tags) {
  if (tags.length === 0) {
    return "";
  }

  return `<div class="article-tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function writeSitemap(items) {
  const urls = [
    { loc: publicUrl("/"), priority: "0.8" },
    { loc: publicUrl("/blog"), priority: "0.9" },
    { loc: publicUrl("/contact"), priority: "0.4" },
    ...items.map((article) => ({
      loc: publicUrl(`/blog/${article.slug}`),
      lastmod: article.updatedAtUtc,
      priority: "0.7"
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>` : ""}\n    <priority>${url.priority}</priority>\n  </url>`).join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(distRoot, "sitemap.xml"), xml, "utf8");
}

function writeRobots() {
  const robots = shouldNoIndex
    ? `User-agent: *\nAllow: /\n\nSitemap: ${publicUrl("/sitemap.xml")}\n`
    : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /blog/editor/\nDisallow: /api/\n\nSitemap: ${publicUrl("/sitemap.xml")}\n`;

  fs.writeFileSync(path.join(distRoot, "robots.txt"), robots, "utf8");
}

function writeRss(items) {
  const channelItems = items.map((article) => `
    <item>
      <title>${escapeXml(localize(article.title))}</title>
      <link>${escapeXml(publicUrl(`/blog/${article.slug}`))}</link>
      <guid isPermaLink="true">${escapeXml(publicUrl(`/blog/${article.slug}`))}</guid>
      <description>${escapeXml(localize(article.excerpt))}</description>
      <pubDate>${new Date(article.publishedAtUtc).toUTCString()}</pubDate>
    </item>`).join("");
  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${escapeXml(siteName)}</title><description>Articles, notes and project updates.</description><link>${escapeXml(publicUrl("/"))}</link>${channelItems}\n</channel></rss>\n`;
  fs.writeFileSync(path.join(distRoot, "rss.xml"), rss, "utf8");
}

function writePage(relativePath, html) {
  const outputPath = path.join(distRoot, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, "utf8");
}

function localize(input) {
  if (typeof input === "string") {
    return input;
  }

  return input?.[defaultLocale] ?? input?.en ?? input?.ru ?? input?.es ?? "";
}

function markdownToHtml(input) {
  const blocks = input.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return blocks.map((block) => renderMarkdownBlock(block)).join("\n");
}

function renderMarkdownBlock(block) {
  const trimmed = block.trim();
  const heading = /^(#{1,4})\s+(.+)$/m.exec(trimmed);
  if (heading && trimmed.split("\n").length === 1) {
    const level = Math.min(4, Math.max(2, heading[1].length));
    return `<h${level}>${escapeHtml(heading[2])}</h${level}>`;
  }

  if (trimmed.startsWith("```")) {
    return `<pre><code>${escapeHtml(trimmed.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, ""))}</code></pre>`;
  }

  if (trimmed.split("\n").every((line) => /^[-*]\s+/.test(line))) {
    return `<ul>${trimmed.split("\n").map((line) => `<li>${renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
  }

  return `<p>${renderInlineMarkdown(trimmed.replace(/\n/g, " "))}</p>`;
}

function renderInlineMarkdown(input) {
  const escaped = escapeHtml(input);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
}

function canonicalUrl(relativePath) {
  return `${canonicalBaseUrl}${normalizePath(relativePath)}`;
}

function publicUrl(relativePath) {
  return `${publicBaseUrl}${normalizePath(relativePath)}`;
}

function normalizePath(value) {
  return value.startsWith("/") ? value : `/${value}`;
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function formatDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function themeBootScript() {
  return `<script>(function(){try{var t=localStorage.getItem("site-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}}())</script>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
