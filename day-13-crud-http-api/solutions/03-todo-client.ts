// Reference solution for exercise 03.
import type { TodoData } from "../examples/todo/todo.ts";
import { isTodoData } from "../examples/todo/todo.ts";
import type { TodoFilter } from "../examples/todo/todo-service.ts";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function errorMessageOf(body: unknown): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return "未知的錯誤";
}

// Shared by every function: turn an error status into an ApiError.
async function throwIfFailed(response: Response): Promise<void> {
  // response.ok is true for the status codes 200-299.
  if (!response.ok) {
    const body: unknown = await response.json();
    throw new ApiError(response.status, errorMessageOf(body));
  }
}

// Shared by createTodo and completeTodo: read and check one todo.
async function readTodo(response: Response): Promise<TodoData> {
  const body: unknown = await response.json();
  if (!isTodoData(body)) {
    throw new Error("伺服器回傳的不是待辦事項");
  }
  return body;
}

export async function createTodo(
  baseUrl: URL,
  title: string,
): Promise<TodoData> {
  const response = await fetch(new URL("/todos", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  await throwIfFailed(response);
  return readTodo(response);
}

export async function listTodos(
  baseUrl: URL,
  filter: TodoFilter,
): Promise<TodoData[]> {
  const response = await fetch(new URL(`/todos?filter=${filter}`, baseUrl));
  await throwIfFailed(response);
  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error("伺服器回傳的不是陣列");
  }
  const items: unknown[] = body;
  const todos: TodoData[] = [];
  for (const item of items) {
    if (!isTodoData(item)) {
      throw new Error("伺服器回傳的陣列裡有不是待辦事項的資料");
    }
    todos.push(item);
  }
  return todos;
}

export async function completeTodo(
  baseUrl: URL,
  id: number,
): Promise<TodoData> {
  const response = await fetch(new URL(`/todos/${id}`, baseUrl), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: true }),
  });
  await throwIfFailed(response);
  return readTodo(response);
}

export async function deleteTodo(baseUrl: URL, id: number): Promise<void> {
  const response = await fetch(new URL(`/todos/${id}`, baseUrl), {
    method: "DELETE",
  });
  // 204 has no body, so there is nothing to read after this check.
  await throwIfFailed(response);
}
