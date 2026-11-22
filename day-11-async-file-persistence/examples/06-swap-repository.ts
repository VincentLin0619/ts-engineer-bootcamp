// Run from the project root:
//   bun run day-11-async-file-persistence/examples/06-swap-repository.ts

import { join } from "node:path";
import { InMemoryTodoRepository } from "./todo/in-memory-todo-repository.ts";
import { JsonFileTodoRepository } from "./todo/json-file-todo-repository.ts";
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

// The same steps for any repository. The parameter type is the interface,
// so this function has no idea which implementation it was given.
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

await runDemo("記憶體版", new InMemoryTodoRepository());
await runDemo("JSON 檔案版", new JsonFileTodoRepository(demoFile));

// Only the file version left something on disk.
console.log("--- swap-demo.json 的內容 ---");
console.log(await Bun.file(demoFile).text());

// A brand new repository object reads what the earlier one wrote:
// this is what happens when you restart the program.
const reopened = new TodoService(new JsonFileTodoRepository(demoFile));
const openTodos = await reopened.list("open");
console.log(`重新開啟後，未完成的還有 ${openTodos.length} 筆`);

await Bun.file(demoFile).delete();
