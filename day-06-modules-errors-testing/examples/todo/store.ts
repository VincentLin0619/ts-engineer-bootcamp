// This module only defines things, so it is not run directly. It is used by
// cli.ts and store.test.ts. From the project root:
//   bun run day-06-modules-errors-testing/examples/todo/cli.ts
//   bun test day-06-modules-errors-testing/examples/todo
//
// The CRUD functions from Day 05, now written once and exported.
// Two things changed since Day 05:
// - createTodo and updateTodo validate the title.
// - updateTodo and deleteTodo throw when the id does not exist.

import type { NewTodo, Todo, TodoChanges } from "./types.ts";
import { validateTitle } from "./validation.ts";

export function nextId(todos: readonly Todo[]): number {
  let maxId = 0;
  for (const todo of todos) {
    if (todo.id > maxId) {
      maxId = todo.id;
    }
  }
  return maxId + 1;
}

// C = Create. Throws when the title is not valid.
export function createTodo(todos: readonly Todo[], input: NewTodo): Todo[] {
  const todo: Todo = {
    id: nextId(todos),
    title: validateTitle(input.title),
    done: false,
    priority: input.priority,
  };
  return [...todos, todo];
}

// R = Read. "Not found" is a normal answer here, so it returns undefined.
export function findTodoById(
  todos: readonly Todo[],
  id: number,
): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

// U = Update. Throws when the id does not exist or the new title is not valid.
export function updateTodo(
  todos: readonly Todo[],
  id: number,
  changes: TodoChanges,
): Todo[] {
  if (findTodoById(todos, id) === undefined) {
    throw new Error(`找不到 id 為 ${id} 的待辦事項`);
  }

  // Only validate the title when the caller wants to change it.
  const checkedChanges: TodoChanges =
    changes.title === undefined
      ? changes
      : { ...changes, title: validateTitle(changes.title) };

  return todos.map((todo) =>
    todo.id === id ? { ...todo, ...checkedChanges } : todo,
  );
}

// D = Delete. Throws when the id does not exist.
export function deleteTodo(todos: readonly Todo[], id: number): Todo[] {
  if (findTodoById(todos, id) === undefined) {
    throw new Error(`找不到 id 為 ${id} 的待辦事項`);
  }
  return todos.filter((todo) => todo.id !== id);
}
