// Public rendering restored from static_site; no server or editor dependencies.
import { readFileSync } from "node:fs";
import { escapeHtml } from "./static-pages.mjs";
const escapeAttribute = escapeHtml;
const contactContent = JSON.parse(readFileSync(new URL("../apps/public-site-react/src/content/contactContent.json", import.meta.url), "utf8"));
const localize = input => input?.en ?? input?.ru ?? input?.es ?? "";
export { renderContactContent, markdownToHtml, contactContent };

function renderContactContent() {
  const { resume } = contactContent;
  return `<div class="contact">
    <section class="contact-resume" aria-labelledby="resume-name">
      <header>
        <p class="contact-kicker">${escapeHtml(localize(resume.eyebrow))}</p>
        <h1 id="resume-name" class="title">${escapeHtml(localize(resume.name))}</h1>
        <p class="resume-role">${escapeHtml(localize(resume.role))}</p>
      </header>
      <div class="resume-summary">${resume.paragraphs.map((paragraph) => `<p>${escapeHtml(localize(paragraph))}</p>`).join("")}</div>
      <h2>${escapeHtml(localize(resume.skillsTitle))}</h2>
      <dl class="resume-skills">${resume.skills.map((skill) => `<div class="resume-skill"><dt>${escapeHtml(localize(skill.label))}</dt><dd>${escapeHtml(localize(skill.text))}</dd></div>`).join("")}</dl>
    </section>
    <section class="contact-channels" aria-labelledby="contact-heading">
      <h2 id="contact-heading">${escapeHtml(localize(contactContent.otherWaysTitle))}</h2>
      <div class="contact-links">${contactContent.methods.map((method) => `<a class="contact-link-card" href="${escapeAttribute(method.href)}" target="_blank" rel="noreferrer"><span class="contact-link-label">${escapeHtml(method.label)}</span><span class="contact-link-value">${escapeHtml(method.value)}</span></a>`).join("")}</div>
    </section>
  </div>`;
}

function markdownToHtml(input) {
  const result = [];
  const lines = input.replace(/\r\n/g, "\n").trim().split("\n");
  let paragraph = [];
  let list = [];
  let orderedList = false;
  let code = null;

  function flushParagraph() {
    if (paragraph.length > 0) {
      result.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length > 0) {
      const tag = orderedList ? "ol" : "ul";
      result.push(`<${tag}>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${tag}>`);
      list = [];
      orderedList = false;
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (code) {
        result.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      result.push(`<h${heading[1].length}>${renderInlineMarkdown(heading[2])}</h${heading[1].length}>`);
      continue;
    }

    const quote = /^>\s+(.+)$/.exec(line);
    if (quote) {
      flushParagraph();
      flushList();
      result.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    const unorderedItem = /^[-*]\s+(.+)$/.exec(line);
    if (unorderedItem) {
      flushParagraph();
      if (list.length > 0 && orderedList) flushList();
      orderedList = false;
      list.push(unorderedItem[1]);
      continue;
    }

    const orderedItem = /^\d+\.\s+(.+)$/.exec(line);
    if (orderedItem) {
      flushParagraph();
      if (list.length > 0 && !orderedList) flushList();
      orderedList = true;
      list.push(orderedItem[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  if (code) result.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  return result.join("\n");
}

function renderInlineMarkdown(input) {
  const escaped = escapeHtml(input);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}
