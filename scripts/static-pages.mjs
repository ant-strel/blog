import { validateSnapshot } from "./publication-schema.mjs";
import { renderContactContent, markdownToHtml, contactContent } from "./public-content.mjs";

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
const localize = value => value.en ?? value.ru ?? value.es ?? "";

export function createPages(shell, input, base) {
  // GitHub Pages does not use our own nginx or custom response headers.
  // Apply supported browser policy in HTML; frame-ancestors needs an HTTP header
  // and is intentionally not claimed here. Dev/HMR shell remains unaffected.
  shell = shell.replace("<head>", `<head><meta name="referrer" content="no-referrer" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'" />`);
  const { articles } = validateSnapshot(input);
  const origin = new URL(base);
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("VITE_PUBLIC_BASE_URL must be a public HTTPS origin");
  }
  const html = (title, path, description, fallback, noIndex = false) => shell
    .replace(/<title>.*?<\/title>/, "<title>" + escapeHtml(title) + "</title>")
    .replace("</head>", '<meta name="description" content="' + escapeHtml(description) + '" />' +
      '<meta name="robots" content="' + (noIndex ? "noindex" : "index, follow") + '" />' +
      '<link rel="canonical" href="' + escapeHtml(new URL(path, origin).href) + '" />' +
      '<meta property="og:title" content="' + escapeHtml(title) + '" />' +
      '<meta property="og:description" content="' + escapeHtml(description) + '" />' +
      '<meta property="og:url" content="' + escapeHtml(new URL(path, origin).href) + '" />' +
      '<meta property="og:site_name" content="d-antes" /><meta name="twitter:card" content="summary" />' +
      '<link rel="alternate" type="application/rss+xml" title="d-antes" href="/rss.xml" /></head>')
    .replace('<div id="root"></div>', '<div id="root"><div class="public-layout">' +
      '<header class="public-header"><div class="public-container header-inner"><a class="logo" href="/">d-antes</a><nav class="public-nav"><a href="/">Blog</a><a href="/contact">Contacts</a></nav></div></header>' +
      '<main class="public-main"><div class="public-container">' + fallback + '</div></main>' +
      '<footer class="public-footer"><div class="public-container">Anton Strelnikov (d-antes). Journals. Archives. Notes. No cookies or trackers. · <a href="/privacy">Privacy</a></div></footer></div></div>');
  const pages = new Map();
  const links = articles.filter(a => a.title.en?.trim() && a.excerpt.en?.trim()).map(a =>
    '<article class="blog-post"><h2 class="post-title"><a href="/' + a.slug + '">' + escapeHtml(localize(a.title)) +
    '</a></h2><div class="post-content"><p>' + escapeHtml(localize(a.excerpt)) + '</p></div></article>').join("");
  pages.set("index.html", html("Blog | d-antes", "/", "Articles, field notes, launch retrospectives, and decisions made in public.",
    '<div class="blog"><section class="blog-list">' + (links || '<section class="feedback-card">No articles match this query.</section>') + '</section></div>'));
  // Compatibility with links from the split; the historical canonical URL is /.
  pages.set("blog/index.html", pages.get("index.html"));
  pages.set("contact/index.html", html("Contacts | d-antes", "/contact", localize(contactContent.subtitle), renderContactContent()));
  pages.set("privacy/index.html", html("Privacy | d-antes", "/privacy", "No cookies, tracking or persistent browser storage.", '<h1>Privacy</h1><p>No cookies, tracking or persistent browser storage are used by this application. Server and proxy logs are configured separately.</p><a href="https://github.com/ant-strel/blog" rel="noreferrer">Source code</a>'));
  pages.set("404.html", html("Not found", "/", "Page not found.", '<h1>404</h1><a href="/">Home</a>', true));
  for (const article of articles) {
    const title = localize(article.title);
    const content = markdownToHtml(localize(article.content));
    const page = html(title + " | d-antes", "/" + article.slug,
      localize(article.excerpt), '<article class="blog-post-full"><h1 class="article-title">' + escapeHtml(title) + '</h1><p>' + escapeHtml(article.author) + '</p><div class="article-body">' + content + '</div><a href="/">Back to all posts</a></article>');
    pages.set(article.slug + "/index.html", page);
    pages.set("blog/" + article.slug + "/index.html", page);
  }
  const urls = ["/", "/contact", "/privacy", ...articles.map(a => "/" + a.slug)];
  pages.set("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(path => "<url><loc>" + escapeHtml(new URL(path, origin).href) + "</loc></url>").join("") + "</urlset>\n");
  pages.set("robots.txt", "User-agent: *\nAllow: /\nSitemap: " + new URL("/sitemap.xml", origin).href + "\n");
  pages.set("rss.xml", '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>d-antes</title><description>Articles, notes and project updates.</description><link>' + escapeHtml(origin.href) + '</link>' +
    articles.map(a => '<item><title>' + escapeHtml(localize(a.title)) + '</title><link>' + escapeHtml(new URL('/' + a.slug, origin).href) + '</link><guid isPermaLink="true">' + escapeHtml(new URL('/' + a.slug, origin).href) + '</guid><description>' + escapeHtml(localize(a.excerpt)) + '</description><pubDate>' + new Date(a.publishedAtUtc).toUTCString() + '</pubDate></item>').join('') + '</channel></rss>\n');
  return pages;
}
