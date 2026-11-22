// Exercise 03 (optional): write the client side of the Todo API.
//
// So far the course wrote the server and used fetch only in tests. Here you
// write the functions another program would call to use the Todo API from
// examples/todo/http-api.ts. The tests start that real server on a free
// port and pass its address as `baseUrl`.
//
// Rules for every function:
//   - Build the address with new URL(path, baseUrl).
//   - When the status is not a success (use response.ok), read the JSON body
//     and throw new ApiError(response.status, errorMessageOf(body)).
//   - A response body is `unknown` until it is checked. Use isTodoData.
import type { TodoData } from "../examples/todo/todo.ts";
import { isTodoData } from "../examples/todo/todo.ts";
import type { TodoFilter } from "../examples/todo/todo-service.ts";

// This class is finished. Do not change it.
// It carries the status code together with the message from the server.
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Pull the message out of an error body such as { "error": "找不到..." }.
// When the body does not have that shape, return "未知的錯誤".
// errorMessageOf({ error: "標題不可以是空白" }) -> "標題不可以是空白"
// errorMessageOf({ message: "oops" })          -> "未知的錯誤"
// errorMessageOf("oops")                       -> "未知的錯誤"
export function errorMessageOf(body: unknown): string {
  // TODO: check the shape of body, then return the message
  throw new Error("TODO：尚未完成 errorMessageOf");
}

// C: POST /todos with the body { "title": title }.
// Resolves to the todo the server created.
// createTodo(baseUrl, "買牛奶") -> { id: 1, title: "買牛奶", done: false, priority: "medium" }
export async function createTodo(
  baseUrl: URL,
  title: string,
): Promise<TodoData> {
  // TODO: send the request, handle an error status, check the body
  throw new Error("TODO：尚未完成 createTodo");
}

// R: GET /todos?filter=<filter>.
// Resolves to the array of todos the server replied with.
// listTodos(baseUrl, "open") -> [{ id: 1, ... }, { id: 2, ... }]
export async function listTodos(
  baseUrl: URL,
  filter: TodoFilter,
): Promise<TodoData[]> {
  // TODO: send the request, handle an error status, check every item
  throw new Error("TODO：尚未完成 listTodos");
}

// U: PATCH /todos/<id> with the body { "done": true }.
// Resolves to the updated todo.
// completeTodo(baseUrl, 1) -> { id: 1, title: "買牛奶", done: true, priority: "medium" }
export async function completeTodo(
  baseUrl: URL,
  id: number,
): Promise<TodoData> {
  // TODO: send the request, handle an error status, check the body
  throw new Error("TODO：尚未完成 completeTodo");
}

// D: DELETE /todos/<id>.
// Resolves to nothing. A 204 response has no body, so do not read one.
export async function deleteTodo(baseUrl: URL, id: number): Promise<void> {
  // TODO: send the request and handle an error status
  throw new Error("TODO：尚未完成 deleteTodo");
}
