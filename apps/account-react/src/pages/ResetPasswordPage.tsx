import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("editor@example.com");
  const [token, setToken] = useState("reset-u-editor");
  const [newPassword, setNewPassword] = useState("Editor123!");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await resetPassword({ email, token, newPassword });
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
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
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
