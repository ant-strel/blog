import { useEffect, useState } from "react";
import type { AdminOverviewResponse } from "@template/contracts";
import { createDashboardClient } from "../lib/dashboardClient";
import { useAuth } from "../state/AuthProvider";

const dashboardClient = createDashboardClient();

export function AdminOverviewPage() {
  const { tokens, user, logout } = useAuth();
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens) return;
    dashboardClient.getAdminOverview(tokens.accessToken).then(setData).catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load admin overview.");
    });
  }, [tokens]);

  return (
    <main className="admin-layout">
      <section className="panel page-card">
        <div className="section-row">
          <div>
            <div className="eyebrow">Overview</div>
            <h2>{user?.email}</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
        {data && (
          <>
            <div className="metric-grid">
              {data.cards.map((card) => (
                <article className="metric-card" key={card.id}>
                  <span className="muted">{card.label}</span>
                  <strong>{card.value}</strong>
                  <span className="delta">{card.delta}</span>
                </article>
              ))}
            </div>
            <div className="stack-grid">
              <section className="panel nested-panel">
                <h3>Queues</h3>
                {data.queues.map((item) => (
                  <article className="list-item" key={item.id}>
                    <strong>{item.title}</strong>
                    <p className="muted">{item.summary}</p>
                  </article>
                ))}
              </section>
              <section className="panel nested-panel">
                <h3>Alerts</h3>
                {data.alerts.map((item) => (
                  <article className="list-item" key={item.id}>
                    <strong>{item.title}</strong>
                    <p className="muted">{item.summary}</p>
                  </article>
                ))}
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
