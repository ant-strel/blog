import { Link, useParams } from "react-router-dom";
import type { LocaleCode } from "@template/contracts";
import { Seo } from "../components/Seo";
import { useBlogArticle } from "../hooks/useBlog";
import { siteContent } from "../content/siteContent";
import { localize } from "../lib/localize";

export function BlogArticlePage({ locale }: { locale: LocaleCode }) {
  const { slug } = useParams();
  const { post, loading, error } = useBlogArticle(slug);

  if (loading) {
    return <section className="feedback-card">{localize(siteContent.article.loading, locale)}</section>;
  }

  if (error || !post) {
    return (
      <section className="feedback-card">
        <p className="error-text">{error ?? localize(siteContent.article.notFound, locale)}</p>
        <Link className="btn btn-outline" to="/blog">
          {localize(siteContent.article.backToBlog, locale)}
        </Link>
      </section>
    );
  }

  return (
    <article className="blog-post-full">
      <Seo
        title={`${localize(post.title, locale)} | d-antes`}
        description={localize(post.excerpt, locale)}
        path={`/blog/${post.slug}`}
        locale={locale}
        type="article"
        articleMeta={{
          publishedAtUtc: post.publishedAtUtc,
          updatedAtUtc: post.updatedAtUtc,
          tags: post.tags
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: localize(post.title, locale),
          description: localize(post.excerpt, locale),
          datePublished: post.publishedAtUtc,
          dateModified: post.updatedAtUtc,
          author: {
            "@type": "Person",
            name: post.author
          },
          mainEntityOfPage: new URL(`/blog/${post.slug}`, window.location.origin).toString()
        }}
      />
      <h1 className="article-title">{localize(post.title, locale)}</h1>
      <div className="article-meta">
        {post.author} | {new Date(post.publishedAtUtc).toLocaleDateString()}
      </div>
      {post.tags.length > 0 && (
        <div className="article-tags">
          {post.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="article-body">
        {localize(post.content, locale)
          .split("\n")
          .filter(Boolean)
          .map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
      </div>
      <footer className="article-footer">
        <Link className="btn btn-text" to="/blog">
          {localize(siteContent.article.backToAllPosts, locale)}
        </Link>
      </footer>
    </article>
  );
}
