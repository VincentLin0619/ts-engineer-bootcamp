// Todo mainline: the interactive CLI, the top layer.
// Changed on Day 12: the todos are kept in a SQLite database file. Only
// the wiring in main() is different from Day 11.
//
// Run from the project root:
//   bun run day-12-crud-sql/examples/todo/cli.ts
//
// Or feed it commands through a pipe:
//   printf 'add 買牛奶\nlist\nquit\n' | bun run day-12-crud-sql/examples/todo/cli.ts

import { Database } from "bun:sqlite";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { TodoNotFoundError, ValidationError } from "./errors.ts";
import { SqliteTodoRepository } from "./sqlite-todo-repository.ts";
import type { Priority, Todo } from "./todo.ts";
import type { TodoFilter } from "./todo-service.ts";
import { TodoService } from "./todo-service.ts";

// This layer has two jobs only: turn text into calls on the service, and
// turn results (or errors) back into text. It contains no todo rules.

const HELP_LINES = [
  "add <標題>           新增一筆待辦事項",
  "list                 列出全部（list open：未完成，list done：已完成）",
  "done <id>            標記為已完成",
  "rename <id> <標題>   修改標題",
  "rm <id>              刪除",
  "help                 顯示這份說明",
  "quit                 離開",
];

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

// Splits "rename 3 買豆漿" into { first: "rename", rest: "3 買豆漿" }.
function splitFirstWord(text: string): { first: string; rest: string } {
  const trimmed = text.trim();
  // indexOf gives the position of the first space, or -1 without one.
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { first: trimmed, rest: "" };
  }
  return {
    // slice(start, end) copies a part of the text.
    first: trimmed.slice(0, spaceIndex),
    rest: trimmed.slice(spaceIndex + 1).trim(),
  };
}

// Text typed by a person is not trusted: check it before it goes down.
function parseId(text: string): number {
  const id = Number(text);
  // Number.isInteger is false for 1.5 and for NaN ("abc" turned into a number).
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`id 必須是正整數，收到的是「${text}」`);
  }
  return id;
}

function parseFilter(text: string): TodoFilter {
  if (text === "") {
    return "all";
  }
  if (text === "all" || text === "open" || text === "done") {
    return text;
  }
  throw new ValidationError("list 後面只能接 all、open 或 done");
}

// One line of input -> one call on the service -> text on the screen.
// Day 11: the service methods return Promises, so this function is async
// and awaits each of them.
async function runCommand(service: TodoService, line: string): Promise<void> {
  const { first, rest } = splitFirstWord(line);

  switch (first) {
    case "add": {
      const todo = await service.add(rest);
      console.log(`已新增 ${formatTodo(todo)}`);
      break;
    }
    case "list": {
      const todos = await service.list(parseFilter(rest));
      if (todos.length === 0) {
        console.log("（沒有待辦事項）");
      }
      for (const todo of todos) {
        console.log(formatTodo(todo));
      }
      break;
    }
    case "done": {
      const todo = await service.complete(parseId(rest));
      console.log(`已完成 ${formatTodo(todo)}`);
      break;
    }
    case "rename": {
      const idAndTitle = splitFirstWord(rest);
      const todo = await service.rename(
        parseId(idAndTitle.first),
        idAndTitle.rest,
      );
      console.log(`已改名 ${formatTodo(todo)}`);
      break;
    }
    case "rm": {
      const id = parseId(rest);
      await service.remove(id);
      console.log(`已刪除 #${id}`);
      break;
    }
    case "help": {
      for (const helpLine of HELP_LINES) {
        console.log(helpLine);
      }
      break;
    }
    default: {
      console.log(`不認得的指令「${first}」，輸入 help 看說明`);
    }
  }
}

// Errors the user can fix become a friendly line of text. Anything else
// is a bug in the program: rethrow it, so it is not silently hidden.
function reportError(error: unknown): void {
  if (error instanceof ValidationError) {
    console.log(`輸入有誤：${error.message}`);
  } else if (error instanceof TodoNotFoundError) {
    console.log(`找不到 #${error.id}，輸入 list 看有哪些待辦事項`);
  } else {
    throw error;
  }
}

async function main(): Promise<void> {
  // import.meta.dir is the folder of this file. The database file goes into
  // the lesson's .data/ folder, which git ignores.
  const dataFolder = join(import.meta.dir, "..", "..", ".data");
  // SQLite creates the database file, but not the folder around it.
  await mkdir(dataFolder, { recursive: true });
  const database = new Database(join(dataFolder, "todos.sqlite"));

  // Wiring: the only place in the whole program that names a concrete
  // repository. Swapping the storage means changing this one line.
  // Day 11 said: new JsonFileTodoRepository(dataFile)
  const repository = new SqliteTodoRepository(database);
  const service = new TodoService(repository);

  console.log("Todo CLI：輸入 help 看指令，輸入 quit 離開");

  while (true) {
    // prompt() gives null when the input has ended (piped input ran out)
    // and also for an empty line. Both are treated as "quit".
    const line = prompt(">");
    if (line === null || line.trim() === "quit") {
      break;
    }

    try {
      // Without this `await`, a rejected Promise would slip past the catch.
      await runCommand(service, line);
    } catch (error) {
      reportError(error);
    }
  }

  database.close();
  console.log("再見！待辦事項存在 .data/todos.sqlite，下次執行還會在。");
}

await main();
