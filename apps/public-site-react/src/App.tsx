import { useEffect, useState } from "react";
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
import { isGithubPagesBuild } from "./lib/blogRoutes";
import { useAuth } from "./state/AuthProvider";

export default function App() {
  const { ready, tokens, logout } = useAuth();
  const [locale, setLocale] = useState<LocaleCode>(getInitialLocale());
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme());
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("site-theme", theme);
  }, [theme]);

  return (
    <div className="public-layout" data-theme={theme}>
      <header className="public-header">
        <div className="public-container header-inner">
          <Link className="logo" to="/">
            {siteContent.brandName}
          </Link>
          <nav className="public-nav">
            {isGithubPagesBuild ? (
              <Link to="/">{localize(siteContent.nav.blog, locale)}</Link>
            ) : (
              <>
                <Link to="/">{localize(siteContent.nav.home, locale)}</Link>
                <Link to="/blog">{localize(siteContent.nav.blog, locale)}</Link>
                <Link to="/contact">{localize(siteContent.nav.contact, locale)}</Link>
              </>
            )}
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
          <button
            className="theme-toggle"
            type="button"
            aria-label={localize(isDarkTheme ? themeLabels.switchToLight : themeLabels.switchToDark, locale)}
            title={localize(isDarkTheme ? themeLabels.switchToLight : themeLabels.switchToDark, locale)}
            onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
          >
            <span aria-hidden="true">{isDarkTheme ? "\u2600" : "\u263E"}</span>
          </button>
        </div>
      </header>

      <main className="public-main">
        <div className="public-container">
          <Routes>
            {isGithubPagesBuild ? (
              <>
                <Route path="/" element={<BlogIndexPage locale={locale} />} />
                <Route path="/:slug" element={<BlogArticlePage locale={locale} />} />
              </>
            ) : (
              <>
                <Route path="/" element={<HomePage locale={locale} />} />
                <Route path="/blog" element={<BlogIndexPage locale={locale} />} />
                <Route path="/blog/editor/new" element={<BlogArticleEditorPage locale={locale} />} />
                <Route path="/blog/editor/:articleId" element={<BlogArticleEditorPage locale={locale} />} />
                <Route path="/blog/:slug" element={<BlogArticlePage locale={locale} />} />
                <Route path="/admin" element={<LoginPage />} />
                <Route path="/contact" element={<ContactPage locale={locale} />} />
              </>
            )}
          </Routes>
        </div>
      </main>

      <footer className="public-footer">
        <div className="public-container">{localize(siteContent.footerText, locale)}</div>
      </footer>
    </div>
  );
}

type ThemeMode = "light" | "dark";

const themeLabels = {
  switchToDark: {
    en: "Switch to dark theme",
    ru: "Переключить на темную тему",
    es: "Cambiar al tema oscuro"
  },
  switchToLight: {
    en: "Switch to light theme",
    ru: "Переключить на светлую тему",
    es: "Cambiar al tema claro"
  }
};

function getInitialLocale(): LocaleCode {
  const language = navigator.language.toLowerCase();
  if (language.startsWith("ru")) return "ru";
  if (language.startsWith("es")) return "es";
  return "en";
}

function getInitialTheme(): ThemeMode {
  const savedTheme = window.localStorage.getItem("site-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
