import { ApiBlogClient, MockBlogClient, type BlogClient } from "@template/api-client-ts";

export function createBlogClient(): BlogClient {
  const mode = import.meta.env.VITE_BLOG_MODE ?? "mock";
  const apiBaseUrl = import.meta.env.VITE_BLOG_API_BASE_URL ?? "http://127.0.0.1:7071";
  return mode === "api" ? new ApiBlogClient(apiBaseUrl) : new MockBlogClient();
}
