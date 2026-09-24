import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSnapshot } from "./publication-schema.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "apps/public-site-react/dist");
const snapshot = validateSnapshot(JSON.parse(await readFile(join(root, "content/published.json"), "utf8")));
assert.equal((await readFile(join(dist, "CNAME"), "utf8")).trim(), "d-antes.com");
await stat(join(dist, ".nojekyll"));
for (const file of ["index.html", "blog/index.html", "contact/index.html", "privacy/index.html", "404.html",
  ...snapshot.articles.flatMap(article => [article.slug + "/index.html", "blog/" + article.slug + "/index.html"])]) {
  const html = await readFile(join(dist, file), "utf8");
  assert.match(html, /https:\/\/d-antes\.com/);
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  assert.ok(html.includes("connect-src 'none'"));
}
assert.match(await readFile(join(dist, "sitemap.xml"), "utf8"), /https:\/\/d-antes\.com/);
async function inspect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), "Pages artifact must not contain symlinks");
    assert.ok(!/^(\.git|\.env.*|node_modules|deploy|shared|tests|api|admin|editor)$/.test(entry.name), "Non-public build artifact");
    if (entry.isDirectory()) await inspect(join(dir, entry.name));
    else assert.ok(entry.name === "CNAME" || entry.name === ".nojekyll" || /\.(html|js|css|xml|txt|svg|png|ico|webp)$/.test(entry.name));
  }
}
await inspect(dist);
console.log("PASS: GitHub Pages artifact, production policy, domain and direct routes");
