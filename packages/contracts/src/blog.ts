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

export type PublicationPlatform =
  | "habr"
  | "reddit"
  | "linkedin"
  | "telegram"
  | "github"
  | "vc"
  | "pikabu";

export type PublicationVariantStatus = "draft" | "ready" | "published" | "archived";

export type PublicationExportFormat = "markdown" | "html" | "plain" | "telegram_html";

export interface ArticlePublicationVariant {
  id: string;
  articleId: string;
  platform: PublicationPlatform | string;
  locale: LocaleCode | string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  exportFormat: PublicationExportFormat | string;
  status: PublicationVariantStatus;
  externalUrl?: string | null;
  notes?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  publishedAtUtc?: string | null;
}

export interface ArticlePublicationVariantInput {
  platform: PublicationPlatform | string;
  locale: LocaleCode | string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  exportFormat: PublicationExportFormat | string;
  status: PublicationVariantStatus;
  externalUrl?: string | null;
  notes?: string | null;
}

export interface MarkdownExportResult {
  rootPath: string;
  articleCount: number;
  fileCount: number;
  exportedAtUtc: string;
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
