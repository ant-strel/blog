import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "../..");
const contentRoot = path.resolve(repoRoot, process.env.ARTICLE_EXPORT_DIR ?? "content/articles");
const outputRoot = path.resolve(appRoot, "public/articles");
const blogMode = process.env.VITE_BLOG_MODE ?? "static";

if (blogMode !== "static") {
  console.log(`Skipping static blog generation because VITE_BLOG_MODE=${blogMode}.`);
  process.exit(0);
}

const generatedAtUtc = new Date().toISOString();
const articles = loadArticles(contentRoot).filter((article) => article.status === "published");

fs.mkdirSync(outputRoot, { recursive: true });
deleteStaleArticleJson(outputRoot, new Set(articles.map((article) => `${article.slug}.json`).concat("index.json")));

for (const article of articles) {
  writeJson(path.join(outputRoot, `${article.slug}.json`), article);
}

writeJson(path.join(outputRoot, "index.json"), {
  generatedAtUtc,
  items: articles.map(({ content, ...summary }) => summary)
});

console.log(`Generated ${articles.length} static blog articles in ${path.relative(repoRoot, outputRoot)}.`);

function loadArticles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadArticle(path.join(root, entry.name)))
    .filter(Boolean)
    .sort((left, right) => right.publishedAtUtc.localeCompare(left.publishedAtUtc));
}

function loadArticle(articleDir) {
  const metadataPath = path.join(articleDir, "article.json");
  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  const metadata = JSON.parse(readText(metadataPath));
  const title = {};
  const excerpt = {};
  const content = {};

  for (const fileName of fs.readdirSync(articleDir).filter((name) => /^blog\.[a-z-]+\.md$/i.test(name)).sort()) {
    const document = parseMarkdownDocument(readText(path.join(articleDir, fileName)));
    const locale = document.frontMatter.locale ?? fileName.replace(/^blog\./, "").replace(/\.md$/, "");
    title[locale] = document.frontMatter.title ?? get(metadata, "Slug");
    excerpt[locale] = document.frontMatter.excerpt ?? "";
    content[locale] = document.content;
  }

  if (Object.keys(content).length === 0) {
    return null;
  }

  const updatedAtUtc = normalizeDate(get(metadata, "UpdatedAtUtc")) ?? generatedAtUtc;
  const publishedAtUtc = normalizeDate(get(metadata, "PublishedAtUtc")) ?? updatedAtUtc;

  return {
    id: get(metadata, "Id"),
    slug: get(metadata, "Slug"),
    title,
    excerpt,
    content,
    author: get(metadata, "Author") ?? "",
    status: get(metadata, "Status") ?? "draft",
    tags: get(metadata, "Tags") ?? [],
    publishedAtUtc,
    updatedAtUtc
  };
}

function parseMarkdownDocument(input) {
  const normalized = input.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    throw new Error("Markdown document is missing front matter.");
  }

  const endIndex = normalized.indexOf("\n---\n", 4);
  if (endIndex < 0) {
    throw new Error("Markdown document has invalid front matter.");
  }

  return {
    frontMatter: parseFrontMatter(normalized.slice(4, endIndex)),
    content: normalized.slice(endIndex + "\n---\n".length).trim()
  };
}

function parseFrontMatter(input) {
  const result = {};
  const lines = input.split("\n");
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim()) {
      continue;
    }

    if (line === "tags:") {
      while (index + 1 < lines.length && lines[index + 1].startsWith("  - ")) {
        index++;
      }
      continue;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    result[key] = parseScalar(rawValue);
  }

  return result;
}

function parseScalar(input) {
  if (!input) {
    return "";
  }

  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

function get(object, key) {
  return object[key] ?? object[toLowerCamel(key)];
}

function toLowerCamel(value) {
  return `${value.slice(0, 1).toLowerCase()}${value.slice(1)}`;
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function deleteStaleArticleJson(root, expectedFileNames) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json") || expectedFileNames.has(entry.name)) {
      continue;
    }

    fs.unlinkSync(path.join(root, entry.name));
  }
}
