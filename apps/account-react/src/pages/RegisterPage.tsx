import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export function RegisterPage() {
  const { register, requestEmailConfirmation, confirmEmail } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setBusy(true);
      setError(null);
      const result = await register({ firstName, lastName, email, password });
      const requestEmailResult = await requestEmailConfirmation({ email });
      const confirmation = await confirmEmail({
        email,
        token: requestEmailResult.token ?? `confirm-${result.userId}`
      });
      setMessage(`User created. ${confirmation.message}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel form-card">
      <div className="eyebrow">Registration</div>
      <h2>Baseline login/password flow, ready for the .NET auth backend.</h2>
      <form onSubmit={onSubmit} className="form-grid">
        <label className="field">
          <span>First name</span>
          <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </label>
        <label className="field">
          <span>Last name</span>
          <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </label>
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
        {message && <p>{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="form-links">
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  );
}
