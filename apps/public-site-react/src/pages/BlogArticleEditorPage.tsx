import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import type {
  ArticlePublicationVariant,
  PublicationExportFormat,
  PublicationPlatform,
  PublicationVariantStatus,
  BlogPost,
  LocaleCode,
  LocalizedText
} from "@template/contracts";
import { MarkdownEditor } from "../components/MarkdownEditor";
import { Seo } from "../components/Seo";
import { editorContent } from "../content/editorContent";
import { createBlogClient } from "../lib/blogClient";
import { localize } from "../lib/localize";
import { useAuth } from "../state/AuthProvider";

const blogClient = createBlogClient();
const locales: LocaleCode[] = ["en", "ru", "es"];
const publicationPlatforms: PublicationPlatform[] = ["habr", "reddit", "linkedin", "telegram", "github", "vc", "pikabu"];
const emptyLocalizedText: LocalizedText = { en: "", ru: "", es: "" };
const defaultVariantStatus: PublicationVariantStatus = "draft";
const defaultExportFormat: PublicationExportFormat = "markdown";

export function BlogArticleEditorPage({ locale }: { locale: LocaleCode }) {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { ready, tokens } = useAuth();
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
  const [publicationVariants, setPublicationVariants] = useState<ArticlePublicationVariant[]>([]);
  const [activePlatform, setActivePlatform] = useState<PublicationPlatform>("habr");
  const [variantTitle, setVariantTitle] = useState("");
  const [variantExcerpt, setVariantExcerpt] = useState("");
  const [variantContent, setVariantContent] = useState("");
  const [variantStatus, setVariantStatus] = useState<PublicationVariantStatus>(defaultVariantStatus);
  const [variantExportFormat, setVariantExportFormat] = useState<PublicationExportFormat>(defaultExportFormat);
  const [variantExternalUrl, setVariantExternalUrl] = useState("");
  const [variantNotes, setVariantNotes] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedArticleId = articleId ?? null;
  const selectedVariant = useMemo(
    () => publicationVariants.find((variant) => variant.platform === activePlatform && variant.locale === activeLocale) ?? null,
    [publicationVariants, activePlatform, activeLocale]
  );
  const availableTags = useMemo(
    () => Array.from(new Set(articles.flatMap((article) => article.tags))).sort(),
    [articles]
  );
  const markdownLabels = useMemo(
    () => ({
      toolbarLabel: localize(editorContent.markdownEditor.toolbarLabel, locale),
      bold: localize(editorContent.markdownEditor.bold, locale),
      italic: localize(editorContent.markdownEditor.italic, locale),
      heading1: localize(editorContent.markdownEditor.heading1, locale),
      heading2: localize(editorContent.markdownEditor.heading2, locale),
      quote: localize(editorContent.markdownEditor.quote, locale),
      bulletList: localize(editorContent.markdownEditor.bulletList, locale),
      numberedList: localize(editorContent.markdownEditor.numberedList, locale),
      inlineCode: localize(editorContent.markdownEditor.inlineCode, locale),
      codeBlock: localize(editorContent.markdownEditor.codeBlock, locale),
      link: localize(editorContent.markdownEditor.link, locale),
      edit: localize(editorContent.markdownEditor.edit, locale),
      preview: localize(editorContent.markdownEditor.preview, locale),
      words: localize(editorContent.markdownEditor.words, locale),
      characters: localize(editorContent.markdownEditor.characters, locale)
    }),
    [locale]
  );

  useEffect(() => {
    if (!tokens) return;
    refreshArticles().catch((caught) => {
      setError(caught instanceof Error ? caught.message : localize(editorContent.articleEditor.loadArticlesError, locale));
    });
  }, [tokens, locale]);

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
        setError(caught instanceof Error ? caught.message : localize(editorContent.articleEditor.loadArticleError, locale));
      })
      .finally(() => setLoading(false));
  }, [articleId, tokens, locale]);

  useEffect(() => {
    if (!tokens || !selectedArticleId) {
      setPublicationVariants([]);
      resetVariantForm();
      return;
    }

    refreshPublicationVariants().catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load publication variants.");
    });
  }, [selectedArticleId, tokens]);

  useEffect(() => {
    fillVariantForm(selectedVariant);
  }, [selectedVariant]);

  if (ready && !tokens) {
    return <Navigate to="/blog" replace />;
  }

  if (!ready) {
    return <section className="feedback-card">{localize(editorContent.articleEditor.loading, locale)}</section>;
  }

  async function refreshArticles() {
    if (!tokens) return;
    const nextArticles = await blogClient.getAdminArticles(tokens.accessToken);
    setArticles(nextArticles);
  }

  async function refreshPublicationVariants() {
    if (!tokens || !selectedArticleId) return;
    const variants = await blogClient.getPublicationVariants(tokens.accessToken, selectedArticleId);
    setPublicationVariants(variants);
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
    setCopyStatus(null);
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
    setPublicationVariants([]);
    resetVariantForm();
    setError(null);
  }

  function resetVariantForm() {
    setVariantTitle("");
    setVariantExcerpt("");
    setVariantContent("");
    setVariantStatus(defaultVariantStatus);
    setVariantExportFormat(defaultExportFormat);
    setVariantExternalUrl("");
    setVariantNotes("");
    setCopyStatus(null);
  }

  function fillVariantForm(variant: ArticlePublicationVariant | null) {
    if (!variant) {
      resetVariantForm();
      return;
    }

    setVariantTitle(variant.title);
    setVariantExcerpt(variant.excerpt);
    setVariantContent(variant.contentMarkdown);
    setVariantStatus(variant.status);
    setVariantExportFormat(variant.exportFormat as PublicationExportFormat);
    setVariantExternalUrl(variant.externalUrl ?? "");
    setVariantNotes(variant.notes ?? "");
    setCopyStatus(null);
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
      setError(localize(editorContent.articleEditor.validationError, locale));
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
      navigate(`/blog/editor/${savedArticle.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : localize(editorContent.articleEditor.saveError, locale));
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
      setError(caught instanceof Error ? caught.message : localize(editorContent.articleEditor.publishError, locale));
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
      setError(caught instanceof Error ? caught.message : localize(editorContent.articleEditor.archiveError, locale));
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
      navigate("/blog/editor/new");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : localize(editorContent.articleEditor.deleteError, locale));
    } finally {
      setLoading(false);
    }
  }

  function createVariantFromBlog() {
    setVariantTitle(title[activeLocale] ?? "");
    setVariantExcerpt(excerpt[activeLocale] ?? "");
    setVariantContent(content[activeLocale] ?? "");
    setVariantStatus(defaultVariantStatus);
    setVariantExportFormat(getDefaultExportFormat(activePlatform));
    setCopyStatus(null);
  }

  async function savePublicationVariant() {
    if (!tokens || !selectedArticleId) return;
    if (!variantTitle.trim() || !variantContent.trim()) {
      setError("Variant title and content are required.");
      return;
    }

    const request = {
      platform: activePlatform,
      locale: activeLocale,
      title: variantTitle,
      excerpt: variantExcerpt,
      contentMarkdown: variantContent,
      exportFormat: variantExportFormat,
      status: variantStatus,
      externalUrl: variantExternalUrl || null,
      notes: variantNotes || null
    };

    try {
      setLoading(true);
      setError(null);
      if (selectedVariant) {
        await blogClient.updatePublicationVariant(tokens.accessToken, selectedArticleId, selectedVariant.id, request);
      } else {
        await blogClient.createPublicationVariant(tokens.accessToken, selectedArticleId, request);
      }

      await refreshPublicationVariants();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to save publication variant.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePublicationVariant() {
    if (!tokens || !selectedArticleId || !selectedVariant) return;
    try {
      setLoading(true);
      await blogClient.deletePublicationVariant(tokens.accessToken, selectedArticleId, selectedVariant.id);
      await refreshPublicationVariants();
      resetVariantForm();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to delete publication variant.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPublicationVariant() {
    try {
      await navigator.clipboard.writeText(variantContent);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Clipboard is unavailable.");
    }
  }

  return (
    <main className="blog-editor">
      <Seo
        title={`${localize(editorContent.articleEditor.eyebrow, locale)} | d-antes`}
        description="Protected blog editor."
        path={articleId ? `/blog/editor/${articleId}` : "/blog/editor/new"}
        locale={locale}
        noIndex
      />
      <header className="editor-header">
        <div>
          <div className="eyebrow">{localize(editorContent.articleEditor.eyebrow, locale)}</div>
          <h2>{localize(articleId ? editorContent.articleEditor.editTitle : editorContent.articleEditor.createTitle, locale)}</h2>
        </div>
        <Link className="btn btn-secondary" to="/blog">{localize(editorContent.articleEditor.backToArticles, locale)}</Link>
      </header>

      <div className="editor-container">
        <aside className="posts-list">
          <div className="section-row compact-section-row">
            <h3>{localize(editorContent.articleEditor.posts, locale)}</h3>
            <Link className="btn btn-secondary" to="/blog/editor/new" onClick={resetForm}>
              {localize(editorContent.articleEditor.new, locale)}
            </Link>
          </div>
          <div className="posts-container">
            {articles.length === 0 && <p className="muted">{localize(editorContent.articleEditor.noPosts, locale)}</p>}
            {articles.map((article) => (
              <Link
                className={`post-item ${selectedArticleId === article.id ? "selected" : ""}`}
                key={article.id}
                to={`/blog/editor/${article.id}`}
              >
                <h4>{typeof article.title === "string" ? article.title : article.title.en}</h4>
                <p className="post-date">
                  {new Date(article.updatedAtUtc).toLocaleDateString()} | {localize(editorContent.statuses[article.status], locale)}
                </p>
              </Link>
            ))}
          </div>
        </aside>

        <section className="post-editor">
          {loading && <p className="muted">{localize(editorContent.articleEditor.loading, locale)}</p>}
          <div>
            {status && (
              <p className="muted">
                {localize(editorContent.articleEditor.currentStatus, locale)} {localize(editorContent.statuses[status as BlogPost["status"]], locale)}
              </p>
            )}
          </div>
          <form className="form-grid editor-form" onSubmit={onSubmit}>
            <label className="field">
              <span>{localize(editorContent.articleEditor.language, locale)}</span>
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
              <span>{localize(editorContent.articleEditor.title, locale)}</span>
              <input
                value={title[activeLocale] ?? ""}
                onChange={(event) => setLocalizedValue(setTitle, activeLocale, event.target.value)}
                required={activeLocale === "en"}
              />
            </label>
            <label className="field">
              <span>{localize(editorContent.articleEditor.excerpt, locale)}</span>
              <textarea
                rows={3}
                value={excerpt[activeLocale] ?? ""}
                onChange={(event) => setLocalizedValue(setExcerpt, activeLocale, event.target.value)}
                required={activeLocale === "en"}
              />
            </label>
            <label className="field">
              <span>{localize(editorContent.articleEditor.content, locale)}</span>
              <MarkdownEditor
                value={content[activeLocale] ?? ""}
                labels={markdownLabels}
                placeholder={localize(editorContent.markdownEditor.placeholder, locale)}
                onChange={(value) => setLocalizedValue(setContent, activeLocale, value)}
              />
            </label>
            <div className="editor-meta-grid">
              <label className="field">
                <span>{localize(editorContent.articleEditor.slug, locale)}</span>
                <input value={slug} onChange={(event) => setSlug(event.target.value)} required />
              </label>
              <label className="field">
                <span>{localize(editorContent.articleEditor.author, locale)}</span>
                <input value={author} onChange={(event) => setAuthor(event.target.value)} required />
              </label>
            </div>
            <div className="field">
              <span>{localize(editorContent.articleEditor.tags, locale)}</span>
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
                  {localize(editorContent.articleEditor.add, locale)}
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
              {localize(editorContent.articleEditor.publishAfterSave, locale)}
            </label>
            <section className="publication-variants">
              <div className="section-row compact-section-row">
                <div>
                  <span className="eyebrow">External variants</span>
                  <h3>Platform copy</h3>
                </div>
                {!articleId && <p className="muted">Save the article before creating platform variants.</p>}
              </div>
              <div className="language-tabs platform-tabs">
                {publicationPlatforms.map((platform) => {
                  const hasVariant = publicationVariants.some(
                    (variant) => variant.platform === platform && variant.locale === activeLocale
                  );
                  return (
                    <button
                      className={`lang-tab ${activePlatform === platform ? "active" : ""} ${hasVariant ? "has-variant" : ""}`}
                      type="button"
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                    >
                      {formatPlatformName(platform)}
                    </button>
                  );
                })}
              </div>
              <div className="variant-editor-grid">
                <label className="field">
                  <span>Variant title</span>
                  <input
                    value={variantTitle}
                    disabled={!articleId}
                    onChange={(event) => setVariantTitle(event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Status</span>
                  <select
                    value={variantStatus}
                    disabled={!articleId}
                    onChange={(event) => setVariantStatus(event.target.value as PublicationVariantStatus)}
                  >
                    <option value="draft">Draft</option>
                    <option value="ready">Ready</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="field">
                  <span>Export format</span>
                  <select
                    value={variantExportFormat}
                    disabled={!articleId}
                    onChange={(event) => setVariantExportFormat(event.target.value as PublicationExportFormat)}
                  >
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="plain">Plain text</option>
                    <option value="telegram_html">Telegram HTML</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Variant excerpt</span>
                <textarea
                  rows={2}
                  value={variantExcerpt}
                  disabled={!articleId}
                  onChange={(event) => setVariantExcerpt(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Variant content</span>
                <MarkdownEditor
                  value={variantContent}
                  labels={markdownLabels}
                  placeholder="Adapt the article for this platform..."
                  onChange={setVariantContent}
                />
              </label>
              <div className="variant-editor-grid">
                <label className="field">
                  <span>Published URL</span>
                  <input
                    value={variantExternalUrl}
                    disabled={!articleId}
                    onChange={(event) => setVariantExternalUrl(event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Notes</span>
                  <input
                    value={variantNotes}
                    disabled={!articleId}
                    onChange={(event) => setVariantNotes(event.target.value)}
                  />
                </label>
              </div>
              <p className="muted">
                Words: {countWords(variantContent)} | Characters: {variantContent.length}
                {selectedVariant ? ` | Saved variant: ${selectedVariant.status}` : " | No saved variant yet"}
              </p>
              {copyStatus && <p className="muted">{copyStatus}</p>}
              <div className="form-actions">
                <button className="btn btn-secondary" type="button" disabled={!articleId || loading} onClick={createVariantFromBlog}>
                  Create from blog
                </button>
                <button className="btn btn-primary" type="button" disabled={!articleId || loading} onClick={() => void savePublicationVariant()}>
                  Save variant
                </button>
                <button className="btn btn-secondary" type="button" disabled={!variantContent} onClick={() => void copyPublicationVariant()}>
                  Copy
                </button>
                {selectedVariant && (
                  <button className="btn btn-secondary" type="button" disabled={loading} onClick={() => void deletePublicationVariant()}>
                    Delete variant
                  </button>
                )}
              </div>
            </section>
            {error && <p className="error-text">{error}</p>}
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading
                  ? localize(editorContent.articleEditor.saving, locale)
                  : publishOnSave
                    ? localize(editorContent.articleEditor.saveAndPublish, locale)
                    : localize(editorContent.articleEditor.saveDraft, locale)}
              </button>
              {articleId && status !== "published" && (
                <button className="btn btn-secondary" type="button" disabled={loading} onClick={publishCurrentArticle}>
                  {localize(editorContent.articleEditor.publish, locale)}
                </button>
              )}
              {articleId && status !== "archived" && (
                <button className="btn btn-secondary" type="button" disabled={loading} onClick={archiveCurrentArticle}>
                  {localize(editorContent.articleEditor.archive, locale)}
                </button>
              )}
              {articleId && (
                <button className="btn btn-secondary" type="button" disabled={loading} onClick={deleteCurrentArticle}>
                  {localize(editorContent.articleEditor.delete, locale)}
                </button>
              )}
              <Link className="btn btn-secondary" to="/blog" onClick={resetForm}>
                {localize(editorContent.articleEditor.cancel, locale)}
              </Link>
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

function formatPlatformName(platform: string): string {
  if (platform === "vc") return "VC";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function getDefaultExportFormat(platform: PublicationPlatform): PublicationExportFormat {
  if (platform === "linkedin") return "plain";
  if (platform === "telegram") return "telegram_html";
  return "markdown";
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

