import { Link, useSearchParams } from "react-router-dom";
import { useBlogIndex } from "../hooks/useBlog";
import { localize } from "../lib/localize";

export function BlogIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const locale = navigator.language.startsWith("ru") ? "ru" : "en";
  const { data, loading, error } = useBlogIndex(page);

  return (
    <main className="blog-layout">
      <section className="blog-title">
        <div className="eyebrow">Blog Surface</div>
        <h1 className="headline">Signal, not CMS sprawl.</h1>
        <p className="muted">
          Public articles stay readable and SSR-friendly, while the authoring system remains behind
          auth and outside the landing stack.
        </p>
      </section>

      {loading && <section className="panel feedback-card">Loading blog posts...</section>}
      {error && !loading && <section className="panel feedback-card error-text">{error}</section>}

      {!loading && data && (
        <>
          <section className="blog-grid">
            {data.items.map((post) => (
              <article className="panel post-card" key={post.id}>
                <div className="post-topline">
                  <span>{new Date(post.publishedAtUtc).toLocaleDateString()}</span>
                  <span>{post.tags.join(" / ")}</span>
                </div>
                <h2>{localize(post.title, locale)}</h2>
                <p className="muted">{localize(post.excerpt, locale)}</p>
                <div className="post-footer-row">
                  <span>{post.author}</span>
                  <Link className="btn btn-link" to={`/blog/${post.slug}`}>
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </section>

          <footer className="pagination-row">
            <button
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setSearchParams({ page: String(page - 1) })}
            >
              Previous
            </button>
            <span className="muted">
              Page {data.page} / {data.totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={!data.hasMore}
              onClick={() => setSearchParams({ page: String(page + 1) })}
            >
              Next
            </button>
          </footer>
        </>
      )}
    </main>
  );
}
