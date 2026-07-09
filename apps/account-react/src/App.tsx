import { Link, Route, Routes } from "react-router-dom";
import { resolveAppUrl } from "@template/api-client-ts";
import { RequireAuth } from "./state/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AccountHomePage } from "./pages/AccountHomePage";
import { DraftsPage } from "./pages/DraftsPage";

export default function App() {
  const publicAppUrl = resolveAppUrl(import.meta.env.VITE_PUBLIC_APP_URL, "http://localhost:5173");

  return (
    <div className="shell account-shell">
      <header className="account-header">
        <Link className="logo" to="/">
          Template Project
        </Link>
        <nav className="public-nav">
          <a href={publicAppUrl}>Public</a>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AccountHomePage />} />
          <Route path="/drafts" element={<DraftsPage />} />
        </Route>
      </Routes>
    </div>
  );
}
