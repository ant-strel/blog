import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { BlogPost, LocaleCode, LocalizedText } from "@template/contracts";
import { MarkdownEditor } from "../components/MarkdownEditor";
import { createBlogClient } from "../lib/blogClient";
import { useAuth } from "../state/AuthProvider";

const blogClient = createBlogClient();
const locales: LocaleCode[] = ["en", "ru", "es"];
const emptyLocalizedText: LocalizedText = { en: "", ru: "", es: "" };

export function BlogArticleEditorPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { tokens } = useAuth();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [slug, setSlug] = useState("");
  const [activeLocale, setActiveLocale] = useState<LocaleCode>("en");
  const [title, setTitle] = useState<LocalizedText>({ ...emptyLocalizedText });
  const [excerpt, setExcerpt] = useState<LocalizedText>({ ...emptyLocalizedText });
  const [content, setContent] = useState<LocalizedText>({ ...emptyLocalizedText });
  const [author, setAuthor] = useState("Editorial Owner");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [publishOnSave, setPublishOnSave] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedArticleId = articleId ?? null;
  const availableTags = useMemo(
    () => Array.from(new Set(articles.flatMap((article) => article.tags))).sort(),
    [articles]
  );

  useEffect(() => {
    if (!tokens) return;
    refreshArticles().catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load articles.");
    });
  }, [tokens]);

  useEffect(() => {
    if (!tokens) return;
    if (!selectedArticleId) {
      resetForm();
      return;
    }

    setLoading(true);
    blogClient
      .getAdminArticle(tokens.accessToken, selectedArticleId)
      .then(fillForm)
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Failed to load article.");
      })
      .finally(() => setLoading(false));
  }, [articleId, tokens]);

  async function refreshArticles() {
    if (!tokens) return;
    const nextArticles = await blogClient.getAdminArticles(tokens.accessToken);
    setArticles(nextArticles);
  }

  function fillForm(article: BlogPost) {
    setSlug(article.slug ?? "");
    setTitle(toLocalizedText(article.title));
    setExcerpt(toLocalizedText(article.excerpt));
    setContent(toLocalizedText(article.content));
    setAuthor(article.author ?? "Editorial Owner");
    setTags(article.tags ?? []);
    setStatus(article.status);
    setPublishOnSave(article.status === "published");
    setError(null);
  }

  function resetForm() {
    setSlug("");
    setActiveLocale("en");
    setTitle({ ...emptyLocalizedText });
    setExcerpt({ ...emptyLocalizedText });
    setContent({ ...emptyLocalizedText });
    setAuthor("Editorial Owner");
    setTags([]);
    setNewTag("");
    setPublishOnSave(true);
    setStatus(null);
    setError(null);
  }

  function addTag(tagValue = newTag) {
    const normalizedTag = tagValue.trim();
    if (!normalizedTag || tags.includes(normalizedTag)) {
      setNewTag("");
      return;
    }

    setTags((current) => [...current, normalizedTag]);
    setNewTag("");
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!tokens) return;
    if (!title.en?.trim() || !excerpt.en?.trim() || !content.en?.trim()) {
      setError("English title, excerpt and content are required.");
      setActiveLocale("en");
      return;
    }

    const payload = {
      slug,
      title: pruneLocalizedText(title),
      excerpt: pruneLocalizedText(excerpt),
      content: pruneLocalizedText(content),
      author,
      tags
    };

    try {
      setLoading(true);
      let savedArticle: BlogPost;
      if (articleId) {
        savedArticle = await blogClient.updateAdminArticle(tokens.accessToken, articleId, payload);
      } else {
        savedArticle = await blogClient.createAdminArticle(tokens.accessToken, payload);
      }

      if (publishOnSave && savedArticle.status !== "published") {
        await blogClient.publishAdminArticle(tokens.accessToken, savedArticle.id);
      }

      await refreshArticles();
      navigate(`/blog/${savedArticle.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to save article.");
    } finally {
      setLoading(false);
    }
  }

  async function publishCurrentArticle() {
    if (!tokens || !articleId) return;
    try {
      setLoading(true);
      await blogClient.publishAdminArticle(tokens.accessToken, articleId);
      const article = await blogClient.getAdminArticle(tokens.accessToken, articleId);
      fillForm(article);
      await refreshArticles();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to publish article.");
    } finally {
      setLoading(false);
    }
  }

  async function archiveCurrentArticle() {
    if (!tokens || !articleId) return;
    try {
      setLoading(true);
      await blogClient.archiveAdminArticle(tokens.accessToken, articleId);
      const article = await blogClient.getAdminArticle(tokens.accessToken, articleId);
      fillForm(article);
      await refreshArticles();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to archive article.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCurrentArticle() {
    if (!tokens || !articleId) return;
    try {
      setLoading(true);
      await blogClient.deleteAdminArticle(tokens.accessToken, articleId);
      await refreshArticles();
      resetForm();
      navigate("/blog/new");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to delete article.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="blog-editor">
      <header className="editor-header">
        <div>
          <div className="eyebrow">Blog Editor</div>
          <h2>{articleId ? "Edit post" : "Create new post"}</h2>
        </div>
        <Link className="btn btn-secondary" to="/blog">Back to articles</Link>
      </header>

      <div className="editor-container">
        <aside className="posts-list">
          <div className="section-row compact-section-row">
            <h3>Posts</h3>
            <Link className="btn btn-secondary" to="/blog/new" onClick={resetForm}>New</Link>
          </div>
          <div className="posts-container">
            {articles.length === 0 && <p className="muted">No posts yet.</p>}
            {articles.map((article) => (
              <Link
                className={`post-item ${selectedArticleId === article.id ? "selected" : ""}`}
                key={article.id}
                to={`/blog/${article.id}`}
              >
                <h4>{typeof article.title === "string" ? article.title : article.title.en}</h4>
                <p className="post-date">
                  {new Date(article.updatedAtUtc).toLocaleDateString()} | {article.status}
                </p>
              </Link>
            ))}
          </div>
        </aside>

        <section className="post-editor">
          {loading && <p className="muted">Loading...</p>}
          <div>
            {status && <p className="muted">Current status: {status}</p>}
          </div>
          <form className="form-grid editor-form" onSubmit={onSubmit}>
            <label className="field">
              <span>Language</span>
              <div className="language-tabs">
                {locales.map((locale) => (
                  <button
                    className={`lang-tab ${activeLocale === locale ? "active" : ""}`}
                    type="button"
                    key={locale}
                    onClick={() => setActiveLocale(locale)}
                  >
                    {locale.toUpperCase()}
                  </button>
                ))}
              </div>
            </label>
            <label className="field">
              <span>Title</span>
              <input
                value={title[activeLocale] ?? ""}
                onChange={(event) => setLocalizedValue(setTitle, activeLocale, event.target.value)}
                required={activeLocale === "en"}
              />
            </label>
            <label className="field">
              <span>Excerpt</span>
              <textarea
                rows={3}
                value={excerpt[activeLocale] ?? ""}
                onChange={(event) => setLocalizedValue(setExcerpt, activeLocale, event.target.value)}
                required={activeLocale === "en"}
              />
            </label>
            <label className="field">
              <span>Content</span>
              <MarkdownEditor
                value={content[activeLocale] ?? ""}
                onChange={(value) => setLocalizedValue(setContent, activeLocale, value)}
              />
            </label>
            <div className="editor-meta-grid">
              <label className="field">
                <span>Slug</span>
                <input value={slug} onChange={(event) => setSlug(event.target.value)} required />
              </label>
              <label className="field">
                <span>Author</span>
                <input value={author} onChange={(event) => setAuthor(event.target.value)} required />
              </label>
            </div>
            <div className="field">
              <span>Tags</span>
              <div className="selected-tags">
                {tags.map((tag) => (
                  <span className="selected-tag" key={tag}>
                    {tag}
                    <button type="button" className="remove-tag" onClick={() => removeTag(tag)}>
                      x
                    </button>
                  </span>
                ))}
              </div>
              <div className="tags-input-container">
                <input
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button type="button" className="btn btn-secondary" onClick={() => addTag()}>
                  Add
                </button>
              </div>
              {availableTags.length > 0 && (
                <div className="tags-list">
                  {availableTags.map((tag) => (
                    <button
                      className={`available-tag ${tags.includes(tag) ? "selected" : ""}`}
                      type="button"
                      key={tag}
                      onClick={() => (tags.includes(tag) ? removeTag(tag) : addTag(tag))}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={publishOnSave}
                onChange={(event) => setPublishOnSave(event.target.checked)}
              />
              Publish after save
            </label>
            {error && <p className="error-text">{error}</p>}
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : publishOnSave ? "Save and publish" : "Save draft"}
              </button>
              {articleId && status !== "published" && (
                <button className="btn btn-secondary" type="button" disabled={loading} onClick={publishCurrentArticle}>
                  Publish
                </button>
              )}
              {articleId && status !== "archived" && (
                <button className="btn btn-secondary" type="button" disabled={loading} onClick={archiveCurrentArticle}>
                  Archive
                </button>
              )}
              {articleId && (
                <button className="btn btn-secondary" type="button" disabled={loading} onClick={deleteCurrentArticle}>
                  Delete
                </button>
              )}
              <Link className="btn btn-secondary" to="/blog" onClick={resetForm}>Cancel</Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function toLocalizedText(value: string | LocalizedText): LocalizedText {
  if (typeof value === "string") {
    return { ...emptyLocalizedText, en: value };
  }

  return { ...emptyLocalizedText, ...value };
}

function pruneLocalizedText(value: LocalizedText): LocalizedText {
  return Object.fromEntries(
    Object.entries(value)
      .map(([locale, text]) => [locale, text?.trim() ?? ""])
      .filter(([, text]) => text.length > 0)
  ) as LocalizedText;
}

function setLocalizedValue(
  setter: (updater: (current: LocalizedText) => LocalizedText) => void,
  locale: LocaleCode,
  value: string
) {
  setter((current) => ({
    ...current,
    [locale]: value
  }));
}
