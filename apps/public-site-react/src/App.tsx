import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import type { LocaleCode } from "@template/contracts";
import { BlogIndexPage } from "./pages/BlogIndexPage";
import { BlogArticlePage } from "./pages/BlogArticlePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ContactPage } from "./pages/ContactPage";
import { siteContent } from "./content/siteContent";
import { localize } from "./lib/localize";

export default function App() {
  const [locale, setLocale] = useState<LocaleCode>(getInitialLocale());
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme());
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const favicon = document.querySelector<HTMLLinkElement>("link[data-site-favicon]");
    if (favicon) favicon.href = `/favicons/digital-rune-${theme}.png`;
  }, [theme]);

  return (
    <div className="public-layout" data-theme={theme}>
      <header className="public-header">
        <div className="public-container header-inner">
          <Link className="logo" to="/">
            {siteContent.brandName}
          </Link>
          <nav className="public-nav">
            <Link to="/">{localize(siteContent.nav.blog, locale)}</Link>
            <Link to="/contact">{localize(siteContent.nav.contact, locale)}</Link>
          </nav>
          <label className="language-selector">
            <select aria-label={localize(siteContent.languageLabel, locale)} value={locale} onChange={(event) => setLocale(event.target.value as LocaleCode)}>
              <option value="ru">{siteContent.languages.ru}</option>
              <option value="en">{siteContent.languages.en}</option>
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
            <Route path="/" element={<BlogIndexPage locale={locale} />} />
            <Route path="/blog" element={<BlogIndexPage locale={locale} />} />
            <Route path="/blog/:slug" element={<BlogArticlePage locale={locale} />} />
            <Route path="/contact" element={<ContactPage locale={locale} />} />
            <Route path="/privacy" element={<PrivacyPage locale={locale} />} />
            <Route path="/:slug" element={<BlogArticlePage locale={locale} />} />
            <Route path="*" element={<section className="feedback-card">404 — <Link to="/">Home</Link></section>} />
          </Routes>
        </div>
      </main>

      <footer className="public-footer">
        <div className="public-container">
          {localize(siteContent.footerText, locale)} · <Link to="/privacy">{locale === "ru" ? "Приватность" : locale === "es" ? "Privacidad" : "Privacy"}</Link>
        </div>
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
  return (["ru", "en", "es"] as const).find(locale => language === locale || language.startsWith(`${locale}-`)) ?? "en";
}

function getInitialTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
