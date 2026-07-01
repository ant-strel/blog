import { ApiAuthClient, MockAuthClient, resolveApiBaseUrl, type AuthClient } from "@template/api-client-ts";

export function createAuthClient(): AuthClient {
  const mode = import.meta.env.VITE_AUTH_MODE ?? "mock";
  const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_AUTH_API_BASE_URL, "http://127.0.0.1:7067");

  return mode === "api" ? new ApiAuthClient(apiBaseUrl) : new MockAuthClient();
}
