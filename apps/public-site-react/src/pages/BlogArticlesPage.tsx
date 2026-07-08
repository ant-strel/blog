import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BlogPost, LocaleCode } from "@template/contracts";
import { Seo } from "../components/Seo";
import { editorContent } from "../content/editorContent";
import { createBlogClient } from "../lib/blogClient";
import { localize } from "../lib/localize";
import { useAuth } from "../state/AuthProvider";

const blogClient = createBlogClient();

export function BlogArticlesPage({ locale }: { locale: LocaleCode }) {
  const { tokens, user, logout } = useAuth();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens) return;
    blogClient.getAdminArticles(tokens.accessToken, status || undefined).then(setArticles).catch((caught) => {
      setError(caught instanceof Error ? caught.message : localize(editorContent.articleList.loadError, locale));
    });
  }, [tokens, status, locale]);

  async function publishArticle(id: string) {
    if (!tokens) return;
    await blogClient.publishAdminArticle(tokens.accessToken, id);
    setArticles(await blogClient.getAdminArticles(tokens.accessToken, status || undefined));
  }

  async function archiveArticle(id: string) {
    if (!tokens) return;
    await blogClient.archiveAdminArticle(tokens.accessToken, id);
    setArticles(await blogClient.getAdminArticles(tokens.accessToken, status || undefined));
  }

  async function deleteArticle(id: string) {
    if (!tokens) return;
    await blogClient.deleteAdminArticle(tokens.accessToken, id);
    setArticles(await blogClient.getAdminArticles(tokens.accessToken, status || undefined));
  }

  return (
    <main className="admin-layout">
      <Seo
        title={`${localize(editorContent.articleList.eyebrow, locale)} | d-antes`}
        description="Protected article management page."
        path="/blog"
        locale={locale}
        noIndex
      />
      <section className="panel page-card">
        <div className="section-row">
          <div>
            <div className="eyebrow">{localize(editorContent.articleList.eyebrow, locale)}</div>
            <h2>{localize(editorContent.articleList.title, locale)}</h2>
            {user && <p className="muted">{localize(editorContent.articleList.signedInAs, locale)} {user.email}</p>}
          </div>
          <div className="row-actions">
            <Link className="btn btn-primary" to="/blog/editor/new">
              {localize(editorContent.articleList.newArticle, locale)}
            </Link>
            <button className="btn btn-secondary" type="button" onClick={() => void logout()}>
              {localize(editorContent.articleList.signOut, locale)}
            </button>
          </div>
        </div>
        <div className="filters-inline">
          <label className="field compact-field">
            <span>{localize(editorContent.articleList.status, locale)}</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">{localize(editorContent.articleList.all, locale)}</option>
              <option value="draft">{localize(editorContent.statuses.draft, locale)}</option>
              <option value="published">{localize(editorContent.statuses.published, locale)}</option>
              <option value="archived">{localize(editorContent.statuses.archived, locale)}</option>
            </select>
          </label>
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="table-like">
          {articles.map((article) => (
            <article className="article-row" key={article.id}>
              <div>
                <strong>{typeof article.title === "string" ? article.title : article.title.en}</strong>
                <p className="muted">{article.slug} · {localize(editorContent.statuses[article.status], locale)}</p>
              </div>
              <div className="row-actions">
                <Link className="btn btn-secondary" to={`/blog/editor/${article.id}`}>
                  {localize(editorContent.articleList.edit, locale)}
                </Link>
                {article.status !== "published" && (
                  <button className="btn btn-secondary" onClick={() => void publishArticle(article.id)}>
                    {localize(editorContent.articleList.publish, locale)}
                  </button>
                )}
                {article.status !== "archived" && (
                  <button className="btn btn-secondary" onClick={() => void archiveArticle(article.id)}>
                    {localize(editorContent.articleList.archive, locale)}
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => void deleteArticle(article.id)}>
                  {localize(editorContent.articleList.delete, locale)}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

