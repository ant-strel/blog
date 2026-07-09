import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await forgotPassword({ login: loginValue });
    setMessage(result.message);
  }

  return (
    <section className="panel form-card">
      <div className="eyebrow">Password recovery</div>
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Login</span>
          <input autoComplete="username" value={loginValue} onChange={(event) => setLoginValue(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">
          Request reset
        </button>
      </form>
      {message && <p>{message}</p>}
      <div className="form-links">
        <Link to="/reset-password">Reset password</Link>
      </div>
    </section>
  );
}
