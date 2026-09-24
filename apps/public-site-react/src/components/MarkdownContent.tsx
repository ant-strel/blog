import type { ReactNode } from "react";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${block.level}` as "h1" | "h2" | "h3" | "h4";
          return <Heading key={index}>{renderInlineMarkdown(block.text)}</Heading>;
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </List>
          );
        }

        if (block.type === "code") {
          return (
            <pre key={index}>
              <code>{block.text}</code>
            </pre>
          );
        }

        if (block.type === "quote") {
          return <blockquote key={index}>{renderInlineMarkdown(block.text)}</blockquote>;
        }

        return <p key={index}>{renderInlineMarkdown(block.text)}</p>;
      })}
    </div>
  );
}

type MarkdownBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "code"; text: string }
  | { type: "quote"; text: string };

function parseMarkdownBlocks(input: string): MarkdownBlock[] {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const blocks: MarkdownBlock[] = [];
  const lines = normalized.split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];
  let orderedList = false;
  let code: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length > 0) {
      blocks.push({ type: "list", items: list, ordered: orderedList });
      list = [];
      orderedList = false;
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (code) {
        blocks.push({ type: "code", text: code.join("\n") });
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
      blocks.push({ type: "heading", level: heading[1].length as 1 | 2 | 3 | 4, text: heading[2] });
      continue;
    }

    const quote = /^>\s+(.+)$/.exec(line);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: quote[1] });
      continue;
    }

    const listItem = /^[-*]\s+(.+)$/.exec(line);
    if (listItem) {
      flushParagraph();
      if (list.length > 0 && orderedList) flushList();
      orderedList = false;
      list.push(listItem[1]);
      continue;
    }

    const orderedListItem = /^\d+\.\s+(.+)$/.exec(line);
    if (orderedListItem) {
      flushParagraph();
      if (list.length > 0 && !orderedList) flushList();
      orderedList = true;
      list.push(orderedListItem[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  if (code) {
    blocks.push({ type: "code", text: code.join("\n") });
  }

  return blocks;
}

function renderInlineMarkdown(input: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(`[^`]+`|\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let cursor = 0;

  for (const match of input.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(input.slice(cursor, index));

    const token = match[0];
    const link = /^\[([^\]]+)\]\(([^\s)]+)\)$/.exec(token);
    if (link && isSafeLink(link[2])) {
      nodes.push(<a href={link[2]} target="_blank" rel="noreferrer" key={index}>{link[1]}</a>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={index}>{token.slice(1, -1)}</code>);
    } else {
      nodes.push(token);
    }

    cursor = index + token.length;
  }

  if (cursor < input.length) nodes.push(input.slice(cursor));
  return nodes;
}

function isSafeLink(value: string): boolean {
  return /^(https?:|mailto:)/i.test(value);
}
