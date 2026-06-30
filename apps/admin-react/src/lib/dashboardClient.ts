import { ApiDashboardClient, MockDashboardClient, type DashboardClient } from "@template/api-client-ts";

export function createDashboardClient(): DashboardClient {
  const mode = import.meta.env.VITE_DASHBOARD_MODE ?? "mock";
  const apiBaseUrl = import.meta.env.VITE_DASHBOARD_API_BASE_URL ?? "http://127.0.0.1:7067";
  return mode === "api" ? new ApiDashboardClient(apiBaseUrl) : new MockDashboardClient();
}
