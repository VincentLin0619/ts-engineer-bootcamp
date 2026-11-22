// Local study mode:  bun run study
//
// Serves the built course site on http://127.0.0.1:4322 and adds a small API
// so the in-page editor can read and save exercise files and run `bun test`
// and `bun check` on them. Safety rules (see site/src/study-api.ts):
//   - listens on 127.0.0.1 only and checks the Host and Origin headers
//   - every API call needs the random token injected into the served pages
//   - only existing exercise files can be read or written (no tests,
//     solutions or new files), at most 256 KB
//   - only `bun test`, `bun check` and read-only `git` run, with fixed
//     arguments and no shell, and a 30 second timeout

import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, normalize } from "node:path";
import {
  contentHash,
  isAllowedHost,
  isAllowedOrigin,
  isExercisePath,
  MAX_FILE_BYTES,
  parseCheck,
  parseJunit,
  testFileFor,
} from "./src/study-api.ts";

const ROOT = join(import.meta.dir, "..");
const DIST = join(import.meta.dir, "dist");
const PORT = Number(process.argv.find((arg) => /^\d+$/.test(arg)) ?? 4322);
const TOKEN = crypto.randomUUID();
const COMMAND_TIMEOUT_MS = 30_000;

const running = new Set<string>();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function fail(message: string, status: number): Response {
  return json({ error: message }, status);
}

async function run(
  cmd: string[],
): Promise<{ code: number; stdout: string; stderr: string }> {
  const child = Bun.spawn({
    cmd,
    cwd: ROOT,
    stdout: "pipe",
    stderr: "pipe",
    timeout: COMMAND_TIMEOUT_MS,
    // Exercises, not reference solutions; plain output without colour codes.
    // biome-ignore lint/style/useNamingConvention: environment variable names
    env: { ...process.env, SOLUTIONS: "", FORCE_COLOR: "0", NO_COLOR: "1" },
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout, stderr };
}

/** Runs one command per file at a time, so double clicks do not pile up. */
async function exclusive<T>(
  key: string,
  task: () => Promise<T>,
): Promise<T | Response> {
  if (running.has(key)) return fail("上一次的執行還沒結束，請稍等。", 429);
  running.add(key);
  try {
    return await task();
  } finally {
    running.delete(key);
  }
}

async function readExercise(path: string): Promise<string | undefined> {
  const file = Bun.file(join(ROOT, path));
  return (await file.exists()) ? file.text() : undefined;
}

async function bodyOf(
  request: Request,
): Promise<Record<string, unknown> | undefined> {
  const text = await request.text();
  if (text.length > MAX_FILE_BYTES + 4096) return undefined;
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function pathParam(value: unknown): string | undefined {
  return typeof value === "string" && isExercisePath(value) ? value : undefined;
}

// ---------------------------------------------------------------------------
// API

async function api(request: Request, url: URL): Promise<Response> {
  if (request.headers.get("x-study-token") !== TOKEN)
    return fail("缺少或錯誤的 token。", 403);
  const method = request.method;

  if (url.pathname === "/api/file" && method === "GET") {
    const path = pathParam(url.searchParams.get("path"));
    if (!path) return fail("不允許的檔案路徑。", 400);
    const content = await readExercise(path);
    if (content === undefined) return fail("找不到這個練習檔。", 404);
    return json({ content, hash: contentHash(content) });
  }

  const body = method === "GET" ? undefined : await bodyOf(request);
  if (method !== "GET" && !body) return fail("請求內容格式錯誤。", 400);
  const path = pathParam(body?.path ?? url.searchParams.get("path"));
  if (!path) return fail("不允許的檔案路徑。", 400);

  if (url.pathname === "/api/file" && method === "PUT") {
    const content = body?.content;
    if (typeof content !== "string") return fail("缺少檔案內容。", 400);
    if (new TextEncoder().encode(content).length > MAX_FILE_BYTES) {
      return fail("檔案太大，上限是 256 KB。", 413);
    }
    const current = await readExercise(path);
    if (current === undefined) return fail("找不到這個練習檔。", 404);
    const force = body?.force === true;
    if (!force && body?.baseHash !== contentHash(current)) {
      return json(
        {
          error: "檔案在別處被修改了。",
          content: current,
          hash: contentHash(current),
        },
        409,
      );
    }
    await Bun.write(join(ROOT, path), content);
    return json({ hash: contentHash(content), savedAt: Date.now() });
  }

  if (url.pathname === "/api/check" && method === "POST") {
    return exclusive(`check:${path}`, async () => {
      const result = await run(["bun", "check", "--no-pretty", path]);
      const report = parseCheck(`${result.stdout}\n${result.stderr}`, path);
      return json(report);
    });
  }

  if (url.pathname === "/api/test" && method === "POST") {
    const dir = path.slice(0, path.lastIndexOf("/"));
    const siblings = await readdir(join(ROOT, dir));
    const testFile = testFileFor(path, siblings);
    if (!testFile) return fail("找不到這個練習對應的測試檔。", 404);
    return exclusive(`test:${testFile}`, async () => {
      const temp = await mkdtemp(join(tmpdir(), "study-junit-"));
      const report = join(temp, "report.xml");
      try {
        const result = await run([
          "bun",
          "test",
          `./${testFile}`,
          "--reporter=junit",
          `--reporter-outfile=${report}`,
        ]);
        const file = Bun.file(report);
        if (!(await file.exists())) {
          const output = `${result.stdout}\n${result.stderr}`
            .trim()
            .split("\n")
            .slice(-8)
            .join("\n");
          return json({
            passed: 0,
            failed: 0,
            cases: [],
            testFile,
            crashed: output || "測試沒有產生結果。",
          });
        }
        return json({ ...parseJunit(await file.text()), testFile });
      } finally {
        await rm(temp, { recursive: true, force: true });
      }
    });
  }

  if (url.pathname === "/api/original" && method === "POST") {
    const log = await run([
      "git",
      "log",
      "--diff-filter=A",
      "--format=%H",
      "--",
      path,
    ]);
    const first = log.stdout.trim().split("\n").filter(Boolean).at(-1);
    if (!first || !/^[0-9a-f]{40}$/.test(first))
      return fail("在 git 紀錄裡找不到這個檔案最初的版本。", 404);
    const show = await run(["git", "show", `${first}:${path}`]);
    if (show.code !== 0) return fail("讀取原始題目失敗。", 500);
    return json({ content: show.stdout });
  }

  return fail("沒有這個 API。", 404);
}

// ---------------------------------------------------------------------------
// Static files

async function page(pathname: string): Promise<Response> {
  const safe = normalize(decodeURIComponent(pathname)).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  const candidates = safe.endsWith("/")
    ? [join(DIST, safe, "index.html")]
    : [join(DIST, safe), join(DIST, safe, "index.html")];
  for (const path of candidates) {
    if (!path.startsWith(DIST)) break;
    const file = Bun.file(path);
    if (!(await file.exists())) continue;
    if (path.endsWith(".html")) {
      const html = await file.text();
      const config = `<script>window.studyConfig=${JSON.stringify({ token: TOKEN })}</script>`;
      return new Response(html.replace("</head>", `${config}\n</head>`), {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }
    return new Response(file, { headers: { "cache-control": "no-store" } });
  }
  return new Response(Bun.file(join(DIST, "404.html")), { status: 404 });
}

if (!(await Bun.file(join(DIST, "index.html")).exists())) {
  console.error(
    "找不到建置好的網站。請用 bun run study 啟動，它會先建置網站。",
  );
  process.exit(1);
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    if (!isAllowedHost(request.headers.get("host"), PORT))
      return fail("不允許的 Host。", 403);
    if (url.pathname.startsWith("/api/")) {
      if (!isAllowedOrigin(request.headers.get("origin"), PORT))
        return fail("不允許的來源。", 403);
      try {
        return await api(request, url);
      } catch (error) {
        console.error(error);
        return fail("伺服器發生錯誤，請看終端機的訊息。", 500);
      }
    }
    return page(url.pathname);
  },
});

const address = `http://127.0.0.1:${server.port}/`;
console.log(`本機學習模式：${address}`);
console.log(
  "練習區會出現編輯器，存檔直接寫回 exercises/ 裡的檔案。按 Ctrl+C 結束。",
);
if (process.platform === "darwin" && !process.argv.includes("--no-open")) {
  Bun.spawn({ cmd: ["open", address], stdout: "ignore", stderr: "ignore" });
}
