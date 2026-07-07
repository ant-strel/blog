import { useMemo, useRef, useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange(value: string): void;
  rows?: number;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  rows = 16,
  placeholder = "Write article content..."
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [preview, setPreview] = useState(false);
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;
  const html = useMemo(() => renderMarkdown(value), [value]);

  function insertMarkdown(before: string, after = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function insertLink() {
    const url = window.prompt("URL", "https://");
    if (!url) return;
    insertMarkdown("[Link text](", `${url})`);
  }

  function insertCodeBlock() {
    insertMarkdown("```text\n", "\n```");
  }

  return (
    <div className="rich-editor">
      <div className="editor-toolbar" aria-label="Markdown toolbar">
        <button type="button" onClick={() => insertMarkdown("**", "**")} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => insertMarkdown("*", "*")} title="Italic">
          <em>I</em>
        </button>
        <button type="button" onClick={() => insertMarkdown("# ")} title="Heading 1">
          H1
        </button>
        <button type="button" onClick={() => insertMarkdown("## ")} title="Heading 2">
          H2
        </button>
        <button type="button" onClick={() => insertMarkdown("> ")} title="Quote">
          "
        </button>
        <button type="button" onClick={() => insertMarkdown("- ")} title="Bullet list">
          -
        </button>
        <button type="button" onClick={() => insertMarkdown("1. ")} title="Numbered list">
          1.
        </button>
        <button type="button" onClick={() => insertMarkdown("`", "`")} title="Inline code">
          ``
        </button>
        <button type="button" onClick={insertCodeBlock} title="Code block">
          {"{}"}
        </button>
        <button type="button" onClick={insertLink} title="Link">
          @
        </button>
        <button
          type="button"
          className={preview ? "active" : ""}
          onClick={() => setPreview((current) => !current)}
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <textarea
          ref={textareaRef}
          className="markdown-input"
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      <div className="editor-footer">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
}

function renderMarkdown(markdown: string): string {
  const lines = escapeHtml(markdown).split("\n");
  const result: string[] = [];
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;

  function flushList() {
    if (listItems.length === 0) return;
    result.push(`<ul>${listItems.map((item) => `<li>${formatInline(item)}</li>`).join("")}</ul>`);
    listItems = [];
  }

  function flushOrderedList() {
    if (orderedListItems.length === 0) return;
    result.push(`<ol>${orderedListItems.map((item) => `<li>${formatInline(item)}</li>`).join("")}</ol>`);
    orderedListItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        result.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
        codeLines = [];
        inCodeBlock = false;
      } else {
        flushList();
        flushOrderedList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushList();
      flushOrderedList();
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushOrderedList();
      listItems.push(trimmed.slice(2));
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushList();
      orderedListItems.push(orderedMatch[1]);
      continue;
    }

    flushList();
    flushOrderedList();
    if (trimmed.startsWith("### ")) {
      result.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      result.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      result.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith("> ")) {
      result.push(`<blockquote>${formatInline(trimmed.slice(2))}</blockquote>`);
    } else {
      result.push(`<p>${formatInline(trimmed)}</p>`);
    }
  }

  flushList();
  flushOrderedList();
  if (inCodeBlock) {
    result.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
  }
  return result.join("");
}

function formatInline(value: string): string {
  return value
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
