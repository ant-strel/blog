import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPages } from "./static-pages.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "apps/public-site-react/dist");
const shell = await readFile(join(dist, "index.html"), "utf8");
const snapshot = JSON.parse(await readFile(join(root, "content/published.json"), "utf8"));
const base = process.env.VITE_PUBLIC_BASE_URL;
if (!base) throw new Error("Set VITE_PUBLIC_BASE_URL to the public HTTPS origin before building.");
for (const [path, html] of createPages(shell, snapshot, base)) {
  const target = join(dist, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
}
console.log("Generated static pages and sitemap.");
