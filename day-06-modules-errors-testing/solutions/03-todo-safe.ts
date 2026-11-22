// Reference solution for exercise 03.

import {
  createTodo,
  findTodoById,
  updateTodo,
} from "../examples/todo/store.ts";
import type { Todo } from "../examples/todo/types.ts";
import { validateTitle } from "../examples/todo/validation.ts";

export type CommandResult = { todos: Todo[]; message: string };

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function completeTodo(todos: readonly Todo[], id: number): Todo[] {
  const todo = findTodoById(todos, id);
  if (todo === undefined) {
    throw new Error(`找不到 id 為 ${id} 的待辦事項`);
  }
  // After the check above, `todo` is a Todo.
  if (todo.done) {
    throw new Error(`id 為 ${id} 的待辦事項已經完成`);
  }
  return updateTodo(todos, id, { done: true });
}

export function addTodoSafely(
  todos: readonly Todo[],
  title: string,
): CommandResult {
  try {
    const cleanTitle = validateTitle(title);
    const nextTodos = createTodo(todos, {
      title: cleanTitle,
      priority: "medium",
    });
    return { todos: nextTodos, message: `已新增：${cleanTitle}` };
  } catch (error) {
    // `todos` is readonly, so return a copy with the same contents.
    return { todos: [...todos], message: `錯誤：${errorMessage(error)}` };
  }
}

export function completeTodoSafely(
  todos: readonly Todo[],
  id: number,
): CommandResult {
  try {
    return {
      todos: completeTodo(todos, id),
      message: `已完成 id 為 ${id} 的待辦事項`,
    };
  } catch (error) {
    return { todos: [...todos], message: `錯誤：${errorMessage(error)}` };
  }
}
