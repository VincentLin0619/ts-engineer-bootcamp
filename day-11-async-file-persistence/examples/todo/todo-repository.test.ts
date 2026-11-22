// Todo mainline: one set of tests for every TodoRepository implementation.
// All two classes must pass the same tests. That is what makes them
// interchangeable: the service can be given any of them.

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { ValidationError } from "./errors.ts";
import { InMemoryTodoRepository } from "./in-memory-todo-repository.ts";
import { JsonFileTodoRepository } from "./json-file-todo-repository.ts";
import { Todo } from "./todo.ts";
import type { TodoRepository } from "./todo-repository.ts";

const testFile = join(
  import.meta.dir,
  "..",
  "..",
  ".data",
  "todo-repository-test.json",
);

async function removeTestFile(): Promise<void> {
  const file = Bun.file(testFile);
  if (await file.exists()) {
    await file.delete();
  }
}

// Start every test from an empty state, and leave no file behind.
beforeEach(removeTestFile);
afterEach(removeTestFile);

// `createRepository` is a function that builds a fresh repository.
function describeRepository(
  name: string,
  createRepository: () => TodoRepository,
): void {
  describe(name, () => {
    test("create 產生從 1 開始遞增的 id", async () => {
      const repository = createRepository();
      const first = await repository.create({
        title: "買牛奶",
        priority: "low",
      });
      const second = await repository.create({
        title: "寫作業",
        priority: "high",
      });

      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
      expect(first.toData()).toEqual({
        id: 1,
        title: "買牛奶",
        done: false,
        priority: "low",
      });
    });

    test("create 拒絕不合規則的標題，而且不留下任何資料", async () => {
      const repository = createRepository();

      await expect(
        repository.create({ title: "   ", priority: "low" }),
      ).rejects.toThrow(ValidationError);
      expect(await repository.findAll()).toEqual([]);

      // The failed attempt did not use up an id.
      const first = await repository.create({
        title: "買牛奶",
        priority: "low",
      });
      expect(first.id).toBe(1);
    });

    test("findAll 回傳所有待辦事項，沒有資料時是空陣列", async () => {
      const repository = createRepository();
      expect(await repository.findAll()).toEqual([]);

      await repository.create({ title: "買牛奶", priority: "low" });
      await repository.create({ title: "寫作業", priority: "high" });

      const todos = await repository.findAll();
      expect(todos.map((todo) => todo.title)).toEqual(["買牛奶", "寫作業"]);
    });

    test("findById 找不到時回傳 undefined", async () => {
      const repository = createRepository();
      const created = await repository.create({
        title: "買牛奶",
        priority: "medium",
      });

      const found = await repository.findById(created.id);
      expect(found?.title).toBe("買牛奶");
      expect(await repository.findById(99)).toBeUndefined();
    });

    test("save 把修改寫回去", async () => {
      const repository = createRepository();
      const todo = await repository.create({
        title: "買牛奶",
        priority: "medium",
      });

      todo.complete();
      todo.rename("買豆漿");
      await repository.save(todo);

      const reloaded = await repository.findById(todo.id);
      expect(reloaded?.toData()).toEqual({
        id: 1,
        title: "買豆漿",
        done: true,
        priority: "medium",
      });
    });

    test("save 一個不存在的 id 不會改變任何資料", async () => {
      const repository = createRepository();
      await repository.create({ title: "買牛奶", priority: "low" });

      await repository.save(new Todo(99, "不存在的待辦事項", "low"));

      const todos = await repository.findAll();
      expect(todos.map((todo) => todo.title)).toEqual(["買牛奶"]);
    });

    test("沒有 save 的修改不會被存下來", async () => {
      const repository = createRepository();
      const todo = await repository.create({
        title: "買牛奶",
        priority: "medium",
      });

      todo.complete();

      const reloaded = await repository.findById(todo.id);
      expect(reloaded?.done).toBe(false);
    });

    test("delete 回傳是否真的刪到東西", async () => {
      const repository = createRepository();
      const todo = await repository.create({
        title: "買牛奶",
        priority: "medium",
      });

      expect(await repository.delete(todo.id)).toBe(true);
      expect(await repository.delete(todo.id)).toBe(false);
      expect(await repository.findAll()).toEqual([]);
    });
  });
}

describeRepository(
  "InMemoryTodoRepository",
  () => new InMemoryTodoRepository(),
);
describeRepository(
  "JsonFileTodoRepository",
  () => new JsonFileTodoRepository(testFile),
);
