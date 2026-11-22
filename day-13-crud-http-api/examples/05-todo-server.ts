// Run from the project root:
//   bun run day-13-crud-http-api/examples/05-todo-server.ts
//
// Unlike the other examples, this one keeps running: a server waits for
// requests until you stop it. Press Ctrl+C in the terminal to stop it.
// The README shows how to talk to it with curl from a second terminal.
import { Database } from "bun:sqlite";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { startTodoApi } from "./todo/http-api.ts";
import { SqliteTodoRepository } from "./todo/sqlite-todo-repository.ts";
import { TodoService } from "./todo/todo-service.ts";

const PORT = 3000;

// The database file lives in this lesson's .data/ folder, which git ignores.
// examples/todo/cli.ts opens the same file.
const dataFolder = join(import.meta.dir, "..", ".data");

// SQLite creates the database file, but not the folder around it.
await mkdir(dataFolder, { recursive: true });
const database = new Database(join(dataFolder, "todos.sqlite"));

// Wiring: storage -> service -> HTTP layer.
const service = new TodoService(new SqliteTodoRepository(database));
const server = startTodoApi(service, PORT);

console.log(`Todo API 已啟動：${new URL("/todos", server.url)}`);
console.log("按 Ctrl+C 關閉伺服器");
