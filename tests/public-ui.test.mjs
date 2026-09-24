import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { createPages } from "../scripts/static-pages.mjs";
import { validateSnapshot } from "../scripts/publication-schema.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const contact = JSON.parse(await readFile(new URL("../apps/public-site-react/src/content/contactContent.json", import.meta.url), "utf8"));
const fixture = {
  slug: "test-post", title: { en: "English post" }, excerpt: { en: "Excerpt" },
  content: { en: "## Heading\n\n**Bold**\n\n1. First\n2. Second" }, author: "Author", tags: [],
  publishedAtUtc: "2026-09-24T00:00:00Z", updatedAtUtc: "2026-09-24T00:00:00Z"
};
// Exercise the real React components and client with in-memory publication data.
// Nothing is written to the production snapshot or to the build directory.
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, platform: "node", format: "cjs", jsx: "automatic",
  define: { "import.meta.env": JSON.stringify({ VITE_PUBLIC_BASE_URL: "https://d-antes.com" }) },
  stdin: { loader: "tsx", resolveDir: root, contents: `
    import { renderToStaticMarkup } from 'react-dom/server';
    import { MemoryRouter } from 'react-router-dom';
    import App from './apps/public-site-react/src/App';
    import { ContactPage } from './apps/public-site-react/src/pages/ContactPage';
    import { MarkdownContent } from './apps/public-site-react/src/components/MarkdownContent';
    export { createBlogClient } from './apps/public-site-react/src/lib/blogClient';
    export const renderApp = (path) => renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
    export const renderContact = (locale) => renderToStaticMarkup(<ContactPage locale={locale} />);
    export const renderMarkdown = (content) => renderToStaticMarkup(<MarkdownContent content={content} />);
  ` },
  plugins: [{ name: "publication-fixture", setup(builder) {
    builder.onLoad({ filter: /content[\\/]published\.json$/ }, () => ({ loader: "json", contents: JSON.stringify({ schemaVersion: 1, articles: [fixture] }) }));
  } }]
});
const module = { exports: {} };
new Function("module", "exports", "require", bundle.outputFiles[0].text)(module, module.exports, createRequire(import.meta.url));
const ui = module.exports;
globalThis.window = { matchMedia: () => ({ matches: false }), location: { origin: "https://d-antes.com" } };
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { language: "ru-RU" } });

test("static_site navigation, root blog, locale order and footer are retained", () => {
  const html = ui.renderApp("/");
  const nav = html.match(/<nav class="public-nav">(.*?)<\/nav>/)[1];
  assert.match(nav, /href="\/"[^>]*>Блог/);
  assert.match(nav, /href="\/contact"[^>]*>Контакты/);
  assert.doesNotMatch(nav, /Главная|admin|editor/);
  assert.match(html, /type="search"/);
  assert.doesNotMatch(html, /home-intro|feature-article|blog-hero/);
  assert.ok(html.indexOf('value="ru"') < html.indexOf('value="en"'));
  assert.ok(html.indexOf('value="en"') < html.indexOf('value="es"'));
  assert.match(html, /Антон Стрельников/);
  assert.match(html, /Никаких кук и трекеров/);
});

test("contact page retains the real contact channels and complete localized resume", () => {
  assert.deepEqual(contact.methods.map(m => m.href), [
    "mailto:ant.strel.2016@gmail.com", "https://github.com/ant-strel",
    "https://www.linkedin.com/in/anton-strelnikov", "https://t.me/ant_str"
  ]);
  for (const locale of ["ru", "en", "es"]) {
    const html = ui.renderContact(locale);
    assert.ok(html.includes(contact.resume.name[locale]));
    assert.equal((html.match(/class="resume-skill"/g) ?? []).length, 6);
    for (const method of contact.methods) assert.ok(html.includes(method.href));
    assert.doesNotMatch(html, /hello@d-antes\.dev|dantes_dev|signal\.me/);
  }
});

test("localized listings filter before pagination and Markdown renders without raw HTML", async () => {
  const client = ui.createBlogClient();
  assert.equal((await client.getPosts({ locale: "ru" })).total, 0);
  assert.equal((await client.getPosts({ locale: "en" })).total, 1);
  assert.equal((await client.getPosts({ locale: "en", search: "missing" })).total, 0);
  const html = ui.renderMarkdown(fixture.content.en + '\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert)');
  assert.match(html, /<h2>Heading<\/h2>/);
  assert.match(html, /<strong>Bold<\/strong>/);
  assert.match(html, /<ol><li>First<\/li><li>Second<\/li><\/ol>/);
  assert.doesNotMatch(html, /<img|href="javascript:/);
});

test("direct HTML retains resume, navigation, Markdown, original URLs and RSS", () => {
  const pages = createPages('<html><head><title>Site</title></head><body><div id="root"></div></body></html>', { schemaVersion: 1, articles: [fixture] }, "https://d-antes.com");
  const html = pages.get("contact/index.html");
  for (const method of contact.methods) assert.ok(html.includes(method.href));
  assert.match(html, /Full-stack .NET &amp; Windows Desktop Engineer/);
  assert.match(html, /class="resume-skills"/);
  assert.match(pages.get("index.html"), /href="\/test-post"/);
  assert.match(pages.get("test-post/index.html"), /<h2>Heading<\/h2>/);
  assert.match(pages.get("rss.xml"), /https:\/\/d-antes.com\/test-post/);
  assert.equal(pages.get("test-post/index.html"), pages.get("blog/test-post/index.html"));
  for (const slug of ["contact", "privacy", "blog", "assets", "favicons", "api"]) {
    assert.throws(() => validateSnapshot({ schemaVersion: 1, articles: [{ ...fixture, slug }] }));
  }
});
