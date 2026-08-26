import { useEffect } from "react";
import type { LocaleCode } from "@template/contracts";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  locale: LocaleCode;
  noIndex?: boolean;
  type?: "website" | "article";
  structuredData?: Record<string, unknown>;
  articleMeta?: {
    publishedAtUtc?: string;
    updatedAtUtc?: string;
    tags?: string[];
  };
}

const siteName = "d-antes";

export function Seo({
  title,
  description,
  path,
  locale,
  noIndex = false,
  type = "website",
  structuredData,
  articleMeta
}: SeoProps) {
  useEffect(() => {
    const canonicalUrl = absoluteUrl(path);
    document.documentElement.lang = locale;
    document.title = title;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertCanonical(canonicalUrl);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", siteName);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:locale", locale);
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    removeManagedArticleMeta();
    if (articleMeta?.publishedAtUtc) {
      appendManagedMeta("article:published_time", articleMeta.publishedAtUtc);
    }

    if (articleMeta?.updatedAtUtc) {
      appendManagedMeta("article:modified_time", articleMeta.updatedAtUtc);
    }

    for (const tag of articleMeta?.tags ?? []) {
      appendManagedMeta("article:tag", tag);
    }

    upsertJsonLd(structuredData);
  }, [articleMeta, description, locale, noIndex, path, structuredData, title, type]);

  return null;
}

function absoluteUrl(path: string): string {
  const configuredBase = (import.meta.env.VITE_CANONICAL_BASE_URL ?? import.meta.env.VITE_PUBLIC_BASE_URL) as string | undefined;
  const baseUrl = configuredBase?.trim() || window.location.origin;
  return new URL(path.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`).toString();
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = href;
}

function removeManagedArticleMeta() {
  document.head.querySelectorAll('meta[data-managed-article="true"]').forEach((element) => element.remove());
}

function appendManagedMeta(property: string, content: string) {
  const element = document.createElement("meta");
  element.setAttribute("property", property);
  element.setAttribute("data-managed-article", "true");
  element.content = content;
  document.head.appendChild(element);
}

function upsertJsonLd(value?: Record<string, unknown>) {
  const existing = document.head.querySelector<HTMLScriptElement>('script[data-managed-json-ld="true"]');
  if (!value) {
    existing?.remove();
    return;
  }

  const element = existing ?? document.createElement("script");
  element.type = "application/ld+json";
  element.setAttribute("data-managed-json-ld", "true");
  element.textContent = JSON.stringify(value);
  if (!existing) {
    document.head.appendChild(element);
  }
}
