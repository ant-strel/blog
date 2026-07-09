import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await resetPassword({ login: loginValue, token, newPassword });
      setError(null);
      setMessage(result.message);
    } catch (caught) {
      setMessage(null);
      setError(caught instanceof Error ? caught.message : "Reset password failed.");
    }
  }

  return (
    <section className="panel form-card">
      <div className="eyebrow">Reset password</div>
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Login</span>
          <input autoComplete="username" value={loginValue} onChange={(event) => setLoginValue(event.target.value)} />
        </label>
        <label className="field">
          <span>Token</span>
          <input value={token} onChange={(event) => setToken(event.target.value)} />
        </label>
        <label className="field">
          <span>New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </label>
        {message && <p>{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Save new password
        </button>
      </form>
      <div className="form-links">
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  );
}
