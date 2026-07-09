import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const distDir = resolve(rootDir, "dist");
const indexHtml = readFileSync(join(distDir, "index.html"), "utf8");
const port = Number(process.env.PORT ?? "80");
const blogApiBaseUrl = stripTrailingSlash(process.env.BLOG_API_INTERNAL_URL ?? "http://blog-api:8080");
const authApiBaseUrl = stripTrailingSlash(process.env.AUTH_API_INTERNAL_URL ?? "http://auth-api:8080");
const publicBaseUrl = stripTrailingSlash(process.env.PUBLIC_BASE_URL ?? "http://127.0.0.1:8080");
const seoLocale = normalizeLocale(process.env.SEO_DEFAULT_LOCALE ?? "ru");
const siteName = process.env.SITE_NAME ?? "d-antes";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", publicBaseUrl);
    const pathname = decodePathname(requestUrl.pathname);

    if (pathname.startsWith("/api/auth")) {
      await proxyRequest(request, response, authApiBaseUrl);
      return;
    }

    if (pathname.startsWith("/api/blog") || pathname.startsWith("/api/admin/blog")) {
      await proxyRequest(request, response, blogApiBaseUrl);
      return;
    }

    if (pathname === "/robots.txt") {
      sendText(response, 200, renderRobots(), "text/plain; charset=utf-8");
      return;
    }

    if (pathname === "/sitemap.xml") {
      sendText(response, 200, await renderSitemap(), "application/xml; charset=utf-8");
      return;
    }

    if (serveStaticFile(pathname, response)) {
      return;
    }

    if (pathname === "/blog" || pathname === "/blog/") {
      sendHtml(response, 200, await renderBlogIndexShell());
      return;
    }

    if (pathname === "/login") {
      sendHtml(response, 404, renderShell({
        title: `Not found | ${siteName}`,
        description: "The requested page was not found.",
        canonicalPath: "/",
        noIndex: true
      }));
      return;
    }

    const articleMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
    if (articleMatch && !pathname.startsWith("/blog/editor")) {
      const html = await renderArticleShell(articleMatch[1], response);
      sendHtml(response, response.statusCode || 200, html);
      return;
    }

    if (pathname === "/admin" || pathname.startsWith("/blog/editor")) {
      sendHtml(response, 200, renderShell({
        title: `Editor area | ${siteName}`,
        description: "Protected editorial area.",
        canonicalPath: pathname,
        noIndex: true
      }));
      return;
    }

    sendHtml(response, 200, renderShell({
      title: siteName,
      description: "Personal site and blog.",
      canonicalPath: pathname
    }));
  } catch (error) {
    console.error(error);
    sendHtml(response, 500, renderShell({
      title: `Server error | ${siteName}`,
      description: "The site could not render this page.",
      canonicalPath: "/",
      noIndex: true
    }));
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`public-site listening on ${port}`);
});

async function renderBlogIndexShell() {
  const articles = await fetchPublicArticles();
  const title = `Blog | ${siteName}`;
  const description = "Articles, notes and project updates.";
  const itemList = articles.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(`/blog/${article.slug}`),
    name: localize(article.title)
  }));

  const fallbackItems = articles.map((article) => `
      <article>
        <h2><a href="/blog/${escapeAttribute(article.slug)}">${escapeHtml(localize(article.title))}</a></h2>
        <p>${escapeHtml(localize(article.excerpt))}</p>
      </article>`).join("");

  return renderShell({
    title,
    description,
    canonicalPath: "/blog",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: title,
      url: absoluteUrl("/blog"),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: itemList
      }
    },
    noscriptHtml: `
    <noscript>
      <main>
        <h1>${escapeHtml(title)}</h1>
        ${fallbackItems}
      </main>
    </noscript>`
  });
}

async function renderArticleShell(slug, response) {
  const article = await fetchPublicArticle(slug);
  if (!article) {
    response.statusCode = 404;
    return renderShell({
      title: `Article not found | ${siteName}`,
      description: "The requested article was not found.",
      canonicalPath: `/blog/${slug}`,
      noIndex: true
    });
  }

  const title = `${localize(article.title)} | ${siteName}`;
  const description = localize(article.excerpt);
  const canonicalPath = `/blog/${article.slug}`;
  const publishedAt = article.publishedAtUtc;
  const updatedAt = article.updatedAtUtc ?? article.publishedAtUtc;
  const content = localize(article.content);
  const paragraphs = content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`)
    .join("\n");

  return renderShell({
    title,
    description,
    canonicalPath,
    type: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: localize(article.title),
      description,
      datePublished: publishedAt,
      dateModified: updatedAt,
      author: {
        "@type": "Person",
        name: article.author
      },
      mainEntityOfPage: absoluteUrl(canonicalPath)
    },
    extraMeta: [
      ["article:published_time", publishedAt],
      ["article:modified_time", updatedAt],
      ...article.tags.map((tag) => ["article:tag", tag])
    ],
    noscriptHtml: `
    <noscript>
      <article>
        <h1>${escapeHtml(localize(article.title))}</h1>
        <p>${escapeHtml(description)}</p>
        <p>${escapeHtml(article.author)} | ${escapeHtml(formatDate(publishedAt))}</p>
${paragraphs}
      </article>
    </noscript>`
  });
}

function renderShell({
  title,
  description,
  canonicalPath,
  type = "website",
  noIndex = false,
  structuredData,
  extraMeta = [],
  noscriptHtml = ""
}) {
  const canonicalUrl = absoluteUrl(canonicalPath);
  const tags = [
    `<meta name="description" content="${escapeAttribute(description)}" />`,
    `<meta name="robots" content="${noIndex ? "noindex, nofollow" : "index, follow"}" />`,
    `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`,
    `<meta property="og:type" content="${escapeAttribute(type)}" />`,
    `<meta property="og:site_name" content="${escapeAttribute(siteName)}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`,
    `<meta property="og:locale" content="${seoLocale}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    ...extraMeta.map(([property, content]) =>
      `<meta property="${escapeAttribute(property)}" content="${escapeAttribute(content)}" />`
    )
  ];

  if (structuredData) {
    tags.push(`<script type="application/ld+json">${escapeScriptJson(structuredData)}</script>`);
  }

  return indexHtml
    .replace(/<html lang="[^"]*">/, `<html lang="${seoLocale}">`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace("</head>", `    ${tags.join("\n    ")}\n  </head>`)
    .replace('<div id="root"></div>', `${noscriptHtml}\n    <div id="root"></div>`);
}

async function renderSitemap() {
  const articles = await fetchPublicArticles();
  const urls = [
    { loc: absoluteUrl("/"), priority: "0.8" },
    { loc: absoluteUrl("/blog"), priority: "0.9" },
    { loc: absoluteUrl("/contact"), priority: "0.4" },
    ...articles.map((article) => ({
      loc: absoluteUrl(`/blog/${article.slug}`),
      lastmod: toSitemapDate(article.updatedAtUtc ?? article.publishedAtUtc),
      priority: "0.7"
    }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((url) => [
      "  <url>",
      `    <loc>${escapeXml(url.loc)}</loc>`,
      url.lastmod ? `    <lastmod>${escapeXml(url.lastmod)}</lastmod>` : "",
      `    <priority>${url.priority}</priority>`,
      "  </url>"
    ].filter(Boolean).join("\n")).join("\n") +
    "\n</urlset>\n";
}

function renderRobots() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /login",
    "Disallow: /blog/editor/",
    "Disallow: /api/",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    ""
  ].join("\n");
}

async function fetchPublicArticles() {
  try {
    const response = await fetch(`${blogApiBaseUrl}/api/blog`);
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return Array.isArray(payload.items) ? payload.items : [];
  } catch (error) {
    console.error("Failed to fetch public articles for SEO.", error);
    return [];
  }
}

async function fetchPublicArticle(slug) {
  try {
    const response = await fetch(`${blogApiBaseUrl}/api/blog/${encodeURIComponent(slug)}`);
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Blog API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch public article for SEO.", error);
    return null;
  }
}

async function proxyRequest(request, response, targetBaseUrl) {
  const body = await readRequestBody(request);
  const target = new URL(request.url ?? "/", targetBaseUrl);
  const proxyResponse = await fetch(target, {
    method: request.method,
    headers: filterProxyHeaders(request.headers),
    body,
    redirect: "manual"
  });

  response.writeHead(proxyResponse.status, Object.fromEntries(proxyResponse.headers.entries()));
  response.end(Buffer.from(await proxyResponse.arrayBuffer()));
}

function serveStaticFile(pathname, response) {
  const cleanPath = pathname === "/" ? "/index.html" : normalize(pathname);
  const filePath = resolve(distDir, `.${cleanPath}`);
  if (!filePath.startsWith(distDir) || !existsSync(filePath)) {
    return false;
  }

  const stats = statSync(filePath);
  if (!stats.isFile()) {
    return false;
  }

  const type = contentTypes[extname(filePath)] ?? "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stats.size,
    "Cache-Control": pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache"
  });
  createReadStream(filePath).pipe(response);
  return true;
}

function readRequestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolveBody(Buffer.concat(chunks)));
    request.on("error", rejectBody);
  });
}

function filterProxyHeaders(headers) {
  const nextHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    if (["connection", "expect", "host", "transfer-encoding"].includes(key.toLowerCase())) continue;
    nextHeaders[key] = Array.isArray(value) ? value.join(", ") : value;
  }

  return nextHeaders;
}

function sendHtml(response, status, html) {
  sendText(response, status, html, "text/html; charset=utf-8");
}

function sendText(response, status, text, contentType) {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache"
  });
  response.end(text);
}

function localize(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[seoLocale] ?? value.en ?? value.ru ?? value.es ?? Object.values(value)[0] ?? "";
}

function absoluteUrl(pathname) {
  const url = new URL(pathname, `${publicBaseUrl}/`);
  return url.toString().replace(/\/$/, pathname === "/" ? "/" : "");
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function normalizeLocale(value) {
  return ["en", "ru", "es"].includes(value) ? value : "ru";
}

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function formatDate(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function toSitemapDate(value) {
  if (!value) return "";
  return new Date(value).toISOString();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
