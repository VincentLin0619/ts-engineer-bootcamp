// Run from the project root:
//   bun run day-13-crud-http-api/examples/04-todo-api-demo.ts
//
// Starts the Todo API on a free port, walks through every endpoint with
// fetch, prints each request and response, then stops the server.
import { startTodoApi } from "./todo/http-api.ts";
import { InMemoryTodoRepository } from "./todo/in-memory-todo-repository.ts";
import { TodoService } from "./todo/todo-service.ts";

// Wiring: storage -> service -> HTTP layer.
const service = new TodoService(new InMemoryTodoRepository());
const server = startTodoApi(service, 0);

// Sends one request and prints the request line, the status and the body.
async function show(
  method: string,
  path: string,
  body?: unknown,
): Promise<void> {
  const response = await fetch(new URL(path, server.url), {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  console.log(`${method} ${path}`);
  console.log(
    `  -> ${response.status} ${text === "" ? "（沒有 body）" : text}`,
  );
}

console.log("=== C：新增 ===");
await show("POST", "/todos", { title: "買牛奶" });
await show("POST", "/todos", { title: "寫作業", priority: "high" });

console.log("=== R：讀取 ===");
await show("GET", "/todos");
await show("GET", "/todos/2");

console.log("=== U：修改 ===");
await show("PATCH", "/todos/1", { done: true });
await show("PATCH", "/todos/2", { title: "寫數學作業" });
await show("GET", "/todos?filter=open");

console.log("=== D：刪除 ===");
await show("DELETE", "/todos/2");
await show("GET", "/todos/2");

console.log("=== 錯誤的 request ===");
await show("POST", "/todos", { title: "   " });
await show("POST", "/todos", { name: "買牛奶" });
await show("PATCH", "/todos/1", { done: "yes" });
await show("GET", "/todos/abc");
await show("DELETE", "/todos/99");

await server.stop();
