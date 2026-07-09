import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { LocaleCode } from "@template/contracts";
import { useBlogIndex } from "../hooks/useBlog";
import { useAuth } from "../state/AuthProvider";
import { BlogArticlesPage } from "./BlogArticlesPage";
import { Seo } from "../components/Seo";
import { siteContent } from "../content/siteContent";
import { localize } from "../lib/localize";

export function BlogIndexPage({ locale }: { locale: LocaleCode }) {
  const { ready, tokens } = useAuth();
  if (!ready) {
    return <section className="feedback-card">{localize(siteContent.blog.loading, locale)}</section>;
  }

  if (tokens) {
    return <BlogArticlesPage locale={locale} />;
  }

  return <PublicBlogIndex locale={locale} />;
}

function PublicBlogIndex({ locale }: { locale: LocaleCode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const query = searchParams.get("q") ?? "";
  const { data, loading, error } = useBlogIndex(page, query);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextQuery = String(formData.get("q") ?? "").trim();
    setSearchParams(nextQuery ? { q: nextQuery, page: "1" } : { page: "1" });
  }

  return (
    <div className="blog">
      <Seo
        title={`${localize(siteContent.blog.title, locale)} | d-antes`}
        description={localize(siteContent.blog.subtitle, locale)}
        path="/blog"
        locale={locale}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${localize(siteContent.blog.title, locale)} | d-antes`,
          url: new URL("/blog", window.location.origin).toString()
        }}
      />
      <section className="blog-hero">
        <h1 className="title">{localize(siteContent.blog.title, locale)}</h1>
        <p className="subtitle">{localize(siteContent.blog.subtitle, locale)}</p>
      </section>

      <form className="blog-search" onSubmit={submitSearch}>
        <label className="field">
          <span>{localize(siteContent.blog.searchLabel, locale)}</span>
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder={localize(siteContent.blog.searchPlaceholder, locale)}
          />
        </label>
        <button className="btn btn-primary" type="submit">
          {localize(siteContent.blog.searchSubmit, locale)}
        </button>
      </form>

      {loading && <section className="feedback-card">{localize(siteContent.blog.loading, locale)}</section>}
      {error && !loading && <section className="feedback-card error-text">{error}</section>}

      {!loading && data && (
        <>
          <section className="blog-list">
            {data.items.length === 0 && (
              <section className="feedback-card">{localize(siteContent.blog.searchEmpty, locale)}</section>
            )}
            {data.items.map((post) => (
              <article className="blog-post" key={post.id}>
                <h2 className="post-title">
                  <Link to={`/blog/${post.slug}`}>{localize(post.title, locale)}</Link>
                </h2>
                <div className="post-meta">
                  {new Date(post.publishedAtUtc).toLocaleDateString()}
                  {post.tags.length > 0 && (
                    <span> | {localize(siteContent.blog.tagsLabel, locale)} {post.tags.join(", ")}</span>
                  )}
                </div>
                <div className="post-content">
                  <p>{localize(post.excerpt, locale)}</p>
                </div>
                <footer className="post-footer">
                  <Link className="btn btn-text" to={`/blog/${post.slug}`}>
                    {localize(siteContent.blog.continueReading, locale)}
                  </Link>
                </footer>
              </article>
            ))}
          </section>

          <footer className="blog-pagination">
            <button
              className="btn btn-outline pagination-button"
              disabled={page <= 1}
              onClick={() => setSearchParams(query ? { q: query, page: String(page - 1) } : { page: String(page - 1) })}
            >
              {localize(siteContent.blog.previous, locale)}
            </button>
            <span className="pagination-info">{data.page} / {data.totalPages}</span>
            <button
              className="btn btn-outline pagination-button"
              disabled={!data.hasMore}
              onClick={() => setSearchParams(query ? { q: query, page: String(page + 1) } : { page: String(page + 1) })}
            >
              {localize(siteContent.blog.next, locale)}
            </button>
          </footer>
        </>
      )}
    </div>
  );
}
