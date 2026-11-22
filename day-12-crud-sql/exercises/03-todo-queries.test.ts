import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import { SqliteTodoRepository } from "../examples/todo/sqlite-todo-repository.ts";
import { TodoService } from "../examples/todo/todo-service.ts";

const { clearDoneTodos, countOpenTodos, findTodosByPriority } =
  await loadExercise<typeof import("./03-todo-queries.ts")>(
    import.meta.dir,
    "03-todo-queries",
  );

type Setup = { db: Database; service: TodoService };

// An in-memory database with the todos table, filled through the service:
// "買牛奶" (high, done), "寫作業" (low, open), "倒垃圾" (high, open).
async function createSample(): Promise<Setup> {
  const db = new Database(":memory:");
  const service = new TodoService(new SqliteTodoRepository(db));
  const milk = await service.add("買牛奶", "high");
  await service.add("寫作業", "low");
  await service.add("倒垃圾", "high");
  await service.complete(milk.id);
  return { db, service };
}

function createEmpty(): Setup {
  const db = new Database(":memory:");
  const service = new TodoService(new SqliteTodoRepository(db));
  return { db, service };
}

describe("練習 03（加練）：替 Todo App 加上 SQL 查詢", () => {
  test("findTodosByPriority 回傳符合優先度的 Todo 物件", async () => {
    const { db } = await createSample();

    const high = findTodosByPriority(db, "high");
    expect(high.map((todo) => todo.toData())).toEqual([
      { id: 1, title: "買牛奶", done: true, priority: "high" },
      { id: 3, title: "倒垃圾", done: false, priority: "high" },
    ]);

    const low = findTodosByPriority(db, "low");
    expect(low.map((todo) => todo.title)).toEqual(["寫作業"]);
  });

  test("findTodosByPriority 沒有符合的資料時回傳空陣列", async () => {
    const { db } = await createSample();
    expect(findTodosByPriority(db, "medium")).toEqual([]);
  });

  test("countOpenTodos 數出未完成的筆數", async () => {
    const { db, service } = await createSample();
    expect(countOpenTodos(db)).toBe(2);

    await service.complete(2);
    expect(countOpenTodos(db)).toBe(1);
  });

  test("countOpenTodos 在空的資料表回傳 0", () => {
    const { db } = createEmpty();
    expect(countOpenTodos(db)).toBe(0);
  });

  test("clearDoneTodos 刪掉已完成的，並回傳刪掉幾列", async () => {
    const { db, service } = await createSample();

    expect(clearDoneTodos(db)).toBe(1);
    expect(clearDoneTodos(db)).toBe(0);

    const remaining = await service.list();
    expect(remaining.map((todo) => todo.title)).toEqual(["寫作業", "倒垃圾"]);
  });

  test("clearDoneTodos 之後新增的待辦事項不會重複使用 id", async () => {
    const { db, service } = await createSample();
    await service.complete(3);
    clearDoneTodos(db);

    const added = await service.add("洗碗");
    expect(added.id).toBe(4);
  });
});
