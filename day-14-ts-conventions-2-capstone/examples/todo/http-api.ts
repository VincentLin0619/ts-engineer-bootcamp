// The HTTP layer of the Todo app (Day 13).
//
// This file only translates:
//   request  -> a TodoService call
//   result   -> a JSON response with the right status code
//   error    -> a JSON error response with the right status code
// It holds no business rules. Those stay in Todo and TodoService.
import { TodoNotFoundError, ValidationError } from "./errors.ts";
import type { Priority } from "./todo.ts";
import { isPriority } from "./todo.ts";
import type { TodoFilter, TodoService } from "./todo-service.ts";

// What POST /todos accepts.
export type NewTodoBody = { title: string; priority?: Priority };

// What PATCH /todos/:id accepts.
export type TodoChangesBody = { title?: string; done?: boolean };

// Every error response has the same shape: { "error": "..." }.
export function errorResponse(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

// Reads the request body as JSON. The result is `unknown`, because a client
// can send anything.
async function readJsonBody(request: Request): Promise<unknown> {
  try {
    const body: unknown = await request.json();
    return body;
  } catch {
    // `catch` without `(error)`: the error object itself is not needed here.
    throw new ValidationError("request body 必須是合法的 JSON");
  }
}

// Checks the body of POST /todos, one question at a time.
export function parseNewTodoBody(body: unknown): NewTodoBody {
  // 1. Is it an object at all?
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("request body 必須是 JSON 物件");
  }
  // 2. Does it have a title, and is the title text?
  if (!("title" in body) || typeof body.title !== "string") {
    throw new ValidationError("title 必須是文字");
  }
  // 3. priority is optional, but when present it must be a Priority.
  const priority = "priority" in body ? body.priority : undefined;
  if (priority !== undefined && !isPriority(priority)) {
    throw new ValidationError("priority 必須是 low、medium 或 high");
  }
  return { title: body.title, priority };
}

// Checks the body of PATCH /todos/:id.
export function parseTodoChangesBody(body: unknown): TodoChangesBody {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("request body 必須是 JSON 物件");
  }
  const title = "title" in body ? body.title : undefined;
  const done = "done" in body ? body.done : undefined;
  if (title === undefined && done === undefined) {
    throw new ValidationError("至少要提供 title 或 done 其中一個");
  }
  if (title !== undefined && typeof title !== "string") {
    throw new ValidationError("title 必須是文字");
  }
  if (done !== undefined && typeof done !== "boolean") {
    throw new ValidationError("done 必須是 true 或 false");
  }
  return { title, done };
}

// Turns the ":id" part of the path into a number. It arrives as text.
export function parseId(text: string): number {
  const id = Number(text);
  if (!Number.isInteger(id) || id < 1) {
    throw new ValidationError("id 必須是正整數");
  }
  return id;
}

// Turns the "?filter=..." part of the URL into a TodoFilter.
// `null` means the client did not send a filter at all.
export function parseFilter(text: string | null): TodoFilter {
  if (text === null) {
    return "all";
  }
  if (text === "all" || text === "open" || text === "done") {
    return text;
  }
  throw new ValidationError("filter 必須是 all、open 或 done");
}

// The one place that decides which error becomes which status code.
export function toErrorResponse(error: unknown): Response {
  if (error instanceof ValidationError) {
    return errorResponse(400, error.message);
  }
  if (error instanceof TodoNotFoundError) {
    return errorResponse(404, error.message);
  }
  // Anything else is a bug on the server side. Log it for the developer,
  // and do not leak the details to the client.
  console.error(error);
  return errorResponse(500, "伺服器發生未預期的錯誤");
}

// Starts the HTTP server. Pass port 0 to let the system pick a free port.
export function startTodoApi(
  service: TodoService,
  port: number,
): Bun.Server<undefined> {
  return Bun.serve({
    port,
    // The method names (GET, POST...) are fixed by HTTP, so the naming rule
    // is switched off for the routes, and only for the routes.
    // biome-ignore-start lint/style/useNamingConvention: HTTP methods are upper case
    routes: {
      "/todos": {
        // C: create one todo
        POST: async (request) => {
          const input = parseNewTodoBody(await readJsonBody(request));
          const todo = await service.add(input.title, input.priority);
          return Response.json(todo.toData(), { status: 201 });
        },
        // R: read many todos
        GET: async (request) => {
          const url = new URL(request.url);
          const filter = parseFilter(url.searchParams.get("filter"));
          const todos = await service.list(filter);
          return Response.json(todos.map((todo) => todo.toData()));
        },
      },
      "/todos/:id": {
        // R: read one todo
        GET: async (request) => {
          const todo = await service.get(parseId(request.params.id));
          return Response.json(todo.toData());
        },
        // U: change the title, the done flag, or both
        PATCH: async (request) => {
          const id = parseId(request.params.id);
          const changes = parseTodoChangesBody(await readJsonBody(request));
          let todo = await service.get(id);
          if (changes.title !== undefined) {
            todo = await service.rename(id, changes.title);
          }
          if (changes.done === true) {
            todo = await service.complete(id);
          }
          if (changes.done === false) {
            todo = await service.reopen(id);
          }
          return Response.json(todo.toData());
        },
        // D: delete one todo
        DELETE: async (request) => {
          await service.remove(parseId(request.params.id));
          return new Response(null, { status: 204 });
        },
      },
    },
    // biome-ignore-end lint/style/useNamingConvention: HTTP methods are upper case
    // Runs when no route matched the path or the method.
    fetch() {
      return errorResponse(404, "找不到這個路徑");
    },
    // Runs when a route handler throws.
    error(error) {
      return toErrorResponse(error);
    },
  });
}
