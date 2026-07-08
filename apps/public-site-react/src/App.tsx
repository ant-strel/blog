import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import type { LocaleCode } from "@template/contracts";
import { BlogIndexPage } from "./pages/BlogIndexPage";
import { BlogArticlePage } from "./pages/BlogArticlePage";
import { BlogArticleEditorPage } from "./pages/BlogArticleEditorPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ContactPage } from "./pages/ContactPage";
import { editorContent } from "./content/editorContent";
import { siteContent } from "./content/siteContent";
import { localize } from "./lib/localize";
import { useAuth } from "./state/AuthProvider";

export default function App() {
  const { ready, tokens, logout } = useAuth();
  const [locale, setLocale] = useState<LocaleCode>(getInitialLocale());

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-container header-inner">
          <Link className="logo" to="/">
            {siteContent.brandName}
          </Link>
          <nav className="public-nav">
            <Link to="/">{localize(siteContent.nav.home, locale)}</Link>
            <Link to="/blog">{localize(siteContent.nav.blog, locale)}</Link>
            <Link to="/contact">{localize(siteContent.nav.contact, locale)}</Link>
            {ready && tokens && (
              <button className="nav-button" type="button" onClick={() => void logout()}>
                {localize(editorContent.articleList.signOut, locale)}
              </button>
            )}
          </nav>
          <label className="language-selector">
            <span>{localize(siteContent.languageLabel, locale)}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as LocaleCode)}>
              <option value="en">{siteContent.languages.en}</option>
              <option value="ru">{siteContent.languages.ru}</option>
              <option value="es">{siteContent.languages.es}</option>
            </select>
          </label>
        </div>
      </header>

      <main className="public-main">
        <div className="public-container">
          <Routes>
            <Route path="/" element={<HomePage locale={locale} />} />
            <Route path="/blog" element={<BlogIndexPage locale={locale} />} />
            <Route path="/blog/editor/new" element={<BlogArticleEditorPage locale={locale} />} />
            <Route path="/blog/editor/:articleId" element={<BlogArticleEditorPage locale={locale} />} />
            <Route path="/blog/:slug" element={<BlogArticlePage locale={locale} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/contact" element={<ContactPage locale={locale} />} />
          </Routes>
        </div>
      </main>

      <footer className="public-footer">
        <div className="public-container">{localize(siteContent.footerText, locale)}</div>
      </footer>
    </div>
  );
}

function getInitialLocale(): LocaleCode {
  const language = navigator.language.toLowerCase();
  if (language.startsWith("ru")) return "ru";
  if (language.startsWith("es")) return "es";
  return "en";
}
