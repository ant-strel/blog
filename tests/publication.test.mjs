import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { validateSnapshot } from "../scripts/publication-schema.mjs";

test("legacy mixed-case and Unicode slugs survive; filesystem aliases do not", () => {
  for (const slug of ["My-first-post", "Моя-статья", "café"]) {
    const value = { schemaVersion: 1, articles: [{ ...article(), slug }] };
    assert.equal(validateSnapshot(value).articles[0].slug, slug);
  }
  for (const slug of ["CON", "NUL", "LPT1", "../secret", "a/b", "a\\b", "a%2fb"]) {
    assert.throws(() => validateSnapshot({ schemaVersion: 1, articles: [{ ...article(), slug }] }));
  }
  assert.throws(() => validateSnapshot({ schemaVersion: 1, articles: [
    { ...article(), slug: "Post" }, { ...article(), slug: "post" }
  ] }));
});
import { createPages } from "../scripts/static-pages.mjs";

const article = () => ({
  slug: "public-post", title: { en: 'A <script>alert(1)</script> title' }, excerpt: { en: "Excerpt" },
  content: { en: '<img src="https://evil.example/tracker" onerror="alert(1)">' },
  author: "Public byline", tags: ["test"], publishedAtUtc: "2026-09-24T00:00:00Z", updatedAtUtc: "2026-09-24T00:00:00Z"
});
const snapshot = () => ({ schemaVersion: 1, articles: [article()] });
test("public allowlist rejects private fields and malformed input", () => {
  for (const key of ["id", "status", "notes", "variants", "password", "createdAtUtc"]) {
    const value = snapshot(); value.articles[0][key] = "PRIVATE";
    assert.throws(() => validateSnapshot(value));
  }
  for (const slug of ["../secret", "%2e%2e", "a/b", "editor", "index", "__proto__"]) {
    const value = snapshot(); value.articles[0].slug = slug;
    assert.throws(() => validateSnapshot(value));
  }
  assert.throws(() => validateSnapshot({ ...snapshot(), secret: "PRIVATE" }));
  assert.throws(() => validateSnapshot({ schemaVersion: 1, articles: [article(), article()] }));
});
test("static output escapes article input, preserves content and removes withdrawn routes", () => {
  const shell = '<html><head><title>Site</title></head><body><div id="root"></div></body></html>';
  const pages = createPages(shell, snapshot(), "https://example.com");
  const page = pages.get("blog/public-post/index.html");
  assert.ok(page.includes('http-equiv="Content-Security-Policy"'));
  assert.ok(page.includes("connect-src 'none'"));
  assert.ok(page.includes("&lt;script&gt;"));
  assert.ok(page.includes("&lt;img"));
  assert.ok(!page.includes("<img"));
  assert.ok(pages.get("sitemap.xml").includes("https://example.com/public-post"));
  assert.equal(pages.get("public-post/index.html"), page);
  const empty = createPages(shell, { schemaVersion: 1, articles: [] }, "https://example.com");
  assert.equal(empty.has("blog/public-post/index.html"), false);
  assert.ok(!empty.get("sitemap.xml").includes("public-post"));
});
test("application source contains no authentication, tracking or persistent storage", async () => {
  async function inspect(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) await inspect(path);
      else if (/\.(tsx?|css)$/.test(entry.name)) {
        const source = await readFile(path, "utf8");
        assert.doesNotMatch(source, /document\.cookie|localStorage|sessionStorage|indexedDB|sendBeacon|serviceWorker|AuthProvider|\/api\/auth|@template\/api-client-ts/);
        assert.doesNotMatch(source, /(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
        assert.doesNotMatch(source, /@import\s+url\s*\(\s*["']?https?:/);
      }
    }
  }
  await inspect(new URL("../apps/public-site-react/src/", import.meta.url));
});

test("Pages deploys only the built public artifact for the intended domain", async () => {
  const workflow = await readFile(new URL("../.github/workflows/check.yml", import.meta.url), "utf8");
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path: apps\/public-site-react\/dist/);
  assert.match(workflow, /VITE_PUBLIC_BASE_URL: https:\/\/d-antes\.com/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.doesNotMatch(workflow, /pull_request_target|blog_editor|ssh |rsync|PRIVATE_TOKEN/);
  assert.equal((await readFile(new URL("../apps/public-site-react/public/CNAME", import.meta.url), "utf8")).trim(), "d-antes.com");
});
