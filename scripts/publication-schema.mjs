const articleFields = ["slug", "title", "excerpt", "content", "author", "tags", "publishedAtUtc", "updatedAtUtc"];
const locales = ["en", "ru", "es"];

function object(value, fields, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(label + " must be an object");
  const keys = Object.keys(value);
  if (keys.some(key => !fields.includes(key))) throw new Error(label + " contains non-public fields");
  if (fields.some(key => !Object.hasOwn(value, key))) throw new Error(label + " is missing fields");
}

function text(value, label, max = 1_000_000) {
  if (typeof value !== "string" || value.length > max) throw new Error(label + " must be bounded text");
  return value;
}

function localized(value, label, required) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(label + " must be localized text");
  const keys = Object.keys(value);
  if (!keys.length || keys.some(key => !locales.includes(key))) throw new Error(label + " has invalid locales");
  const result = {};
  for (const key of keys) result[key] = text(value[key], label);
  if (required && !keys.some(key => result[key].trim())) throw new Error(label + " must not be empty");
  return result;
}

function timestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error("Expected an explicit UTC publication timestamp");
  }
  return new Date(value).toISOString();
}

export function validateSnapshot(snapshot) {
  object(snapshot, ["schemaVersion", "articles"], "Snapshot");
  if (snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.articles) || snapshot.articles.length > 10000) {
    throw new Error("Invalid snapshot version or articles");
  }
  const slugs = new Set();
  const articles = snapshot.articles.map(article => {
    object(article, articleFields, "Article");
    const slug = text(article.slug, "Slug", 160);
    // Preserve existing mixed-case and Unicode URLs, but reject paths and
    // filesystem aliases (including case-insensitive and Windows collisions).
    const slugKey = slug.normalize("NFC").toLowerCase();
    if (!/^[\p{L}\p{N}][\p{L}\p{N}\p{M}_-]*$/u.test(slug) ||
        ["editor", "new", "admin", "index", "blog", "contact", "privacy", "assets", "favicons", "api", "con", "prn", "aux", "nul", "clock$"].includes(slugKey) ||
        /^(com|lpt)[1-9]$/.test(slugKey) || slugs.has(slugKey)) {
      throw new Error("Invalid, reserved, or duplicate article slug");
    }
    slugs.add(slugKey);
    if (!Array.isArray(article.tags) || article.tags.length > 100) throw new Error("Invalid tags");
    return {
      slug,
      title: localized(article.title, "Title", true),
      excerpt: localized(article.excerpt, "Excerpt", false),
      content: localized(article.content, "Content", true),
      author: text(article.author, "Author", 128),
      tags: article.tags.map(tag => text(tag, "Tag", 100)),
      publishedAtUtc: timestamp(article.publishedAtUtc),
      updatedAtUtc: timestamp(article.updatedAtUtc)
    };
  });
  articles.sort((a, b) => b.publishedAtUtc.localeCompare(a.publishedAtUtc) || a.slug.localeCompare(b.slug));
  return { schemaVersion: 1, articles };
}
