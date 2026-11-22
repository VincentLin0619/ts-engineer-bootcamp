// Renders a lesson README to HTML for the site, using Bun's built-in
// Markdown parser, then rewrites the parts the site handles differently:
// heading ids, code highlighting, Mermaid, animation markers and links.

import { posix } from "node:path";
import { escapeHtml, highlightLines, toLanguage } from "./highlight.ts";

export type Heading = { id: string; text: string; level: 2 | 3 };

export type RenderedDoc = {
  /** Text of the first `# ` heading, without Markdown. */
  title: string;
  /** Blockquote directly under the title, if any (plain text). */
  lead: string | undefined;
  html: string;
  headings: Heading[];
  /** Ids of every animation embedded on the page. */
  animations: string[];
};

export type LinkContext = {
  /** Repository path of the Markdown file, for example `day-03-x/README.md`. */
  sourcePath: string;
  /** How many folders deep the output page is (`day-03/` is 1). */
  depth: number;
  /** Maps a repository path to a site path (no leading slash), if it has a page. */
  pageFor: (repoPath: string) => string | undefined;
  repoUrl: string;
  siteUrl: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TypeScript",
  sql: "SQL",
  bash: "終端機",
  json: "JSON",
};

export function decodeEntities(text: string): string {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

export function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ""));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s　]+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderCode(language: string | undefined, encoded: string): string {
  const source = decodeEntities(encoded).replace(/\n$/, "");
  if (language === "mermaid") {
    return `<div class="diagram"><div class="diagram-scroll"><pre class="mermaid" data-src="${escapeHtml(source)}">${escapeHtml(source)}</pre></div></div>`;
  }
  const lang = toLanguage(language);
  const label = LANGUAGE_LABELS[lang];
  const lines = highlightLines(source, lang).join("\n");
  const caption = label ? `<span class="codeblock-lang">${label}</span>` : "";
  return `<div class="codeblock" data-lang="${lang}">${caption}<pre><code>${lines}</code></pre></div>`;
}

function rewriteHref(href: string, context: LinkContext): string {
  if (/^(https?:|mailto:|#)/.test(href)) {
    const sitePrefix = `${context.siteUrl}/`;
    if (href.startsWith(sitePrefix)) {
      return `${"../".repeat(context.depth)}${href.slice(sitePrefix.length)}`;
    }
    return href;
  }
  const [pathPart = "", hash = ""] = href.split("#");
  const resolved = posix.normalize(
    posix.join(posix.dirname(context.sourcePath), pathPart),
  );
  const anchor = hash ? `#${hash}` : "";
  const page = context.pageFor(resolved);
  if (page !== undefined)
    return `${"../".repeat(context.depth)}${page}${anchor}`;
  const kind = /\.[a-z]+$/i.test(resolved) ? "blob" : "tree";
  return `${context.repoUrl}/${kind}/main/${resolved.replace(/\/$/, "")}${anchor}`;
}

export function renderMarkdown(
  source: string,
  context: LinkContext,
): RenderedDoc {
  let html = Bun.markdown.html(source, {
    tables: true,
    tasklists: true,
    strikethrough: true,
  });

  // Title and the lead blockquote right under it.
  let title = "";
  html = html.replace(
    /<h1[^>]*>([\s\S]*?)<\/h1>\n?/,
    (_match, inner: string) => {
      title = stripTags(inner).trim();
      return "";
    },
  );
  let lead: string | undefined;
  html = html.replace(
    /^\s*<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>\n?/,
    (match, inner: string) => {
      if (inner.includes("▶")) return match;
      lead = stripTags(inner).trim();
      return "";
    },
  );

  // Animation markers: > ▶ 動畫演示：[text](<site>/<page>/#anim-<id>)
  const animations: string[] = [];
  html = html.replace(
    /<blockquote>\s*<p>▶[\s\S]*?#anim-([a-z0-9-]+)"[\s\S]*?<\/blockquote>\n?/g,
    (_match, id: string) => {
      animations.push(id);
      return `<figure class="player-slot" id="anim-${id}" data-scene="${id}"><p class="player-loading">動畫載入中。沒有出現的話，請確認瀏覽器允許 JavaScript。</p></figure>\n`;
    },
  );

  // Code blocks (including Mermaid).
  html = html.replace(
    /<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_match, language: string | undefined, code: string) =>
      renderCode(language, code),
  );

  // Headings get readable ids that keep Chinese characters.
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  html = html.replace(
    /<h([23])[^>]*>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, inner: string) => {
      const text = stripTags(inner).trim();
      const base = slugify(text) || "section";
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      const depth = level === "2" ? 2 : 3;
      headings.push({ id, text, level: depth });
      return `<h${level} id="${id}"><a class="heading-anchor" href="#${id}">${inner}</a></h${level}>`;
    },
  );

  // Links.
  html = html.replace(/href="([^"]+)"/g, (_match, href: string) => {
    return `href="${escapeHtml(rewriteHref(decodeEntities(href), context))}"`;
  });

  // Wide tables scroll sideways on small screens.
  html = html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");

  // Self-check lists become real checkboxes that remember their state.
  let checkIndex = 0;
  html = html.replace(
    /<input type="checkbox" class="task-list-item-checkbox" disabled( checked)?>/g,
    () => {
      checkIndex += 1;
      return `<input type="checkbox" class="task-list-item-checkbox" name="check-${checkIndex}" data-check="${checkIndex}" aria-label="標記為已完成">`;
    },
  );

  return { title, lead, html, headings, animations };
}
