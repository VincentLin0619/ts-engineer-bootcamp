// Local preview of the built site:  bun run site:dev
// Serves site/dist at http://localhost:4321 (pass a port as the first argument).

import { join, normalize } from "node:path";

const DIST = join(import.meta.dir, "dist");
const port = Number(process.argv[2] ?? 4321);

const server = Bun.serve({
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url);
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
      if (await file.exists()) return new Response(file);
    }
    return new Response(Bun.file(join(DIST, "404.html")), { status: 404 });
  },
});

console.log(`預覽網站：http://localhost:${server.port}/（按 Ctrl+C 停止）`);
