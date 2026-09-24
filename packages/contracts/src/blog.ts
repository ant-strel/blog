export type LocaleCode = "en" | "ru" | "es";
export type LocalizedText = Partial<Record<LocaleCode, string>>;
export interface BlogPost {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  author: string;
  tags: string[];
  publishedAtUtc: string;
  updatedAtUtc: string;
}
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
