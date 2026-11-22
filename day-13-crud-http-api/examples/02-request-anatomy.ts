// Run from the project root:
//   bun run day-13-crud-http-api/examples/02-request-anatomy.ts
//
// The server reports back every part of the request it received, so you can
// see where the method, the path, the query string and the body end up.

const server = Bun.serve({
  port: 0,
  // biome-ignore-start lint/style/useNamingConvention: HTTP methods are upper case
  routes: {
    // ":id" is a route parameter: it matches any text in that position.
    "/notes/:id": {
      // One function per HTTP method.
      GET: (request) => {
        const url = new URL(request.url);
        return Response.json({
          method: request.method,
          path: url.pathname,
          // Route parameters are always text, even when they look like numbers.
          id: request.params.id,
          // The part after "?" in the URL. null when it is not there.
          lang: url.searchParams.get("lang"),
        });
      },
      PATCH: async (request) => {
        // The body is JSON text. request.json() turns it into a value.
        const body: unknown = await request.json();
        return Response.json({
          method: request.method,
          contentType: request.headers.get("Content-Type"),
          body,
        });
      },
      // 204 means "done, and there is nothing to send back".
      DELETE: () => new Response(null, { status: 204 }),
    },
  },
  // biome-ignore-end lint/style/useNamingConvention: HTTP methods are upper case
  // Runs when no route matches the path or the method.
  fetch() {
    return Response.json({ error: "找不到這個路徑" }, { status: 404 });
  },
});

// Sends one request and prints the request line, the status and the body.
async function show(
  method: string,
  path: string,
  body?: unknown,
): Promise<void> {
  const response = await fetch(new URL(path, server.url), {
    method,
    // Only requests with a body need the Content-Type header.
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  console.log(`${method} ${path}`);
  console.log(
    `  -> ${response.status} ${text === "" ? "（沒有 body）" : text}`,
  );
}

await show("GET", "/notes/7");
await show("GET", "/notes/7?lang=zh");
await show("PATCH", "/notes/7", { text: "記得帶傘" });
await show("DELETE", "/notes/7");
// The route exists, but it has no POST function.
await show("POST", "/notes/7", { text: "記得帶傘" });
// No route has this path.
await show("GET", "/notebooks");

await server.stop();
