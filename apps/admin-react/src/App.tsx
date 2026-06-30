import { Link, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./state/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { AdminOverviewPage } from "./pages/AdminOverviewPage";
import { BlogArticlesPage } from "./pages/BlogArticlesPage";
import { BlogArticleEditorPage } from "./pages/BlogArticleEditorPage";

export default function App() {
  return (
    <div className="shell admin-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Admin Console</div>
          <h1 className="title">React blog admin, auth server and operational shell.</h1>
        </div>
        <nav className="public-nav">
          <a href="http://localhost:5173">Public</a>
          <a href="http://localhost:5174">Account</a>
          <a href="http://localhost:5176">Dashboard</a>
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
