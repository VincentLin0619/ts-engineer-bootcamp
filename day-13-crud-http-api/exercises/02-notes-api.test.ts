import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { startNotesApi } = await loadExercise<
  typeof import("./02-notes-api.ts")
>(import.meta.dir, "02-notes-api");

let server: Bun.Server<undefined> | undefined;

// A fresh server on a free port before every test.
beforeEach(() => {
  server = startNotesApi(0);
});

// Stop it afterwards, so nothing keeps running.
afterEach(async () => {
  if (server !== undefined) {
    await server.stop(true);
    server = undefined;
  }
});

function urlOf(path: string): URL {
  if (server === undefined) {
    throw new Error("伺服器沒有啟動");
  }
  return new URL(path, server.url);
}

function postNote(body: unknown): Promise<Response> {
  return fetch(urlOf("/notes"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("練習 02：筆記 API", () => {
  test("POST /notes 新增成功回 201 與新的筆記", async () => {
    const response = await postNote({ text: "記得帶傘" });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: 1, text: "記得帶傘" });
  });

  test("id 從 1 開始遞增", async () => {
    await postNote({ text: "記得帶傘" });
    const response = await postNote({ text: "買牛奶" });

    expect(await response.json()).toEqual({ id: 2, text: "買牛奶" });
  });

  test("GET /notes 回 200 與所有筆記", async () => {
    const empty = await fetch(urlOf("/notes"));
    expect(empty.status).toBe(200);
    expect(await empty.json()).toEqual([]);

    await postNote({ text: "記得帶傘" });
    await postNote({ text: "買牛奶" });

    const response = await fetch(urlOf("/notes"));
    expect(await response.json()).toEqual([
      { id: 1, text: "記得帶傘" },
      { id: 2, text: "買牛奶" },
    ]);
  });

  test("GET /notes/:id 回 200 與那一筆筆記", async () => {
    await postNote({ text: "記得帶傘" });

    const response = await fetch(urlOf("/notes/1"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 1, text: "記得帶傘" });
  });

  test("GET /notes/:id 找不到時回 404 與 error", async () => {
    const response = await fetch(urlOf("/notes/9"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  });

  test("DELETE /notes/:id 刪除成功回 204，而且沒有 body", async () => {
    await postNote({ text: "記得帶傘" });

    const response = await fetch(urlOf("/notes/1"), { method: "DELETE" });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");

    const after = await fetch(urlOf("/notes/1"));
    expect(after.status).toBe(404);
  });

  test("DELETE /notes/:id 找不到時回 404", async () => {
    const response = await fetch(urlOf("/notes/9"), { method: "DELETE" });

    expect(response.status).toBe(404);
  });

  test("POST /notes 的 text 不合格時回 400 與 error", async () => {
    const missing = await postNote({ title: "記得帶傘" });
    expect(missing.status).toBe(400);
    expect(await missing.json()).toEqual({ error: expect.any(String) });

    const wrongType = await postNote({ text: 42 });
    expect(wrongType.status).toBe(400);

    const empty = await postNote({ text: "" });
    expect(empty.status).toBe(400);

    const notObject = await postNote("記得帶傘");
    expect(notObject.status).toBe(400);
  });

  test("POST /notes 的 body 不是合法 JSON 時回 400", async () => {
    const response = await fetch(urlOf("/notes"), {
      method: "POST",
      body: "{ text: 記得帶傘",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  });

  test("不存在的路徑回 404 與 error", async () => {
    const response = await fetch(urlOf("/nothing-here"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  });
});
