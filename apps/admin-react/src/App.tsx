import { Link, Route, Routes } from "react-router-dom";
import { resolveAppUrl } from "@template/api-client-ts";
import { RequireAuth } from "./state/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { AdminOverviewPage } from "./pages/AdminOverviewPage";
import { BlogArticlesPage } from "./pages/BlogArticlesPage";
import { BlogArticleEditorPage } from "./pages/BlogArticleEditorPage";

export default function App() {
  const publicAppUrl = resolveAppUrl(import.meta.env.VITE_PUBLIC_APP_URL, "http://localhost:5173");
  const accountAppUrl = resolveAppUrl(import.meta.env.VITE_ACCOUNT_APP_URL, "http://localhost:5174");
  const dashboardAppUrl = resolveAppUrl(import.meta.env.VITE_DASHBOARD_APP_URL, "http://localhost:5176");

  return (
    <div className="shell admin-shell">
      <header className="topbar">
        <Link className="logo" to="/">
          Template Project
        </Link>
        <nav className="public-nav">
          <a href={publicAppUrl}>Public</a>
          <a href={accountAppUrl}>Account</a>
          <a href={dashboardAppUrl}>Dashboard</a>
          <Link to="/">Overview</Link>
          <Link to="/blog">Blog</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AdminOverviewPage />} />
          <Route path="/blog" element={<BlogArticlesPage />} />
          <Route path="/blog/new" element={<BlogArticleEditorPage />} />
          <Route path="/blog/:articleId" element={<BlogArticleEditorPage />} />
        </Route>
      </Routes>
    </div>
  );
}
