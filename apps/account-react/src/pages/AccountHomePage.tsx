import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export function AccountHomePage() {
  const { user, logout, tokens } = useAuth();

  return (
    <main className="dashboard-grid">
      <section className="panel form-card">
        <div className="eyebrow">Current session</div>
        <h2>
          {user?.firstName} {user?.lastName}
        </h2>
        <p className="muted">{user?.email}</p>
        <p>Roles: {user?.roles.join(", ")}</p>
        <p className="muted">Access token expires: {tokens?.accessTokenExpiresAtUtc}</p>
        <div className="hero-actions">
          <Link className="btn btn-secondary" to="/drafts">
            Open drafts
          </Link>
          <button className="btn btn-primary" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </section>

      <aside className="panel side-note">
        <div className="eyebrow">Why this exists</div>
        <p>
          This protected area validates the same auth perimeter that should later wrap admin,
          dashboard, and editor entrypoints.
        </p>
      </aside>
    </main>
  );
}
