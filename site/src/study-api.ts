// Pure helpers for the local study server (site/study.ts). Nothing here
// touches the file system or runs commands, so every rule that decides what
// the server may read, write or run can be unit tested.

import { posix } from "node:path";

/** Exercise files the editor may open and save. Tests and solutions are excluded. */
const EXERCISE_PATH =
  /^(day-\d{2}-[a-z0-9-]+|leetcode\/\d{4}-[a-z0-9-]+)\/exercises\/[a-z0-9-]+\.ts$/;

export const MAX_FILE_BYTES = 256 * 1024;

export function isExercisePath(path: string): boolean {
  if (path.includes("\\") || path.includes("..") || path.startsWith("/"))
    return false;
  if (path.endsWith(".test.ts")) return false;
  if (posix.normalize(path) !== path) return false;
  return EXERCISE_PATH.test(path);
}

/**
 * Finds the test file for an exercise among the files in its folder.
 * Same name first (`two-sum.ts` → `two-sum.test.ts`), otherwise the single
 * test with the same number prefix (`01-cart-pricing.ts` → `01-cart.test.ts`).
 */
export function testFileFor(
  exercisePath: string,
  siblings: readonly string[],
): string | undefined {
  const dir = posix.dirname(exercisePath);
  const base = posix.basename(exercisePath, ".ts");
  const exact = `${base}.test.ts`;
  if (siblings.includes(exact)) return `${dir}/${exact}`;
  const prefix = /^(\d+)-/.exec(base)?.[1];
  if (!prefix) return undefined;
  const matches = siblings.filter(
    (name) => name.startsWith(`${prefix}-`) && name.endsWith(".test.ts"),
  );
  return matches.length === 1 ? `${dir}/${matches[0]}` : undefined;
}

/** Only requests addressed to this machine by name are accepted (DNS rebinding). */
export function isAllowedHost(host: string | null, port: number): boolean {
  return host === `127.0.0.1:${port}` || host === `localhost:${port}`;
}

/** Same check for the Origin header, which browsers send on cross-site requests. */
export function isAllowedOrigin(origin: string | null, port: number): boolean {
  if (origin === null) return true;
  return (
    origin === `http://127.0.0.1:${port}` ||
    origin === `http://localhost:${port}`
  );
}

export function contentHash(text: string): string {
  return Bun.hash(text).toString(16);
}

// ---------------------------------------------------------------------------
// Test results (bun test --reporter=junit)

export type TestCase = {
  name: string;
  suite: string;
  passed: boolean;
  /** First lines of the failure, when the test failed. */
  message?: string;
};

export type TestReport = { passed: number; failed: number; cases: TestCase[] };

function decodeXml(text: string): string {
  return text
    .replaceAll("&#10;", "\n")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replaceAll("&amp;", "&");
}

function attribute(tag: string, name: string): string {
  const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return decodeXml(match?.[1] ?? "");
}

/** Keeps the useful part of a failure: the message and any expected/received lines. */
function summarizeFailure(body: string): string {
  const lines = decodeXml(body)
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "" && !/^\s*at\s/.test(line));
  return lines.slice(0, 6).join("\n");
}

export function parseJunit(xml: string): TestReport {
  const cases: TestCase[] = [];
  const pattern = /<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g;
  for (const match of xml.matchAll(pattern)) {
    const tag = match[1] ?? "";
    const body = match[3] ?? "";
    const failure =
      /<(failure|error)\b([^>]*)>([\s\S]*?)<\/\1>|<(failure|error)\b([^>]*)\/>/.exec(
        body,
      );
    const testCase: TestCase = {
      name: attribute(tag, "name"),
      suite: attribute(tag, "classname"),
      passed: failure === null,
    };
    if (failure) {
      const message =
        summarizeFailure(failure[3] ?? "") ||
        attribute(failure[2] ?? failure[5] ?? "", "message");
      testCase.message = message;
    }
    cases.push(testCase);
  }
  const failed = cases.filter((item) => !item.passed).length;
  return { passed: cases.length - failed, failed, cases };
}

// ---------------------------------------------------------------------------
// Type errors (bun check --no-pretty)

export type Diagnostic = {
  line: number;
  column: number;
  code: string;
  message: string;
};

export type CheckReport = {
  /** Errors in the checked file itself. */
  diagnostics: Diagnostic[];
  /** Errors reported in files it imports. */
  elsewhere: number;
};

export function parseCheck(output: string, file: string): CheckReport {
  const diagnostics: Diagnostic[] = [];
  let elsewhere = 0;
  for (const line of output.split("\n")) {
    const match = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/.exec(
      line.trim(),
    );
    if (!match) continue;
    const [, path = "", row = "0", column = "0", code = "", message = ""] =
      match;
    if (posix.normalize(path) === file || path.endsWith(`/${file}`)) {
      diagnostics.push({
        line: Number(row),
        column: Number(column),
        code,
        message,
      });
    } else {
      elsewhere += 1;
    }
  }
  return { diagnostics, elsewhere };
}
