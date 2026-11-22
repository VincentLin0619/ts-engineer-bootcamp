import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import { InMemoryTodoRepository } from "../examples/todo/in-memory-todo-repository.ts";
import { Todo } from "../examples/todo/todo.ts";
import type { TodoRepository } from "../examples/todo/todo-repository.ts";

const { RecycleBinTodoRepository, completeAll } = await loadExercise<
  typeof import("./03-recycle-bin-repository.ts")
>(import.meta.dir, "03-recycle-bin-repository");

function idsOf(todos: readonly Todo[]): number[] {
  return todos.map((todo) => todo.id);
}

describe("練習 03（加練）：RecycleBinTodoRepository 遵守 TodoRepository 合約", () => {
  test("create 產生從 1 開始遞增的 id", () => {
    const repository: TodoRepository = new RecycleBinTodoRepository();
    const milk = repository.create({ title: "買牛奶", priority: "medium" });
    const report = repository.create({ title: "寫報告", priority: "high" });
    expect(milk).toBeInstanceOf(Todo);
    expect(milk.toData()).toEqual({
      id: 1,
      title: "買牛奶",
      done: false,
      priority: "medium",
    });
    expect(report.id).toBe(2);
    expect(idsOf(repository.findAll())).toEqual([1, 2]);
  });

  test("create 遇到不合法的標題會丟出錯誤，而且不佔用 id", () => {
    const repository: TodoRepository = new RecycleBinTodoRepository();
    expect(() => repository.create({ title: "  ", priority: "low" })).toThrow(
      "標題不可以是空的",
    );
    expect(repository.findAll()).toEqual([]);
    expect(repository.create({ title: "買牛奶", priority: "low" }).id).toBe(1);
  });

  test("findById 找得到回傳 Todo，找不到回傳 undefined", () => {
    const repository: TodoRepository = new RecycleBinTodoRepository();
    repository.create({ title: "買牛奶", priority: "medium" });
    const found = repository.findById(1);
    expect(found).toBeInstanceOf(Todo);
    expect(found?.title).toBe("買牛奶");
    expect(repository.findById(99)).toBeUndefined();
  });

  test("交出去的是複本：沒有 save 就不會存回去", () => {
    const repository: TodoRepository = new RecycleBinTodoRepository();
    const milk = repository.create({ title: "買牛奶", priority: "medium" });
    milk.complete();
    expect(repository.findById(1)?.done).toBe(false);
    repository.save(milk);
    expect(repository.findById(1)?.done).toBe(true);
  });

  test("save 遇到不存在的 id 不做任何事", () => {
    const repository: TodoRepository = new RecycleBinTodoRepository();
    repository.create({ title: "買牛奶", priority: "medium" });
    repository.save(new Todo(99, "不存在的待辦事項"));
    expect(idsOf(repository.findAll())).toEqual([1]);
  });

  test("delete 回傳有沒有真的刪到，刪掉的 id 不會再被使用", () => {
    const repository: TodoRepository = new RecycleBinTodoRepository();
    repository.create({ title: "買牛奶", priority: "medium" });
    repository.create({ title: "寫報告", priority: "high" });
    expect(repository.delete(1)).toBe(true);
    expect(repository.delete(1)).toBe(false);
    expect(repository.delete(99)).toBe(false);
    expect(idsOf(repository.findAll())).toEqual([2]);
    expect(repository.findById(1)).toBeUndefined();
    expect(repository.create({ title: "倒垃圾", priority: "low" }).id).toBe(3);
  });
});

describe("練習 03（加練）：資源回收桶", () => {
  test("被刪除的待辦事項進到資源回收桶", () => {
    const repository = new RecycleBinTodoRepository();
    repository.create({ title: "買牛奶", priority: "medium" });
    repository.create({ title: "寫報告", priority: "high" });
    expect(repository.findDeleted()).toEqual([]);
    repository.delete(1);
    const deleted = repository.findDeleted();
    expect(idsOf(deleted)).toEqual([1]);
    expect(deleted[0]).toBeInstanceOf(Todo);
  });

  test("資源回收桶裡的待辦事項不能 save", () => {
    const repository = new RecycleBinTodoRepository();
    const milk = repository.create({ title: "買牛奶", priority: "medium" });
    repository.delete(1);
    milk.complete();
    repository.save(milk);
    expect(repository.findAll()).toEqual([]);
    expect(repository.findDeleted()[0]?.done).toBe(false);
  });

  test("restore 把待辦事項放回清單的最後面", () => {
    const repository = new RecycleBinTodoRepository();
    repository.create({ title: "買牛奶", priority: "medium" });
    repository.create({ title: "寫報告", priority: "high" });
    repository.delete(1);
    expect(repository.restore(1)).toBe(true);
    expect(idsOf(repository.findAll())).toEqual([2, 1]);
    expect(repository.findDeleted()).toEqual([]);
    expect(repository.findById(1)?.title).toBe("買牛奶");
  });

  test("restore 遇到不在資源回收桶裡的 id 回傳 false", () => {
    const repository = new RecycleBinTodoRepository();
    repository.create({ title: "買牛奶", priority: "medium" });
    expect(repository.restore(1)).toBe(false);
    expect(repository.restore(99)).toBe(false);
    expect(idsOf(repository.findAll())).toEqual([1]);
  });
});

describe("練習 03（加練）：completeAll 針對介面寫", () => {
  test("搭配 InMemoryTodoRepository", () => {
    const repository: TodoRepository = new InMemoryTodoRepository();
    const milk = repository.create({ title: "買牛奶", priority: "medium" });
    repository.create({ title: "寫報告", priority: "high" });
    repository.create({ title: "倒垃圾", priority: "low" });
    milk.complete();
    repository.save(milk);

    expect(completeAll(repository)).toBe(2);
    expect(repository.findAll().every((todo) => todo.done)).toBe(true);
    expect(completeAll(repository)).toBe(0);
  });

  test("搭配 RecycleBinTodoRepository：資源回收桶裡的不受影響", () => {
    const repository = new RecycleBinTodoRepository();
    repository.create({ title: "買牛奶", priority: "medium" });
    repository.create({ title: "寫報告", priority: "high" });
    repository.delete(2);

    expect(completeAll(repository)).toBe(1);
    expect(repository.findById(1)?.done).toBe(true);
    expect(repository.findDeleted()[0]?.done).toBe(false);
  });

  test("空的 Repository 回傳 0", () => {
    expect(completeAll(new InMemoryTodoRepository())).toBe(0);
  });
});
