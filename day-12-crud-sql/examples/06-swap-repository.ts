// Run from the project root:
//   bun run day-12-crud-sql/examples/06-swap-repository.ts

import { Database } from "bun:sqlite";
import { join } from "node:path";
import { InMemoryTodoRepository } from "./todo/in-memory-todo-repository.ts";
import { JsonFileTodoRepository } from "./todo/json-file-todo-repository.ts";
import { SqliteTodoRepository } from "./todo/sqlite-todo-repository.ts";
import type { Priority, Todo } from "./todo/todo.ts";
import type { TodoRepository } from "./todo/todo-repository.ts";
import { TodoService } from "./todo/todo-service.ts";

const demoFile = join(import.meta.dir, "..", ".data", "swap-demo.json");

function priorityLabel(priority: Priority): string {
  switch (priority) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
  }
}

// The one-line format used since Day 03, for example
// "[x] #2 寫作業（優先度：中）".
function formatTodo(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  const label = priorityLabel(todo.priority);
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${label}）`;
}

// Exactly the function from Day 11. It only knows the interface.
async function runDemo(
  label: string,
  repository: TodoRepository,
): Promise<void> {
  const service = new TodoService(repository);

  const milk = await service.add("買牛奶", "high");
  await service.add("寫作業");
  await service.complete(milk.id);

  console.log(`--- ${label} ---`);
  const todos = await service.list();
  for (const todo of todos) {
    console.log(formatTodo(todo));
  }
}

// Start from a clean file so that every run prints the same thing.
if (await Bun.file(demoFile).exists()) {
  await Bun.file(demoFile).delete();
}

const database = new Database(":memory:");

// Three storage places, one service, the same result three times.
await runDemo("記憶體版", new InMemoryTodoRepository());
await runDemo("JSON 檔案版", new JsonFileTodoRepository(demoFile));
await runDemo("SQLite 版", new SqliteTodoRepository(database));

// What the service wrote, seen from the database side.
type TodoRow = { id: number; title: string; done: number; priority: string };
const rows = database
  .query<TodoRow, []>("SELECT id, title, done, priority FROM todos ORDER BY id")
  .all();
console.log("--- SQLite 資料表裡實際存的內容 ---");
for (const row of rows) {
  console.log(`${row.id} | ${row.title} | ${row.done} | ${row.priority}`);
}

database.close();
await Bun.file(demoFile).delete();
