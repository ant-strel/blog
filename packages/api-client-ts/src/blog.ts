import type {
  ArticlePublicationVariant,
  ArticlePublicationVariantInput,
  BlogPost,
  BlogPostQuery,
  LocalizedText,
  PaginatedResult
} from "@template/contracts";

export interface CreateAdminArticleRequest {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  author: string;
  tags: string[];
}

export interface UpdateAdminArticleRequest extends CreateAdminArticleRequest {}

export interface BlogClient {
  getPosts(query?: BlogPostQuery): Promise<PaginatedResult<BlogPost>>;
  getPostBySlug(slug: string): Promise<BlogPost>;
  getDrafts(accessToken: string): Promise<BlogPost[]>;
  getAdminArticles(accessToken: string, status?: string): Promise<BlogPost[]>;
  getAdminArticle(accessToken: string, id: string): Promise<BlogPost>;
  createAdminArticle(accessToken: string, request: CreateAdminArticleRequest): Promise<BlogPost>;
  updateAdminArticle(accessToken: string, id: string, request: UpdateAdminArticleRequest): Promise<BlogPost>;
  publishAdminArticle(accessToken: string, id: string): Promise<void>;
  archiveAdminArticle(accessToken: string, id: string): Promise<void>;
  deleteAdminArticle(accessToken: string, id: string): Promise<void>;
  getPublicationVariants(accessToken: string, articleId: string): Promise<ArticlePublicationVariant[]>;
  getPublicationVariant(accessToken: string, articleId: string, variantId: string): Promise<ArticlePublicationVariant>;
  createPublicationVariant(
    accessToken: string,
    articleId: string,
    request: ArticlePublicationVariantInput
  ): Promise<ArticlePublicationVariant>;
  updatePublicationVariant(
    accessToken: string,
    articleId: string,
    variantId: string,
    request: ArticlePublicationVariantInput
  ): Promise<ArticlePublicationVariant>;
  deletePublicationVariant(accessToken: string, articleId: string, variantId: string): Promise<void>;
}

interface PublicArticleListResponse {
  items: Array<{
    id: string;
    slug: string;
    title: LocalizedText;
    excerpt: LocalizedText;
    author: string;
    tags: string[];
    publishedAtUtc: string;
    updatedAtUtc: string;
  }>;
  total: number;
}

interface PublicArticleResponse {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  author: string;
  tags: string[];
  publishedAtUtc: string;
  updatedAtUtc: string;
}

interface AdminArticleResponse {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  author: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  createdAtUtc: string;
  updatedAtUtc: string;
  publishedAtUtc?: string | null;
}

interface ArticlePublicationVariantResponse {
  id: string;
  articleId: string;
  platform: string;
  locale: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  exportFormat: string;
  status: "draft" | "ready" | "published" | "archived";
  externalUrl?: string | null;
  notes?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  publishedAtUtc?: string | null;
}

export class ApiBlogClient implements BlogClient {
  constructor(private readonly baseUrl: string) {}

  async getPosts(query: BlogPostQuery = {}): Promise<PaginatedResult<BlogPost>> {
    const params = new URLSearchParams();
    if (query.tag) params.set("tag", query.tag);
    if (query.search) params.set("search", query.search);

    const suffix = params.toString();
    const response = await this.fetchJson<PublicArticleListResponse>(`/api/blog${suffix ? `?${suffix}` : ""}`);
    const items = response.items.map((item) => mapPublicArticle(item));

    return {
      items,
      total: response.total,
      page: 1,
      limit: response.total || items.length || 1,
      totalPages: 1,
      hasMore: false
    };
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await this.fetchJson<PublicArticleResponse>(`/api/blog/${slug}`);
    return mapPublicArticle(response);
  }

  async getDrafts(accessToken: string): Promise<BlogPost[]> {
    return this.getAdminArticles(accessToken, "draft");
  }

  async getAdminArticles(accessToken: string, status?: string): Promise<BlogPost[]> {
    const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await this.fetchJson<AdminArticleResponse[]>(`/api/admin/blog/articles${suffix}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.map((item) => mapAdminArticle(item));
  }

  async getAdminArticle(accessToken: string, id: string): Promise<BlogPost> {
    const response = await this.fetchJson<AdminArticleResponse>(`/api/admin/blog/articles/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return mapAdminArticle(response);
  }

  async createAdminArticle(accessToken: string, request: CreateAdminArticleRequest): Promise<BlogPost> {
    const response = await this.fetchJson<AdminArticleResponse>("/api/admin/blog/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(request)
    });

    return mapAdminArticle(response);
  }

  async updateAdminArticle(accessToken: string, id: string, request: UpdateAdminArticleRequest): Promise<BlogPost> {
    const response = await this.fetchJson<AdminArticleResponse>(`/api/admin/blog/articles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(request)
    });

    return mapAdminArticle(response);
  }

  async publishAdminArticle(accessToken: string, id: string): Promise<void> {
    await this.fetchJson(`/api/admin/blog/articles/${id}/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async archiveAdminArticle(accessToken: string, id: string): Promise<void> {
    await this.fetchJson(`/api/admin/blog/articles/${id}/archive`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async deleteAdminArticle(accessToken: string, id: string): Promise<void> {
    await this.fetchJson(`/api/admin/blog/articles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async getPublicationVariants(accessToken: string, articleId: string): Promise<ArticlePublicationVariant[]> {
    const response = await this.fetchJson<ArticlePublicationVariantResponse[]>(
      `/api/admin/blog/articles/${articleId}/variants`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return response.map(mapPublicationVariant);
  }

  async getPublicationVariant(
    accessToken: string,
    articleId: string,
    variantId: string
  ): Promise<ArticlePublicationVariant> {
    const response = await this.fetchJson<ArticlePublicationVariantResponse>(
      `/api/admin/blog/articles/${articleId}/variants/${variantId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return mapPublicationVariant(response);
  }

  async createPublicationVariant(
    accessToken: string,
    articleId: string,
    request: ArticlePublicationVariantInput
  ): Promise<ArticlePublicationVariant> {
    const response = await this.fetchJson<ArticlePublicationVariantResponse>(
      `/api/admin/blog/articles/${articleId}/variants`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(request)
      }
    );

    return mapPublicationVariant(response);
  }

  async updatePublicationVariant(
    accessToken: string,
    articleId: string,
    variantId: string,
    request: ArticlePublicationVariantInput
  ): Promise<ArticlePublicationVariant> {
    const response = await this.fetchJson<ArticlePublicationVariantResponse>(
      `/api/admin/blog/articles/${articleId}/variants/${variantId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(request)
      }
    );

    return mapPublicationVariant(response);
  }

  async deletePublicationVariant(accessToken: string, articleId: string, variantId: string): Promise<void> {
    await this.fetchJson(`/api/admin/blog/articles/${articleId}/variants/${variantId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), init);
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const payload = (await response.json()) as { message?: string };
        message = payload.message ?? message;
      } catch {
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

const mockPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "react-auth-perimeter",
    title: {
      en: "React auth perimeter for the first platform slice",
      ru: "React auth perimeter for the first platform slice",
      es: "Perimetro de autenticacion React para el primer corte de plataforma"
    },
    excerpt: {
      en: "How public, account and admin shells share one JWT session model.",
      ru: "How public, account and admin shells share one JWT session model.",
      es: "Como las superficies public, account y admin comparten una sesion JWT."
    },
    content: {
      en: "The first slice keeps auth JWT-first, moves API calls behind typed clients, and aligns route guards across shells.",
      ru: "The first slice keeps auth JWT-first, moves API calls behind typed clients, and aligns route guards across shells.",
      es: "El primer corte mantiene JWT como base de autenticacion, mueve las llamadas API detras de clientes tipados y alinea las rutas protegidas."
    },
    author: "Anton Strelkov",
    tags: ["react", "auth", "jwt"],
    publishedAtUtc: "2026-06-20T10:00:00.000Z",
    updatedAtUtc: "2026-06-20T10:00:00.000Z",
    status: "published"
  },
  {
    id: "post-2",
    slug: "blog-boundary-editor-later",
    title: {
      en: "Blog first, editor later",
      ru: "Blog first, editor later",
      es: "Primero el blog, despues el editor"
    },
    excerpt: {
      en: "Public blog surfaces belong in the first slice. Rich authoring does not.",
      ru: "Public blog surfaces belong in the first slice. Rich authoring does not.",
      es: "La parte publica del blog entra primero; la autoria avanzada no."
    },
    content: {
      en: "Landing pages remain config-driven while articles alone cross into editor-backed territory.",
      ru: "Landing pages remain config-driven while articles alone cross into editor-backed territory.",
      es: "Las paginas publicas quedan guiadas por configuracion y solo los articulos pasan al territorio del editor."
    },
    author: "Anton Strelkov",
    tags: ["blog", "content", "architecture"],
    publishedAtUtc: "2026-06-25T08:30:00.000Z",
    updatedAtUtc: "2026-06-25T08:30:00.000Z",
    status: "published"
  },
  {
    id: "post-3",
    slug: "draft-editor-entrypoint",
    title: {
      en: "Draft editor entrypoint",
      ru: "Draft editor entrypoint",
      es: "Entrada al editor de borradores"
    },
    excerpt: {
      en: "Protected drafts live behind auth and stay out of the public site by default.",
      ru: "Protected drafts live behind auth and stay out of the public site by default.",
      es: "Los borradores protegidos viven tras autenticacion y no aparecen publicamente por defecto."
    },
    content: {
      en: "This draft exists only to validate the auth guard and content boundary.",
      ru: "This draft exists only to validate the auth guard and content boundary.",
      es: "Este borrador existe solo para validar la proteccion de rutas y el limite de contenido."
    },
    author: "Editorial Owner",
    tags: ["drafts", "auth"],
    publishedAtUtc: "2026-06-29T08:00:00.000Z",
    updatedAtUtc: "2026-06-29T08:00:00.000Z",
    status: "draft"
  }
];

export class MockBlogClient implements BlogClient {
  async getPosts(): Promise<PaginatedResult<BlogPost>> {
    await delay(80);
    const items = mockPosts.filter((item) => item.status === "published");
    return { items, total: items.length, page: 1, limit: items.length, totalPages: 1, hasMore: false };
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    await delay(60);
    const post = mockPosts.find((item) => item.slug === slug && item.status === "published");
    if (!post) throw new Error("Blog post not found.");
    return post;
  }

  async getDrafts(accessToken: string): Promise<BlogPost[]> {
    assertMockAuth(accessToken);
    return mockPosts.filter((item) => item.status === "draft");
  }

  async getAdminArticles(accessToken: string, status?: string): Promise<BlogPost[]> {
    assertMockAuth(accessToken);
    return status ? mockPosts.filter((item) => item.status === status) : [...mockPosts];
  }

  async getAdminArticle(accessToken: string, id: string): Promise<BlogPost> {
    assertMockAuth(accessToken);
    const post = mockPosts.find((item) => item.id === id);
    if (!post) throw new Error("Article not found.");
    return post;
  }

  async createAdminArticle(accessToken: string, request: CreateAdminArticleRequest): Promise<BlogPost> {
    assertMockAuth(accessToken);
    const post: BlogPost = {
      id: `post-${crypto.randomUUID()}`,
      slug: request.slug,
      title: request.title,
      excerpt: request.excerpt,
      content: request.content,
      author: request.author,
      tags: request.tags,
      status: "draft",
      updatedAtUtc: new Date().toISOString(),
      publishedAtUtc: new Date().toISOString()
    };
    mockPosts.unshift(post);
    return post;
  }

  async updateAdminArticle(accessToken: string, id: string, request: UpdateAdminArticleRequest): Promise<BlogPost> {
    assertMockAuth(accessToken);
    const post = mockPosts.find((item) => item.id === id);
    if (!post) throw new Error("Article not found.");
    Object.assign(post, request, { updatedAtUtc: new Date().toISOString() });
    return post;
  }

  async publishAdminArticle(accessToken: string, id: string): Promise<void> {
    assertMockAuth(accessToken);
    const post = mockPosts.find((item) => item.id === id);
    if (!post) throw new Error("Article not found.");
    post.status = "published";
    post.publishedAtUtc = new Date().toISOString();
  }

  async archiveAdminArticle(accessToken: string, id: string): Promise<void> {
    assertMockAuth(accessToken);
    const post = mockPosts.find((item) => item.id === id);
    if (!post) throw new Error("Article not found.");
    post.status = "archived";
  }

  async deleteAdminArticle(accessToken: string, id: string): Promise<void> {
    assertMockAuth(accessToken);
    const index = mockPosts.findIndex((item) => item.id === id);
    if (index >= 0) {
      mockPosts.splice(index, 1);
    }
  }

  async getPublicationVariants(accessToken: string, articleId: string): Promise<ArticlePublicationVariant[]> {
    assertMockAuth(accessToken);
    return mockPublicationVariants.filter((variant) => variant.articleId === articleId);
  }

  async getPublicationVariant(
    accessToken: string,
    articleId: string,
    variantId: string
  ): Promise<ArticlePublicationVariant> {
    assertMockAuth(accessToken);
    const variant = mockPublicationVariants.find(
      (item) => item.articleId === articleId && item.id === variantId
    );
    if (!variant) throw new Error("Publication variant not found.");
    return variant;
  }

  async createPublicationVariant(
    accessToken: string,
    articleId: string,
    request: ArticlePublicationVariantInput
  ): Promise<ArticlePublicationVariant> {
    assertMockAuth(accessToken);
    const now = new Date().toISOString();
    const variant: ArticlePublicationVariant = {
      id: `variant-${crypto.randomUUID()}`,
      articleId,
      ...request,
      createdAtUtc: now,
      updatedAtUtc: now,
      publishedAtUtc: request.status === "published" ? now : null
    };
    mockPublicationVariants.unshift(variant);
    return variant;
  }

  async updatePublicationVariant(
    accessToken: string,
    articleId: string,
    variantId: string,
    request: ArticlePublicationVariantInput
  ): Promise<ArticlePublicationVariant> {
    assertMockAuth(accessToken);
    const variant = mockPublicationVariants.find(
      (item) => item.articleId === articleId && item.id === variantId
    );
    if (!variant) throw new Error("Publication variant not found.");
    Object.assign(variant, request, { updatedAtUtc: new Date().toISOString() });
    return variant;
  }

  async deletePublicationVariant(accessToken: string, articleId: string, variantId: string): Promise<void> {
    assertMockAuth(accessToken);
    const index = mockPublicationVariants.findIndex(
      (item) => item.articleId === articleId && item.id === variantId
    );
    if (index >= 0) {
      mockPublicationVariants.splice(index, 1);
    }
  }
}

function mapPublicArticle(item: PublicArticleResponse | PublicArticleListResponse["items"][number]): BlogPost {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    content: "content" in item ? item.content : item.excerpt,
    author: item.author,
    tags: item.tags,
    publishedAtUtc: item.publishedAtUtc,
    updatedAtUtc: item.updatedAtUtc,
    status: "published"
  };
}

function mapAdminArticle(item: AdminArticleResponse): BlogPost {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    author: item.author,
    tags: item.tags,
    publishedAtUtc: item.publishedAtUtc ?? item.updatedAtUtc,
    updatedAtUtc: item.updatedAtUtc,
    status: item.status
  };
}

function mapPublicationVariant(item: ArticlePublicationVariantResponse): ArticlePublicationVariant {
  return {
    id: item.id,
    articleId: item.articleId,
    platform: item.platform,
    locale: item.locale,
    title: item.title,
    excerpt: item.excerpt,
    contentMarkdown: item.contentMarkdown,
    exportFormat: item.exportFormat,
    status: item.status,
    externalUrl: item.externalUrl,
    notes: item.notes,
    createdAtUtc: item.createdAtUtc,
    updatedAtUtc: item.updatedAtUtc,
    publishedAtUtc: item.publishedAtUtc
  };
}

const mockPublicationVariants: ArticlePublicationVariant[] = [];

function assertMockAuth(accessToken: string): void {
  if (!accessToken.startsWith("mock-access:")) {
    throw new Error("Unauthorized.");
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

