import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createBlogClient } from "../lib/blogClient";
import { useAuth } from "../state/AuthProvider";

const blogClient = createBlogClient();

export function BlogArticleEditorPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { tokens } = useAuth();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("Editorial Owner");
  const [tags, setTags] = useState("blog,react");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId || !tokens) return;
    blogClient.getAdminArticle(tokens.accessToken, articleId).then((article) => {
      setSlug(article.slug ?? "");
      setTitle(typeof article.title === "string" ? article.title : article.title.en ?? "");
      setExcerpt(typeof article.excerpt === "string" ? article.excerpt : article.excerpt.en ?? "");
      setContent(typeof article.content === "string" ? article.content : article.content.en ?? "");
      setAuthor(article.author ?? "Editorial Owner");
      setTags((article.tags ?? []).join(", "));
      setStatus(article.status);
    }).catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load article.");
    });
  }, [articleId, tokens]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!tokens) return;
    const payload = {
      slug,
      title,
      excerpt,
      content,
      author,
      tags: tags.split(",").map((item) => item.trim()).filter(Boolean)
    };

    try {
      if (articleId) {
        await blogClient.updateAdminArticle(tokens.accessToken, articleId, payload);
      } else {
        await blogClient.createAdminArticle(tokens.accessToken, payload);
      }
      navigate("/blog");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to save article.");
    }
  }

  return (
    <main className="admin-layout">
      <section className="panel page-card">
        <div className="section-row">
          <div>
            <div className="eyebrow">Blog Editor</div>
            <h2>{articleId ? "Edit article" : "New article"}</h2>
            {status && <p className="muted">Current status: {status}</p>}
          </div>
          <Link className="btn btn-secondary" to="/blog">Back to list</Link>
        </div>
        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field"><span>Slug</span><input value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
          <label className="field"><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="field"><span>Excerpt</span><textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} /></label>
          <label className="field"><span>Content</span><textarea className="editor-area" value={content} onChange={(event) => setContent(event.target.value)} /></label>
          <label className="field"><span>Author</span><input value={author} onChange={(event) => setAuthor(event.target.value)} /></label>
          <label className="field"><span>Tags</span><input value={tags} onChange={(event) => setTags(event.target.value)} /></label>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit">Save article</button>
        </form>
      </section>
    </main>
  );
}
