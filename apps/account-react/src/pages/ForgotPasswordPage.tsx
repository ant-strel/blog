import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await forgotPassword({ email });
    setMessage(result.message);
    setToken(result.token ?? null);
  }

  return (
    <section className="panel form-card">
      <div className="eyebrow">Password recovery</div>
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">
          Generate reset token
        </button>
      </form>
      {message && <p>{message}</p>}
      {token && <p className="muted">Mock token for the first slice: {token}</p>}
      <div className="form-links">
        <Link to="/reset-password">Reset password</Link>
      </div>
    </section>
  );
}
