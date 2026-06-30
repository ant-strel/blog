import { Link, Route, Routes } from "react-router-dom";
import { BlogIndexPage } from "./pages/BlogIndexPage";
import { BlogArticlePage } from "./pages/BlogArticlePage";
import { HomePage } from "./pages/HomePage";

export default function App() {
  return (
    <div className="shell public-shell">
      <header className="public-header">
        <div>
          <div className="eyebrow">Platform Public Shell</div>
          <p className="brand-mark">Template Project</p>
        </div>
        <nav className="public-nav">
          <Link to="/">Home</Link>
          <Link to="/blog">Blog</Link>
          <a href="http://localhost:5174">Account</a>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
      </Routes>
    </div>
  );
}
