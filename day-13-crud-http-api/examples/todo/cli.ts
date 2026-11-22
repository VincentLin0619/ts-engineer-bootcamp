// Run from the project root:
//   bun run day-13-crud-http-api/examples/todo/cli.ts
//
// Or feed it commands through a pipe:
//   printf 'add 買牛奶\nlist\nquit\n' | bun run day-13-crud-http-api/examples/todo/cli.ts

import { Database } from "bun:sqlite";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { TodoNotFoundError, ValidationError } from "./errors.ts";
import { SqliteTodoRepository } from "./sqlite-todo-repository.ts";
import type { Priority, Todo } from "./todo.ts";
import type { TodoFilter } from "./todo-service.ts";
import { TodoService } from "./todo-service.ts";

// import.meta.dir is the folder of this file. The database file lives in the
// lesson's .data/ folder, which git ignores. The HTTP server in
// examples/05-todo-server.ts opens the same file.
const dataFolder = join(import.meta.dir, "..", "..", ".data");

// SQLite creates the database file, but not the folder around it.
await mkdir(dataFolder, { recursive: true });
const database = new Database(join(dataFolder, "todos.sqlite"));

// The only line that decides where the data is stored.
const service = new TodoService(new SqliteTodoRepository(database));

function priorityLabel(priority: Priority): string {
  if (priority === "high") {
    return "高";
  }
  if (priority === "low") {
    return "低";
  }
  return "中";
}

function formatTodo(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${priorityLabel(todo.priority)}）`;
}

function toFilter(text: string): TodoFilter {
  if (text === "open" || text === "done") {
    return text;
  }
  return "all";
}

function toId(text: string): number {
  const id = Number(text);
  if (!Number.isInteger(id)) {
    throw new ValidationError("id 必須是整數");
  }
  return id;
}

// Splits "rename 2 買豆漿" into the command "rename" and the rest "2 買豆漿".
function splitFirstWord(text: string): { first: string; rest: string } {
  const trimmed = text.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { first: trimmed, rest: "" };
  }
  return {
    first: trimmed.slice(0, spaceIndex),
    rest: trimmed.slice(spaceIndex + 1).trim(),
  };
}

// Every service method returns a Promise now, so this function is async
// and awaits each call.
async function runCommand(line: string): Promise<void> {
  const { first: command, rest } = splitFirstWord(line);

  if (command === "add") {
    const todo = await service.add(rest);
    console.log(`已新增：${formatTodo(todo)}`);
  } else if (command === "list") {
    const todos = await service.list(toFilter(rest));
    if (todos.length === 0) {
      console.log("（沒有待辦事項）");
    }
    for (const todo of todos) {
      console.log(formatTodo(todo));
    }
  } else if (command === "done") {
    const todo = await service.complete(toId(rest));
    console.log(`已完成：${formatTodo(todo)}`);
  } else if (command === "rename") {
    const { first: idText, rest: title } = splitFirstWord(rest);
    const todo = await service.rename(toId(idText), title);
    console.log(`已改名：${formatTodo(todo)}`);
  } else if (command === "rm") {
    const id = toId(rest);
    await service.remove(id);
    console.log(`已刪除 id ${id}`);
  } else {
    console.log(`看不懂的指令：${line}`);
  }
}

console.log(
  "指令：add <標題>、list [open|done]、done <id>、rename <id> <標題>、rm <id>、quit",
);

while (true) {
  // prompt() returns null when the input ends (for example at the end of a pipe).
  const line = prompt(">");
  if (line === null || line.trim() === "quit") {
    break;
  }
  try {
    await runCommand(line);
  } catch (error) {
    // Expected problems are reported; the loop keeps going.
    if (
      error instanceof ValidationError ||
      error instanceof TodoNotFoundError
    ) {
      console.log(`錯誤：${error.message}`);
    } else {
      throw error;
    }
  }
}

database.close();
console.log("再見！待辦事項已經存在 .data/todos.sqlite，下次執行還會在。");
