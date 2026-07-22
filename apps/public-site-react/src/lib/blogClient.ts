import { ApiBlogClient, MockBlogClient, StaticBlogClient, resolveApiBaseUrl, type BlogClient } from "@template/api-client-ts";

export function createBlogClient(): BlogClient {
  const mode = import.meta.env.VITE_BLOG_MODE ?? "static";
  const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_BLOG_API_BASE_URL, "http://127.0.0.1:7071");

  if (mode === "static") {
    return new StaticBlogClient(import.meta.env.VITE_STATIC_ARTICLES_BASE_PATH ?? "/articles");
  }

  return mode === "api" ? new ApiBlogClient(apiBaseUrl) : new MockBlogClient();
}
