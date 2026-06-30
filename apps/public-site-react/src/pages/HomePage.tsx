import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="hero-grid">
      <section className="panel hero-card">
        <div className="eyebrow">First Slice</div>
        <h1 className="headline">React public blog surface with a strict editor boundary.</h1>
        <p className="muted">
          This shell keeps landing and navigation config-driven while reserving editor-backed
          lifecycle only for blog articles, exactly as the roadmap specifies.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/blog">
            Open blog
          </Link>
          <a className="btn btn-secondary" href="http://localhost:5174/login">
            Account auth
          </a>
        </div>
      </section>

      <aside className="panel side-note">
        <div className="eyebrow">Boundary</div>
        <p>
          `blog index` and `blog article` are present now. Rich authoring stays in the protected
          account area and remains intentionally lightweight in this slice.
        </p>
      </aside>
    </main>
  );
}
