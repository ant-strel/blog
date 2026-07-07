import { FormEvent, useState } from "react";
import type { LocaleCode } from "@template/contracts";
import { siteContent } from "../content/siteContent";
import { localize } from "../lib/localize";

export function ContactPage({ locale }: { locale: LocaleCode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setName("");
    setEmail("");
    setMessage("");
    setSent(true);
  }

  return (
    <div className="contact">
      <section className="blog-hero">
        <h1 className="title">{localize(siteContent.contact.title, locale)}</h1>
        <p className="subtitle">{localize(siteContent.contact.subtitle, locale)}</p>
      </section>

      <div className="contact-form">
        <form onSubmit={submitForm}>
          <div className="form-group">
            <label htmlFor="contact-name">{localize(siteContent.contact.nameLabel, locale)}</label>
            <input
              id="contact-name"
              className="form-control"
              value={name}
              placeholder={localize(siteContent.contact.namePlaceholder, locale)}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-email">{localize(siteContent.contact.emailLabel, locale)}</label>
            <input
              id="contact-email"
              className="form-control"
              type="email"
              value={email}
              placeholder={localize(siteContent.contact.emailPlaceholder, locale)}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-message">{localize(siteContent.contact.messageLabel, locale)}</label>
            <textarea
              id="contact-message"
              className="form-control"
              rows={5}
              value={message}
              placeholder={localize(siteContent.contact.messagePlaceholder, locale)}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          <div className="submit-wrapper">
            <button className="btn btn-primary" type="submit">
              {localize(siteContent.contact.submitLabel, locale)}
            </button>
          </div>
        </form>

        {sent && <p className="form-status">{localize(siteContent.contact.sentStatus, locale)}</p>}

        <div className="contact-info">
          <h3>{localize(siteContent.contact.otherWaysTitle, locale)}</h3>
          {siteContent.contact.methods.map((method) => (
            <div className="contact-method" key={method.label}>
              <span className="contact-method-label">{method.label}:</span>
              {method.href ? (
                <a href={method.href} target="_blank" rel="noreferrer">
                  {method.value}
                </a>
              ) : (
                <span>{method.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
