import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BlogPost } from "@template/contracts";
import { createBlogClient } from "../lib/blogClient";
import { useAuth } from "../state/AuthProvider";

const blogClient = createBlogClient();

export function BlogArticlesPage() {
  const { tokens } = useAuth();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens) return;
    blogClient.getAdminArticles(tokens.accessToken, status || undefined).then(setArticles).catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load articles.");
    });
  }, [tokens, status]);

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
      <section className="panel page-card">
        <div className="section-row">
          <div>
            <div className="eyebrow">Blog Articles</div>
            <h2>Draft, publish and archive articles from one admin surface.</h2>
          </div>
          <Link className="btn btn-primary" to="/blog/new">New article</Link>
        </div>
        <div className="filters-inline">
          <label className="field compact-field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="table-like">
          {articles.map((article) => (
            <article className="article-row" key={article.id}>
              <div>
                <strong>{typeof article.title === "string" ? article.title : article.title.en}</strong>
                <p className="muted">{article.slug} · {article.status}</p>
              </div>
              <div className="row-actions">
                <Link className="btn btn-secondary" to={`/blog/${article.id}`}>Edit</Link>
                {article.status !== "published" && (
                  <button className="btn btn-secondary" onClick={() => void publishArticle(article.id)}>Publish</button>
                )}
                {article.status !== "archived" && (
                  <button className="btn btn-secondary" onClick={() => void archiveArticle(article.id)}>Archive</button>
                )}
                <button className="btn btn-secondary" onClick={() => void deleteArticle(article.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
