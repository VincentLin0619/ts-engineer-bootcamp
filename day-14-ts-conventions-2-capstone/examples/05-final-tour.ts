// Run from the project root:
//   bun run day-14-ts-conventions-2-capstone/examples/05-final-tour.ts
//
// The finished Todo app, end to end. The same HTTP requests run three
// times, each time on top of a different storage. Every layer you built in
// two weeks takes part: HTTP -> TodoService -> Todo -> TodoRepository.
import { Database } from "bun:sqlite";
import { join } from "node:path";
import { startTodoApi } from "./todo/http-api.ts";
import { InMemoryTodoRepository } from "./todo/in-memory-todo-repository.ts";
import { JsonFileTodoRepository } from "./todo/json-file-todo-repository.ts";
import { SqliteTodoRepository } from "./todo/sqlite-todo-repository.ts";
import type { TodoRepository } from "./todo/todo-repository.ts";
import { TodoService } from "./todo/todo-service.ts";

// Start from an empty JSON file, so the output is the same on every run.
const jsonFile = join(import.meta.dir, "..", ".data", "final-tour.json");
if (await Bun.file(jsonFile).exists()) {
  await Bun.file(jsonFile).delete();
}

type Storage = { name: string; repository: TodoRepository };

// Three classes, one contract: Repository<Todo, NewTodo>.
const storages: Storage[] = [
  { name: "記憶體", repository: new InMemoryTodoRepository() },
  { name: "JSON 檔案", repository: new JsonFileTodoRepository(jsonFile) },
  {
    name: "SQLite",
    repository: new SqliteTodoRepository(new Database(":memory:")),
  },
];

// Runs the same requests against one storage and prints what came back.
async function runTour(storage: Storage): Promise<void> {
  // Wiring: storage -> service -> HTTP layer. Only the first part differs.
  const server = startTodoApi(new TodoService(storage.repository), 0);

  // Sends one request and returns the response.
  function send(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Response> {
    return fetch(new URL(path, server.url), {
      method,
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  await send("POST", "/todos", { title: "買牛奶" }); // C
  await send("POST", "/todos", { title: "寫作業", priority: "high" }); // C
  await send("PATCH", "/todos/1", { done: true }); // U
  await send("DELETE", "/todos/2"); // D
  const invalid = await send("POST", "/todos", { title: "" }); // breaks a rule
  const missing = await send("GET", "/todos/2"); // R: already deleted
  const list = await send("GET", "/todos"); // R

  console.log(`=== 儲存位置：${storage.name} ===`);
  console.log(`空白標題 -> ${invalid.status}`);
  console.log(`讀取已刪除的 2 號 -> ${missing.status}`);
  console.log(`GET /todos -> ${list.status} ${await list.text()}`);

  await server.stop();
}

for (const storage of storages) {
  await runTour(storage);
}
