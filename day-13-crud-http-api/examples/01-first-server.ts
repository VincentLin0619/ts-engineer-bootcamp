// Run from the project root:
//   bun run day-13-crud-http-api/examples/01-first-server.ts
//
// One file plays both roles: it starts a server, then acts as the client.

// --- Server: waits for requests and answers them ---
const server = Bun.serve({
  // Port 0 means "pick any free port". The real number is in server.url.
  port: 0,
  routes: {
    // Path -> function that builds the response.
    "/hello": () => Response.json({ message: "你好，HTTP！" }),
  },
});
console.log(`伺服器啟動了，port 是 ${server.port}`);

// --- Client: sends a request and reads the response ---
// fetch returns a Promise, so we await it.
const response = await fetch(new URL("/hello", server.url));

// A response has three parts: status code, headers, body.
console.log("狀態碼：", response.status);
console.log("Content-Type：", response.headers.get("Content-Type"));

// The body arrives as JSON text. response.json() turns it into a value.
// We did not check its shape yet, so the honest type is `unknown`.
const body: unknown = await response.json();
console.log("body：", body);

// No route handles this path, so Bun answers 404 by itself.
const missing = await fetch(new URL("/nothing", server.url));
console.log("不存在的路徑：", missing.status);

// Stop the server. Without this line the program would never end.
await server.stop();
console.log("伺服器已關閉");
