import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await login({ login: loginValue, password });
      navigate("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    }
  }

  return (
    <section className="panel page-card">
      <div className="eyebrow">Admin sign in</div>
      <h2>Editor sign in</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Login</span>
          <input autoComplete="username" value={loginValue} onChange={(event) => setLoginValue(event.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit">Sign in</button>
      </form>
    </section>
  );
}
