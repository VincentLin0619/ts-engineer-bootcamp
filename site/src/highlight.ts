// A small, dependency-free syntax highlighter used both at build time (lesson
// code blocks) and in the browser (the animation player's code panel).
// It works line by line and carries block-comment / template-string state
// across lines, which is enough for the short programs in this course.

export type Language = "ts" | "sql" | "bash" | "json" | "text";

const TS_KEYWORDS = new Set([
  "abstract",
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "constructor",
  "continue",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "of",
  "override",
  "private",
  "protected",
  "public",
  "readonly",
  "return",
  "set",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "type",
  "typeof",
  "var",
  "void",
  "while",
]);

const TS_LITERALS = new Set(["true", "false", "null", "undefined", "NaN"]);

const TS_BUILTIN_TYPES = new Set([
  "string",
  "number",
  "boolean",
  "unknown",
  "never",
  "any",
  "object",
  "bigint",
  "symbol",
]);

const SQL_KEYWORDS = new Set(
  [
    "add",
    "and",
    "as",
    "asc",
    "autoincrement",
    "by",
    "create",
    "default",
    "delete",
    "desc",
    "drop",
    "exists",
    "from",
    "if",
    "insert",
    "integer",
    "into",
    "join",
    "key",
    "limit",
    "not",
    "null",
    "on",
    "or",
    "order",
    "primary",
    "returning",
    "select",
    "set",
    "table",
    "text",
    "update",
    "values",
    "where",
  ].map((word) => word.toLowerCase()),
);

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function span(kind: string, text: string): string {
  return `<span class="tk-${kind}">${escapeHtml(text)}</span>`;
}

type TsState = { inBlockComment: boolean; inTemplate: boolean };

function highlightTsLine(line: string, state: TsState): string {
  let out = "";
  let i = 0;

  const readUntil = (end: string, from: number): number => {
    const index = line.indexOf(end, from);
    return index === -1 ? line.length : index + end.length;
  };

  while (i < line.length) {
    if (state.inBlockComment) {
      const end = readUntil("*/", i);
      out += span("com", line.slice(i, end));
      state.inBlockComment = !line.slice(i, end).endsWith("*/");
      i = end;
      continue;
    }
    if (state.inTemplate) {
      let j = i;
      while (j < line.length && line[j] !== "`") {
        j += line[j] === "\\" ? 2 : 1;
      }
      const closed = j < line.length;
      out += span("str", line.slice(i, closed ? j + 1 : line.length));
      state.inTemplate = !closed;
      i = closed ? j + 1 : line.length;
      continue;
    }

    const rest = line.slice(i);
    const char = line[i] ?? "";

    if (rest.startsWith("//")) {
      out += span("com", rest);
      break;
    }
    if (rest.startsWith("/*")) {
      state.inBlockComment = true;
      continue;
    }
    if (char === '"' || char === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== char) {
        j += line[j] === "\\" ? 2 : 1;
      }
      out += span("str", line.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (char === "`") {
      state.inTemplate = true;
      out += span("str", "`");
      i += 1;
      continue;
    }
    const number = /^\d[\d_]*(\.\d+)?/.exec(rest);
    if (number && !/[\w$]/.test(line[i - 1] ?? "")) {
      out += span("num", number[0]);
      i += number[0].length;
      continue;
    }
    const word = /^[#A-Za-z_$][\w$]*/.exec(rest);
    if (word) {
      const text = word[0];
      const next = line.slice(i + text.length);
      if (TS_KEYWORDS.has(text)) {
        out += span("kw", text);
      } else if (TS_LITERALS.has(text)) {
        out += span("lit", text);
      } else if (
        TS_BUILTIN_TYPES.has(text) ||
        /^[A-Z][A-Za-z0-9]*$/.test(text)
      ) {
        out += span("type", text);
      } else if (/^\s*\(/.test(next) || /^\s*=\s*(async\s*)?\(/.test(next)) {
        out += span("fn", text);
      } else {
        out += escapeHtml(text);
      }
      i += text.length;
      continue;
    }
    out += escapeHtml(char);
    i += 1;
  }
  return out;
}

function highlightSqlLine(line: string): string {
  let out = "";
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    const char = line[i] ?? "";
    if (rest.startsWith("--")) {
      out += span("com", rest);
      break;
    }
    if (char === "'") {
      const end = line.indexOf("'", i + 1);
      const stop = end === -1 ? line.length : end + 1;
      out += span("str", line.slice(i, stop));
      i = stop;
      continue;
    }
    if (char === "?" || char === "$") {
      const param = /^[?$][\w]*/.exec(rest)?.[0] ?? char;
      out += span("lit", param);
      i += param.length;
      continue;
    }
    const number = /^\d+/.exec(rest);
    if (number) {
      out += span("num", number[0]);
      i += number[0].length;
      continue;
    }
    const word = /^[A-Za-z_]\w*/.exec(rest);
    if (word) {
      out += SQL_KEYWORDS.has(word[0].toLowerCase())
        ? span("kw", word[0])
        : escapeHtml(word[0]);
      i += word[0].length;
      continue;
    }
    out += escapeHtml(char);
    i += 1;
  }
  return out;
}

function highlightBashLine(line: string): string {
  const commentAt = line.search(/(^|\s)#/);
  const code = commentAt === -1 ? line : line.slice(0, commentAt);
  const comment = commentAt === -1 ? "" : line.slice(commentAt);
  let out = "";
  let first = true;
  for (const part of code.split(/(\s+|'[^']*'|"[^"]*")/)) {
    if (part === "") continue;
    if (/^\s+$/.test(part)) {
      out += part;
    } else if (/^['"]/.test(part)) {
      out += span("str", part);
    } else if (first) {
      out += span("fn", part);
      first = false;
    } else if (part.startsWith("-")) {
      out += span("kw", part);
    } else if (part === "|" || part === "&&") {
      out += escapeHtml(part);
      first = true;
    } else {
      out += escapeHtml(part);
    }
  }
  return out + (comment ? span("com", comment) : "");
}

function highlightJsonLine(line: string): string {
  return line
    .split(/("(?:[^"\\]|\\.)*"\s*:?|-?\d+(?:\.\d+)?|true|false|null)/)
    .map((part) => {
      if (/^".*:\s*$/.test(part)) return span("prop", part);
      if (part.startsWith('"')) return span("str", part);
      if (/^-?\d/.test(part)) return span("num", part);
      if (part === "true" || part === "false" || part === "null") {
        return span("lit", part);
      }
      return escapeHtml(part);
    })
    .join("");
}

/** Highlights source code and returns one HTML string per line. */
export function highlightLines(code: string, language: Language): string[] {
  const lines = code.replace(/\n$/, "").split("\n");
  if (language === "ts") {
    const state: TsState = { inBlockComment: false, inTemplate: false };
    return lines.map((line) => highlightTsLine(line, state));
  }
  if (language === "sql") return lines.map(highlightSqlLine);
  if (language === "bash") return lines.map(highlightBashLine);
  if (language === "json") return lines.map(highlightJsonLine);
  return lines.map(escapeHtml);
}

/** Maps a Markdown info string to a supported language. */
export function toLanguage(info: string | undefined): Language {
  const name = (info ?? "").toLowerCase();
  if (["ts", "typescript", "js", "javascript", "tsx"].includes(name))
    return "ts";
  if (name === "sql") return "sql";
  if (["bash", "sh", "shell", "zsh", "console"].includes(name)) return "bash";
  if (name === "json") return "json";
  return "text";
}
