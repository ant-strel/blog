import { Link } from "react-router-dom";
import type { LocaleCode } from "@template/contracts";
import { siteContent } from "../content/siteContent";
import { localize } from "../lib/localize";

export function HomePage({ locale }: { locale: LocaleCode }) {
  return (
    <section className="home-intro">
      <h1>{localize(siteContent.home.title, locale)}</h1>
      <p>{localize(siteContent.home.subtitle, locale)}</p>
      <div className="home-actions">
        <Link className="btn btn-primary" to="/blog">
          {localize(siteContent.home.blogCta, locale)}
        </Link>
        <Link className="btn btn-outline" to="/contact">
          {localize(siteContent.home.contactCta, locale)}
        </Link>
      </div>
    </section>
  );
}
