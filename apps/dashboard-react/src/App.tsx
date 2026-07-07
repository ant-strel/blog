import { Link, Route, Routes } from "react-router-dom";
import { resolveAppUrl } from "@template/api-client-ts";
import { RequireAuth } from "./state/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  const publicAppUrl = resolveAppUrl(import.meta.env.VITE_PUBLIC_APP_URL, "http://localhost:5173");
  const accountAppUrl = resolveAppUrl(import.meta.env.VITE_ACCOUNT_APP_URL, "http://localhost:5174");
  const adminAppUrl = resolveAppUrl(import.meta.env.VITE_ADMIN_APP_URL, "http://localhost:5175");

  return (
    <div className="shell dashboard-shell">
      <header className="topbar">
        <Link className="logo" to="/">
          Template Project
        </Link>
        <nav className="public-nav">
          <a href={publicAppUrl}>Public</a>
          <a href={accountAppUrl}>Account</a>
          <a href={adminAppUrl}>Admin</a>
          <Link to="/">Dashboard</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Routes>
    </div>
  );
}
