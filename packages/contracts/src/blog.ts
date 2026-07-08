export type LocaleCode = "en" | "ru" | "es";

export type LocalizedText = Partial<Record<LocaleCode, string>>;

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string | LocalizedText;
  excerpt: string | LocalizedText;
  coverImage?: string;
  author: string;
  tags: string[];
  publishedAtUtc: string;
  updatedAtUtc: string;
}

export interface BlogPost extends BlogPostSummary {
  content: string | LocalizedText;
  status: "draft" | "published" | "archived";
}

export interface BlogPostQuery {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
  locale?: LocaleCode;
  publishedOnly?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
