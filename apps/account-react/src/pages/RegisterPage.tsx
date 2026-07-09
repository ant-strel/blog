import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <section className="panel form-card">
      <div className="eyebrow">Registration closed</div>
      <h2>Public account creation is disabled.</h2>
      <p className="muted">Editor access is provisioned outside the public site.</p>
      <div className="form-links">
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  );
}
