export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}

export interface DashboardFilterOption {
  id: string;
  label: string;
  count: number;
}

export interface DashboardFilters {
  environments: DashboardFilterOption[];
  severities: DashboardFilterOption[];
  statuses: DashboardFilterOption[];
}

export interface DashboardTimelineEvent {
  id: string;
  timestampUtc: string;
  title: string;
  sessionId: string;
  activityType: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved" | "monitoring";
  environment: "prod" | "stage" | "dev";
  summary: string;
}

export interface DashboardDetail {
  id: string;
  correlationId: string;
  actor: string;
  title: string;
  description: string;
  recommendation: string;
  relatedAlerts: string[];
}

export interface DashboardQuery {
  search?: string;
  severity?: string;
  environment?: string;
  status?: string;
}

export interface DashboardSummaryResponse {
  metrics: DashboardMetric[];
  activeSessions: number;
  filters: DashboardFilters;
}

export interface DashboardTimelineResponse {
  items: DashboardTimelineEvent[];
  filteredCount: number;
}

export interface AdminOverviewItem {
  id: string;
  title: string;
  status: string;
  summary: string;
}

export interface AdminOverviewResponse {
  health: "healthy" | "degraded";
  cards: DashboardMetric[];
  queues: AdminOverviewItem[];
  alerts: AdminOverviewItem[];
}
