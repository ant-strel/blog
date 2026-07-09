import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Seo } from "../components/Seo";
import { useAuth } from "../state/AuthProvider";

export function LoginPage() {
  const { ready, tokens, login } = useAuth();
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && tokens) {
    return <Navigate to="/blog" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await login({ login: loginValue, password });
      navigate("/blog", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="login-panel">
      <Seo
        title="Editor sign in | d-antes"
        description="Protected editorial sign-in page."
        path="/admin"
        locale="en"
        noIndex
      />
      <h1>Editor sign in</h1>
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Login</span>
          <input
            autoComplete="username"
            value={loginValue}
            onChange={(event) => setLoginValue(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}
