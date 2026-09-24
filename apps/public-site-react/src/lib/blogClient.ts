import type { BlogPost, LocaleCode, PaginatedResult } from "@template/contracts";
import snapshot from "../../../../content/published.json";

// Build-validated public data. No network or credentials are needed to read it.
const articles: BlogPost[] = [...snapshot.articles].sort((a: BlogPost, b: BlogPost) =>
  Date.parse(b.publishedAtUtc) - Date.parse(a.publishedAtUtc) || a.slug.localeCompare(b.slug));

export function createBlogClient() {
  return {
    async getPosts(query: { page?: number; limit?: number; search?: string; locale?: LocaleCode; publishedOnly?: boolean }): Promise<PaginatedResult<BlogPost>> {
      const needle = (query.search ?? "").trim().toLocaleLowerCase();
      const filtered = articles.filter(post => (!query.locale ||
        (post.title[query.locale]?.trim() && post.excerpt[query.locale]?.trim())) && (!needle ||
        [...Object.values(post.title), ...Object.values(post.excerpt), ...Object.values(post.content), ...post.tags]
          .some(text => text?.toLocaleLowerCase().includes(needle))));
      const limit = Math.max(1, Math.min(100, Math.trunc(query.limit ?? 6)));
      const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
      const page = Math.max(1, Math.min(totalPages, Math.trunc(query.page ?? 1)));
      return { items: filtered.slice((page - 1) * limit, page * limit), total: filtered.length, page, limit, totalPages, hasMore: page < totalPages };
    },
    async getPostBySlug(slug: string): Promise<BlogPost> {
      const post = articles.find(article => article.slug === slug);
      if (!post) throw new Error("Article not found.");
      return post;
    }
  };
}
