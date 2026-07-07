import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setBusy(true);
      setError(null);
      await login({ email, password });
      const redirect = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(redirect);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel form-card">
      <div className="eyebrow">Sign in</div>
      <h2>Sign in</h2>
      <form onSubmit={onSubmit} className="form-grid">
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="form-links">
        <Link to="/register">Create account</Link>
        <Link to="/forgot-password">Forgot password</Link>
      </div>
    </section>
  );
}
