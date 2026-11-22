// The service is tested with the in-memory repository: it is fast and leaves
// no file behind. The rules do not depend on where the data is stored.

import { describe, expect, test } from "bun:test";
import { TodoNotFoundError, ValidationError } from "./errors.ts";
import { InMemoryTodoRepository } from "./in-memory-todo-repository.ts";
import { TodoService } from "./todo-service.ts";

function createService(): TodoService {
  return new TodoService(new InMemoryTodoRepository());
}

describe("TodoService", () => {
  test("add 新增待辦事項，優先度預設是 medium", async () => {
    const service = createService();
    const todo = await service.add("  買牛奶  ");

    expect(todo.toData()).toEqual({
      id: 1,
      title: "買牛奶",
      done: false,
      priority: "medium",
    });
  });

  test("add 拒絕空白標題", async () => {
    const service = createService();
    // An async function that fails gives a rejected Promise.
    // `rejects` waits for it and checks the error.
    await expect(service.add("   ")).rejects.toThrow(ValidationError);
  });

  test("add 拒絕與未完成事項重複的標題", async () => {
    const service = createService();
    await service.add("買牛奶");

    await expect(service.add("買牛奶")).rejects.toThrow(ValidationError);
    await expect(service.add(" 買牛奶 ")).rejects.toThrow(
      "已經有一筆未完成的「買牛奶」",
    );
  });

  test("已完成的事項可以再新增一筆同標題的", async () => {
    const service = createService();
    const first = await service.add("買牛奶");
    await service.complete(first.id);

    const second = await service.add("買牛奶");
    expect(second.id).toBe(2);
  });

  test("list 依照 filter 篩選", async () => {
    const service = createService();
    const milk = await service.add("買牛奶");
    await service.add("寫作業", "high");
    await service.complete(milk.id);

    const all = await service.list();
    const open = await service.list("open");
    const done = await service.list("done");

    expect(all.map((todo) => todo.title)).toEqual(["買牛奶", "寫作業"]);
    expect(open.map((todo) => todo.title)).toEqual(["寫作業"]);
    expect(done.map((todo) => todo.title)).toEqual(["買牛奶"]);
  });

  test("complete 把事項標成完成並存回去", async () => {
    const service = createService();
    const todo = await service.add("買牛奶");

    const completed = await service.complete(todo.id);
    expect(completed.done).toBe(true);

    const done = await service.list("done");
    expect(done.length).toBe(1);
  });

  test("rename 改標題，並套用重複標題的規則", async () => {
    const service = createService();
    const milk = await service.add("買牛奶");
    await service.add("寫作業");

    const renamed = await service.rename(milk.id, "買豆漿");
    expect(renamed.title).toBe("買豆漿");

    await expect(service.rename(milk.id, "寫作業")).rejects.toThrow(
      ValidationError,
    );
    // Renaming a todo to its own title is not a duplicate.
    const same = await service.rename(milk.id, "買豆漿");
    expect(same.title).toBe("買豆漿");
  });

  test("找不到 id 時丟出 TodoNotFoundError", async () => {
    const service = createService();

    await expect(service.complete(99)).rejects.toThrow(TodoNotFoundError);
    await expect(service.rename(99, "買牛奶")).rejects.toThrow(
      "找不到 id 為 99 的待辦事項",
    );
    await expect(service.remove(99)).rejects.toThrow(TodoNotFoundError);
  });

  test("remove 刪除待辦事項", async () => {
    const service = createService();
    const todo = await service.add("買牛奶");

    await service.remove(todo.id);
    expect(await service.list()).toEqual([]);
  });
});
