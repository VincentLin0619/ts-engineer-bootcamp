// Run from the project root:
//   bun test day-13-crud-http-api/examples/todo
//
// These tests talk to a real server over HTTP, the same way curl does.
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { startTodoApi } from "./http-api.ts";
import { InMemoryTodoRepository } from "./in-memory-todo-repository.ts";
import { TodoService } from "./todo-service.ts";

let server: Bun.Server<undefined>;

// Before every test: a fresh server with empty in-memory storage.
// Port 0 means "pick any free port", so tests never fight over a port.
beforeEach(() => {
  const service = new TodoService(new InMemoryTodoRepository());
  server = startTodoApi(service, 0);
});

// After every test: stop the server so nothing keeps running.
afterEach(async () => {
  await server.stop(true);
});

// Builds a full URL such as http://localhost:51234/todos/1.
function urlOf(path: string): URL {
  return new URL(path, server.url);
}

// Sends a request with a JSON body.
function sendJson(
  method: string,
  path: string,
  body: unknown,
): Promise<Response> {
  return fetch(urlOf(path), {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /todos（C）", () => {
  test("新增成功回 201 與新的待辦事項", async () => {
    const response = await sendJson("POST", "/todos", { title: "買牛奶" });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: 1,
      title: "買牛奶",
      done: false,
      priority: "medium",
    });
  });

  test("可以指定 priority", async () => {
    const response = await sendJson("POST", "/todos", {
      title: "繳電費",
      priority: "high",
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ priority: "high" });
  });

  test("標題空白回 400", async () => {
    const response = await sendJson("POST", "/todos", { title: "   " });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "標題不可以是空白" });
  });

  test("沒有 title 回 400", async () => {
    const response = await sendJson("POST", "/todos", { name: "買牛奶" });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "title 必須是文字" });
  });

  test("priority 不在清單裡回 400", async () => {
    const response = await sendJson("POST", "/todos", {
      title: "買牛奶",
      priority: "urgent",
    });

    expect(response.status).toBe(400);
  });

  test("body 不是合法的 JSON 回 400", async () => {
    const response = await fetch(urlOf("/todos"), {
      method: "POST",
      body: "{ title: 買牛奶",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "request body 必須是合法的 JSON",
    });
  });

  test("重複的未完成標題回 400", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });
    const response = await sendJson("POST", "/todos", { title: "買牛奶" });

    expect(response.status).toBe(400);
  });
});

describe("GET /todos（R）", () => {
  test("沒有資料時回 200 與空陣列", async () => {
    const response = await fetch(urlOf("/todos"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  test("用 filter 篩選", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });
    await sendJson("POST", "/todos", { title: "寫作業" });
    await sendJson("PATCH", "/todos/1", { done: true });

    const open = await fetch(urlOf("/todos?filter=open"));
    const done = await fetch(urlOf("/todos?filter=done"));
    const all = await fetch(urlOf("/todos?filter=all"));

    expect(await open.json()).toMatchObject([{ id: 2, title: "寫作業" }]);
    expect(await done.json()).toMatchObject([{ id: 1, title: "買牛奶" }]);
    expect(await all.json()).toHaveLength(2);
  });

  test("不認得的 filter 回 400", async () => {
    const response = await fetch(urlOf("/todos?filter=later"));

    expect(response.status).toBe(400);
  });
});

describe("GET /todos/:id（R）", () => {
  test("回 200 與那一筆待辦事項", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });

    const response = await fetch(urlOf("/todos/1"));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: 1, title: "買牛奶" });
  });

  test("id 不存在回 404", async () => {
    const response = await fetch(urlOf("/todos/99"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "找不到 id 為 99 的待辦事項",
    });
  });

  test("id 不是數字回 400", async () => {
    const response = await fetch(urlOf("/todos/abc"));

    expect(response.status).toBe(400);
  });
});

describe("PATCH /todos/:id（U）", () => {
  test("改標題", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });

    const response = await sendJson("PATCH", "/todos/1", { title: "買豆漿" });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: 1, title: "買豆漿" });
  });

  test("標記完成，再改回未完成", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });

    const completed = await sendJson("PATCH", "/todos/1", { done: true });
    expect(await completed.json()).toMatchObject({ done: true });

    const reopened = await sendJson("PATCH", "/todos/1", { done: false });
    expect(await reopened.json()).toMatchObject({ done: false });
  });

  test("修改的結果有存起來", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });
    await sendJson("PATCH", "/todos/1", { title: "買豆漿", done: true });

    const response = await fetch(urlOf("/todos/1"));

    expect(await response.json()).toEqual({
      id: 1,
      title: "買豆漿",
      done: true,
      priority: "medium",
    });
  });

  test("body 沒有 title 也沒有 done 回 400", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });

    const response = await sendJson("PATCH", "/todos/1", {});

    expect(response.status).toBe(400);
  });

  test("done 不是 boolean 回 400", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });

    const response = await sendJson("PATCH", "/todos/1", { done: "yes" });

    expect(response.status).toBe(400);
  });

  test("id 不存在回 404", async () => {
    const response = await sendJson("PATCH", "/todos/99", { done: true });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /todos/:id（D）", () => {
  test("刪除成功回 204，而且沒有 body", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });

    const response = await fetch(urlOf("/todos/1"), { method: "DELETE" });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  test("刪除之後再讀取會回 404", async () => {
    await sendJson("POST", "/todos", { title: "買牛奶" });
    await fetch(urlOf("/todos/1"), { method: "DELETE" });

    const response = await fetch(urlOf("/todos/1"));

    expect(response.status).toBe(404);
  });

  test("id 不存在回 404", async () => {
    const response = await fetch(urlOf("/todos/99"), { method: "DELETE" });

    expect(response.status).toBe(404);
  });
});

describe("其他情況", () => {
  test("不存在的路徑回 404", async () => {
    const response = await fetch(urlOf("/nothing-here"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "找不到這個路徑" });
  });

  test("回應的 Content-Type 是 JSON", async () => {
    const response = await fetch(urlOf("/todos"));

    expect(response.headers.get("Content-Type")).toContain("application/json");
  });
});
