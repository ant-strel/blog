import type {
  AdminOverviewResponse,
  DashboardDetail,
  DashboardQuery,
  DashboardSummaryResponse,
  DashboardTimelineResponse
} from "@template/contracts";

export interface DashboardClient {
  getSummary(accessToken: string): Promise<DashboardSummaryResponse>;
  getTimeline(accessToken: string, query?: DashboardQuery): Promise<DashboardTimelineResponse>;
  getDetail(accessToken: string, id: string): Promise<DashboardDetail>;
  getAdminOverview(accessToken: string): Promise<AdminOverviewResponse>;
}

export class ApiDashboardClient implements DashboardClient {
  constructor(private readonly baseUrl: string) {}

  getSummary(accessToken: string): Promise<DashboardSummaryResponse> {
    return this.fetchJson("/api/dashboard/summary", accessToken);
  }

  getTimeline(accessToken: string, query: DashboardQuery = {}): Promise<DashboardTimelineResponse> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.severity) params.set("severity", query.severity);
    if (query.environment) params.set("environment", query.environment);
    if (query.status) params.set("status", query.status);

    const suffix = params.toString();
    return this.fetchJson(`/api/dashboard/timeline${suffix ? `?${suffix}` : ""}`, accessToken);
  }

  getDetail(accessToken: string, id: string): Promise<DashboardDetail> {
    return this.fetchJson(`/api/dashboard/details/${id}`, accessToken);
  }

  getAdminOverview(accessToken: string): Promise<AdminOverviewResponse> {
    return this.fetchJson("/api/admin/overview", accessToken);
  }

  private async fetchJson<T>(path: string, accessToken: string): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }
}

const summary: DashboardSummaryResponse = {
  metrics: [
    { id: "sessions", label: "Active sessions", value: "128", delta: "+12%", trend: "up" },
    { id: "alerts", label: "Open alerts", value: "7", delta: "-2", trend: "down" },
    { id: "latency", label: "API p95", value: "184 ms", delta: "+14 ms", trend: "up" },
    { id: "resolution", label: "Resolution rate", value: "93%", delta: "flat", trend: "flat" }
  ],
  activeSessions: 128,
  filters: {
    environments: [
      { id: "prod", label: "Production", count: 9 },
      { id: "stage", label: "Stage", count: 4 },
      { id: "dev", label: "Dev", count: 3 }
    ],
    severities: [
      { id: "critical", label: "Critical", count: 2 },
      { id: "warning", label: "Warning", count: 8 },
      { id: "info", label: "Info", count: 6 }
    ],
    statuses: [
      { id: "open", label: "Open", count: 9 },
      { id: "monitoring", label: "Monitoring", count: 4 },
      { id: "resolved", label: "Resolved", count: 3 }
    ]
  }
};

const timelineItems = [
  {
    id: "evt-1001",
    timestampUtc: "2026-06-29T08:15:00Z",
    title: "Payment webhook spike",
    sessionId: "sess-14",
    activityType: "webhook",
    severity: "critical",
    status: "open",
    environment: "prod",
    summary: "Retry storms started after upstream timeout window."
  },
  {
    id: "evt-1002",
    timestampUtc: "2026-06-29T08:22:00Z",
    title: "Search index delay",
    sessionId: "sess-22",
    activityType: "indexer",
    severity: "warning",
    status: "monitoring",
    environment: "stage",
    summary: "Synthetic queue depth crossed the dashboard warning threshold."
  },
  {
    id: "evt-1003",
    timestampUtc: "2026-06-29T08:41:00Z",
    title: "Manual feature-flag audit",
    sessionId: "sess-41",
    activityType: "admin",
    severity: "info",
    status: "resolved",
    environment: "prod",
    summary: "Operator reviewed rollout guardrails before widening exposure."
  },
  {
    id: "evt-1004",
    timestampUtc: "2026-06-29T09:02:00Z",
    title: "Token refresh anomaly",
    sessionId: "sess-55",
    activityType: "auth",
    severity: "warning",
    status: "open",
    environment: "prod",
    summary: "Refresh-token reuse attempt was blocked by session policy."
  }
] as const;

const details: Record<string, DashboardDetail> = {
  "evt-1001": {
    id: "evt-1001",
    correlationId: "corr-prod-1842",
    actor: "worker-dotnet",
    title: "Payment webhook spike",
    description: "Synthetic upstream latency pushed webhook retries into a burst window affecting payment callbacks.",
    recommendation: "Throttle retry fan-out and inspect upstream gateway saturation.",
    relatedAlerts: ["alert-payments-1", "alert-payments-2"]
  },
  "evt-1002": {
    id: "evt-1002",
    correlationId: "corr-stage-992",
    actor: "dashboard-indexer",
    title: "Search index delay",
    description: "Index queue depth exceeded the stage threshold while demo data refresh was running.",
    recommendation: "Inspect worker lag and pause low-priority replay tasks.",
    relatedAlerts: ["alert-search-1"]
  },
  "evt-1003": {
    id: "evt-1003",
    correlationId: "corr-admin-447",
    actor: "superadmin@example.com",
    title: "Manual feature-flag audit",
    description: "The operator reviewed production rollout controls and verified no destructive flags were enabled.",
    recommendation: "No action required.",
    relatedAlerts: []
  },
  "evt-1004": {
    id: "evt-1004",
    correlationId: "corr-auth-811",
    actor: "auth-gateway",
    title: "Token refresh anomaly",
    description: "A reused refresh token was detected and revoked during session continuation.",
    recommendation: "Review suspicious IP activity and correlate with login attempts.",
    relatedAlerts: ["alert-auth-3"]
  }
};

const adminOverview: AdminOverviewResponse = {
  health: "healthy",
  cards: [
    { id: "users", label: "Managed users", value: "2,184", delta: "+34", trend: "up" },
    { id: "jobs", label: "Job success rate", value: "99.2%", delta: "+0.4%", trend: "up" },
    { id: "backups", label: "Last backup", value: "09:10 UTC", delta: "on time", trend: "flat" },
    { id: "flags", label: "Active flags", value: "12", delta: "+1", trend: "up" }
  ],
  queues: [
    { id: "queue-1", title: "Content moderation", status: "healthy", summary: "14 items waiting, no SLA breach." },
    { id: "queue-2", title: "License sync", status: "monitoring", summary: "2 retries pending after gateway slowdown." }
  ],
  alerts: [
    { id: "admin-alert-1", title: "Audit export", status: "review", summary: "Sensitive export generated in demo mode." },
    { id: "admin-alert-2", title: "Support queue", status: "healthy", summary: "No overdue escalations." }
  ]
};

export class MockDashboardClient implements DashboardClient {
  async getSummary(accessToken: string): Promise<DashboardSummaryResponse> {
    assertAuth(accessToken);
    await delay(120);
    return summary;
  }

  async getTimeline(accessToken: string, query: DashboardQuery = {}): Promise<DashboardTimelineResponse> {
    assertAuth(accessToken);
    await delay(120);
    let items = [...timelineItems];

    if (query.search) {
      const needle = query.search.toLowerCase();
      items = items.filter((item) =>
        `${item.title} ${item.summary} ${item.activityType}`.toLowerCase().includes(needle)
      );
    }

    if (query.severity) items = items.filter((item) => item.severity === query.severity);
    if (query.environment) items = items.filter((item) => item.environment === query.environment);
    if (query.status) items = items.filter((item) => item.status === query.status);

    return { items, filteredCount: items.length };
  }

  async getDetail(accessToken: string, id: string): Promise<DashboardDetail> {
    assertAuth(accessToken);
    await delay(80);
    const detail = details[id];
    if (!detail) throw new Error("Dashboard detail not found.");
    return detail;
  }

  async getAdminOverview(accessToken: string): Promise<AdminOverviewResponse> {
    assertAuth(accessToken);
    await delay(120);
    return adminOverview;
  }
}

function assertAuth(accessToken: string): void {
  if (!accessToken) throw new Error("Unauthorized.");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
