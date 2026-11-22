import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import { startTodoApi } from "../examples/todo/http-api.ts";
import { InMemoryTodoRepository } from "../examples/todo/in-memory-todo-repository.ts";
import { TodoService } from "../examples/todo/todo-service.ts";

const {
  ApiError,
  completeTodo,
  createTodo,
  deleteTodo,
  errorMessageOf,
  listTodos,
} = await loadExercise<typeof import("./03-todo-client.ts")>(
  import.meta.dir,
  "03-todo-client",
);

let server: Bun.Server<undefined>;

// The real Todo API from the mainline, with empty in-memory storage.
beforeEach(() => {
  server = startTodoApi(new TodoService(new InMemoryTodoRepository()), 0);
});

afterEach(async () => {
  await server.stop(true);
});

describe("練習 03（加練）：Todo API 的 client", () => {
  test("errorMessageOf 取出 error 訊息", () => {
    expect(errorMessageOf({ error: "標題不可以是空白" })).toBe(
      "標題不可以是空白",
    );
    expect(errorMessageOf({ message: "oops" })).toBe("未知的錯誤");
    expect(errorMessageOf({ error: 404 })).toBe("未知的錯誤");
    expect(errorMessageOf("oops")).toBe("未知的錯誤");
    expect(errorMessageOf(null)).toBe("未知的錯誤");
  });

  test("createTodo 新增一筆並回傳它", async () => {
    const todo = await createTodo(server.url, "買牛奶");

    expect(todo).toEqual({
      id: 1,
      title: "買牛奶",
      done: false,
      priority: "medium",
    });
  });

  test("createTodo 遇到 400 時丟出 ApiError", async () => {
    const attempt = createTodo(server.url, "   ");

    await expect(attempt).rejects.toBeInstanceOf(ApiError);
    await expect(attempt).rejects.toMatchObject({
      status: 400,
      message: "標題不可以是空白",
    });
  });

  test("listTodos 依 filter 讀取", async () => {
    await createTodo(server.url, "買牛奶");
    await createTodo(server.url, "寫作業");
    await completeTodo(server.url, 1);

    const all = await listTodos(server.url, "all");
    const open = await listTodos(server.url, "open");
    const done = await listTodos(server.url, "done");

    expect(all.map((todo) => todo.title)).toEqual(["買牛奶", "寫作業"]);
    expect(open.map((todo) => todo.title)).toEqual(["寫作業"]);
    expect(done.map((todo) => todo.title)).toEqual(["買牛奶"]);
  });

  test("completeTodo 把待辦事項標記為完成", async () => {
    await createTodo(server.url, "買牛奶");

    const todo = await completeTodo(server.url, 1);

    expect(todo).toMatchObject({ id: 1, done: true });
  });

  test("completeTodo 遇到 404 時丟出 ApiError", async () => {
    const attempt = completeTodo(server.url, 99);

    await expect(attempt).rejects.toBeInstanceOf(ApiError);
    await expect(attempt).rejects.toMatchObject({
      status: 404,
      message: "找不到 id 為 99 的待辦事項",
    });
  });

  test("deleteTodo 刪除一筆", async () => {
    await createTodo(server.url, "買牛奶");

    await deleteTodo(server.url, 1);

    expect(await listTodos(server.url, "all")).toEqual([]);
  });

  test("deleteTodo 遇到 404 時丟出 ApiError", async () => {
    const attempt = deleteTodo(server.url, 99);

    await expect(attempt).rejects.toBeInstanceOf(ApiError);
    await expect(attempt).rejects.toMatchObject({ status: 404 });
  });
});
