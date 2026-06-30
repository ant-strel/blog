import { Link, useParams } from "react-router-dom";
import { useBlogArticle } from "../hooks/useBlog";
import { localize } from "../lib/localize";

export function BlogArticlePage() {
  const { slug } = useParams();
  const locale = navigator.language.startsWith("ru") ? "ru" : "en";
  const { post, loading, error } = useBlogArticle(slug);

  if (loading) {
    return <section className="panel feedback-card">Loading article...</section>;
  }

  if (error || !post) {
    return (
      <section className="panel feedback-card">
        <p className="error-text">{error ?? "Article not found."}</p>
        <Link className="btn btn-secondary" to="/blog">
          Back to blog
        </Link>
      </section>
    );
  }

  return (
    <article className="panel article-card">
      <div className="eyebrow">{post.tags.join(" / ")}</div>
      <h1 className="article-title">{localize(post.title, locale)}</h1>
      <p className="article-meta">
        {post.author} · {new Date(post.publishedAtUtc).toLocaleDateString()}
      </p>
      <div className="article-body">
        {localize(post.content, locale)
          .split("\n")
          .filter(Boolean)
          .map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
      </div>
      <Link className="btn btn-link" to="/blog">
        Back to all posts
      </Link>
    </article>
  );
}
