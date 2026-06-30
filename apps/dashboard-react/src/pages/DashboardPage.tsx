import { useEffect, useMemo, useState } from "react";
import type {
  DashboardDetail,
  DashboardSummaryResponse,
  DashboardTimelineEvent,
  DashboardTimelineResponse
} from "@template/contracts";
import { createDashboardClient } from "../lib/dashboardClient";
import { useAuth } from "../state/AuthProvider";

const dashboardClient = createDashboardClient();

export function DashboardPage() {
  const { tokens, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [timeline, setTimeline] = useState<DashboardTimelineResponse | null>(null);
  const [detail, setDetail] = useState<DashboardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [environment, setEnvironment] = useState("");

  useEffect(() => {
    if (!tokens) return;
    dashboardClient.getSummary(tokens.accessToken).then(setSummary).catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load summary.");
    });
  }, [tokens]);

  useEffect(() => {
    if (!tokens) return;
    dashboardClient.getTimeline(tokens.accessToken, { search, severity, environment }).then(setTimeline).catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load timeline.");
    });
  }, [tokens, search, severity, environment]);

  const timelineItems = timeline?.items ?? [];

  async function openDetail(item: DashboardTimelineEvent) {
    if (!tokens) return;
    const nextDetail = await dashboardClient.getDetail(tokens.accessToken, item.id);
    setDetail(nextDetail);
  }

  const statesText = useMemo(() => {
    if (error) return error;
    if (!timeline) return "Loading timeline...";
    if (timeline.filteredCount === 0) return "No events match the active filters.";
    return `${timeline.filteredCount} timeline events`;
  }, [error, timeline]);

  return (
    <main className="dashboard-layout">
      <section className="panel page-card">
        <div className="section-row">
          <div>
            <div className="eyebrow">Summary</div>
            <h2>Operational heartbeat</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
        <div className="metric-grid">
          {summary?.metrics.map((metric) => (
            <article className="metric-card" key={metric.id}>
              <span className="muted">{metric.label}</span>
              <strong>{metric.value}</strong>
              <span className="delta">{metric.delta}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel page-card">
        <div className="filters-grid">
          <label className="field">
            <span>Search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="field">
            <span>Severity</span>
            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option value="">All</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </label>
          <label className="field">
            <span>Environment</span>
            <select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
              <option value="">All</option>
              <option value="prod">Production</option>
              <option value="stage">Stage</option>
              <option value="dev">Dev</option>
            </select>
          </label>
        </div>
        <p className="muted">{statesText}</p>
      </section>

      <div className="timeline-grid">
        <section className="panel page-card">
          <div className="eyebrow">Timeline</div>
          {timelineItems.map((item) => (
            <button className="timeline-item" key={item.id} onClick={() => void openDetail(item)}>
              <span className="timeline-time">{new Date(item.timestampUtc).toLocaleTimeString()}</span>
              <div className="timeline-body">
                <strong>{item.title}</strong>
                <p className="muted">{item.summary}</p>
                <span className="timeline-tags">{item.environment} / {item.severity} / {item.status}</span>
              </div>
            </button>
          ))}
        </section>

        <aside className="panel page-card">
          <div className="eyebrow">Details</div>
          {detail ? (
            <div className="detail-stack">
              <h3>{detail.title}</h3>
              <p className="muted">{detail.correlationId}</p>
              <p>{detail.description}</p>
              <p><strong>Actor:</strong> {detail.actor}</p>
              <p><strong>Recommendation:</strong> {detail.recommendation}</p>
              <p><strong>Related alerts:</strong> {detail.relatedAlerts.join(", ") || "none"}</p>
            </div>
          ) : (
            <p className="muted">Select a timeline event to inspect details.</p>
          )}
        </aside>
      </div>
    </main>
  );
}
