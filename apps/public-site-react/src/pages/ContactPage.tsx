import type { LocaleCode, LocalizedText } from "@template/contracts";
import { Seo } from "../components/Seo";
import { siteContent } from "../content/siteContent";
import { localize } from "../lib/localize";

export function ContactPage({ locale }: { locale: LocaleCode }) {
  return (
    <div className="contact">
      <Seo
        title={`${localize(siteContent.contact.title, locale)} | d-antes`}
        description={localize(siteContent.contact.subtitle, locale)}
        path="/contact"
        locale={locale}
      />
      <section className="blog-hero">
        <h1 className="title">{localize(siteContent.contact.title, locale)}</h1>
        <p className="subtitle">{localize(siteContent.contact.subtitle, locale)}</p>
      </section>

      <section className="contact-sheet">
        <div className="contact-intro-card">
          <p className="contact-kicker">{localize(contactPageCopy.kicker, locale)}</p>
          <h2>{localize(siteContent.contact.otherWaysTitle, locale)}</h2>
          <p>{localize(contactPageCopy.summary, locale)}</p>
        </div>

        <div className="contact-links">
          {siteContent.contact.methods.map((method) => (
            <a className="contact-link-card" href={method.href} key={method.label} target="_blank" rel="noreferrer">
              <span className="contact-link-label">{method.label}</span>
              <span className="contact-link-value">{method.value}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

const contactPageCopy: Record<string, LocalizedText> = {
  kicker: {
    en: "Direct outreach only",
    ru: "Только прямой контакт",
    es: "Solo contacto directo"
  },
  summary: {
    en: "The page lists the channels that are actually useful for collaboration: source code, professional profile, and messengers. No embedded form means no extra GDPR consent flow, no message storage, and no inbox hidden inside the site.",
    ru: "Здесь перечислены только те каналы, которые реально работают для общения: исходники, профессиональный профиль и мессенджеры. Без встроенной формы не нужен лишний GDPR-поток согласий, не хранится переписка и не появляется еще один скрытый инбокс внутри сайта.",
    es: "Aqui se muestran solo los canales que sirven de verdad para colaborar: codigo fuente, perfil profesional y mensajeria. Sin formulario embebido no hace falta un flujo extra de consentimiento, no se guardan mensajes y no nace otro inbox escondido dentro del sitio."
  }
};
