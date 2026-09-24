import type { LocaleCode } from "@template/contracts";
import { Seo } from "../components/Seo";
import { siteContent } from "../content/siteContent";
import { localize } from "../lib/localize";

export function ContactPage({ locale }: { locale: LocaleCode }) {
  const { resume } = siteContent.contact;
  return (
    <div className="contact">
      <Seo
        title={`${localize(siteContent.contact.title, locale)} | d-antes`}
        description={localize(siteContent.contact.subtitle, locale)}
        path="/contact"
        locale={locale}
      />

      <section className="contact-resume" aria-labelledby="resume-name">
        <header>
          <p className="contact-kicker">{localize(resume.eyebrow, locale)}</p>
          <h1 id="resume-name" className="title">{localize(resume.name, locale)}</h1>
          <p className="resume-role">{localize(resume.role, locale)}</p>
        </header>
        <div className="resume-summary">
          {resume.paragraphs.map((paragraph, index) => <p key={index}>{localize(paragraph, locale)}</p>)}
        </div>
        <h2>{localize(resume.skillsTitle, locale)}</h2>
        <dl className="resume-skills">
          {resume.skills.map((skill) => (
            <div className="resume-skill" key={skill.label.en}>
              <dt>{localize(skill.label, locale)}</dt>
              <dd>{localize(skill.text, locale)}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="contact-channels" aria-labelledby="contact-heading">
        <h2 id="contact-heading">{localize(siteContent.contact.otherWaysTitle, locale)}</h2>
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
