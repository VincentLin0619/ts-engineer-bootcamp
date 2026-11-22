// Run from the project root (type commands yourself, `quit` to stop):
//   bun run day-06-modules-errors-testing/examples/todo/cli.ts
//
// Or feed it commands through a pipe, one command per line:
//   printf 'add 買牛奶\nadd\ndone 9\ndone abc\ndone 1\nlist\nquit\n' | bun run day-06-modules-errors-testing/examples/todo/cli.ts
//
// Commands: add <title>, list, done <id>, rm <id>, quit
//
// This file is the entry point: the one file you run. It imports the CRUD
// functions instead of containing a copy of them.

import { createTodo, deleteTodo, updateTodo } from "./store.ts";
import type { Priority, Todo } from "./types.ts";

type Command = { name: string; argument: string };

function parseCommand(line: string): Command {
  const trimmed = line.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { name: trimmed, argument: "" };
  }
  return {
    name: trimmed.slice(0, spaceIndex),
    argument: trimmed.slice(spaceIndex + 1).trim(),
  };
}

// Input validation for an id typed by the user.
// Number.isInteger is false for 1.5 and for NaN (the result of Number("abc")).
function parseId(text: string): number {
  const id = Number(text);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error(`id 必須是正整數，收到的是「${text}」`);
  }
  return id;
}

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

function formatTodo(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${priorityLabel(todo.priority)}）`;
}

// The value in `catch` is `unknown`: check it before reading `.message`.
function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

let todos: Todo[] = [];
let running = true;

console.log("Todo CLI：add <標題>、list、done <id>、rm <id>、quit");

while (running) {
  const line = prompt("todo>");

  if (line === null) {
    // Nothing to read: Enter on an empty line, or the piped input has ended.
    running = false;
  } else {
    const command = parseCommand(line);

    // Each case only describes what happens when everything goes well.
    // Anything that goes wrong is thrown, and handled once in `catch`.
    try {
      switch (command.name) {
        case "add": {
          todos = createTodo(todos, {
            title: command.argument,
            priority: "medium",
          });
          console.log(`已新增：${command.argument}`);
          break;
        }
        case "list": {
          if (todos.length === 0) {
            console.log("目前沒有待辦事項");
          }
          for (const todo of todos) {
            console.log(formatTodo(todo));
          }
          break;
        }
        case "done": {
          const id = parseId(command.argument);
          todos = updateTodo(todos, id, { done: true });
          console.log(`已完成 id 為 ${id} 的待辦事項`);
          break;
        }
        case "rm": {
          const id = parseId(command.argument);
          todos = deleteTodo(todos, id);
          console.log(`已刪除 id 為 ${id} 的待辦事項`);
          break;
        }
        case "quit": {
          running = false;
          break;
        }
        default: {
          throw new Error(`不認識的指令：${command.name}`);
        }
      }
    } catch (error) {
      // The loop keeps going: one bad command does not end the program.
      console.log(`錯誤：${errorMessage(error)}`);
    }
  }
}

console.log("再見！");
