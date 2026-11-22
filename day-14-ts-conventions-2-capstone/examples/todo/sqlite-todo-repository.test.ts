// Tests for what is special about the SQLite version: real rows in a table.
// Every test opens its own ":memory:" database, so nothing touches the disk.

import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { ValidationError } from "./errors.ts";
import { SqliteTodoRepository } from "./sqlite-todo-repository.ts";

type CountRow = { total: number };

function countRows(db: Database): number {
  const row = db
    .query<CountRow, []>("SELECT COUNT(*) AS total FROM todos")
    .get();
  return row === null ? 0 : row.total;
}

describe("SqliteTodoRepository 的資料庫行為", () => {
  test("建構子會建立 todos 資料表，重複建立也不會出錯", () => {
    const db = new Database(":memory:");
    new SqliteTodoRepository(db);
    new SqliteTodoRepository(db);

    expect(countRows(db)).toBe(0);
  });

  test("資料表裡的 done 是 0 或 1，讀出來的 Todo 是 boolean", async () => {
    const db = new Database(":memory:");
    const repository = new SqliteTodoRepository(db);
    const todo = await repository.create({ title: "買牛奶", priority: "high" });
    todo.complete();
    await repository.save(todo);

    const rows = db.query("SELECT id, title, done, priority FROM todos").all();
    expect(rows).toEqual([
      { id: 1, title: "買牛奶", done: 1, priority: "high" },
    ]);

    const reloaded = await repository.findById(1);
    expect(reloaded?.done).toBe(true);
  });

  test("標題裡的引號與 SQL 語法都只是普通文字", async () => {
    const db = new Database(":memory:");
    const repository = new SqliteTodoRepository(db);
    const hostileTitle = "'); DROP TABLE todos; --";

    await repository.create({ title: "買牛奶", priority: "low" });
    const created = await repository.create({
      title: hostileTitle,
      priority: "low",
    });

    const reloaded = await repository.findById(created.id);
    expect(reloaded?.title).toBe(hostileTitle);
    expect(countRows(db)).toBe(2);
  });

  test("標題不合規則時不會寫進資料表", async () => {
    const db = new Database(":memory:");
    const repository = new SqliteTodoRepository(db);

    await expect(
      repository.create({ title: "   ", priority: "low" }),
    ).rejects.toThrow(ValidationError);
    expect(countRows(db)).toBe(0);
  });

  test("刪掉最後一筆之後，新的 id 不會重複使用", async () => {
    const db = new Database(":memory:");
    const repository = new SqliteTodoRepository(db);
    await repository.create({ title: "一", priority: "low" });
    const second = await repository.create({ title: "二", priority: "low" });
    await repository.delete(second.id);

    const third = await repository.create({ title: "三", priority: "low" });
    expect(third.id).toBe(3);
  });

  test("資料表裡有不認識的優先度時丟出錯誤", async () => {
    const db = new Database(":memory:");
    const repository = new SqliteTodoRepository(db);
    // Write a bad row directly with SQL, the way another program might.
    db.query("INSERT INTO todos (title, done, priority) VALUES (?, ?, ?)").run(
      "買牛奶",
      0,
      "urgent",
    );

    await expect(repository.findAll()).rejects.toThrow(
      "資料庫裡有不認識的優先度：urgent",
    );
  });

  test("同一個 Database 交給新的 repository 物件，資料還在", async () => {
    const db = new Database(":memory:");
    const first = new SqliteTodoRepository(db);
    await first.create({ title: "買牛奶", priority: "medium" });

    const second = new SqliteTodoRepository(db);
    const todos = await second.findAll();
    expect(todos.map((todo) => todo.title)).toEqual(["買牛奶"]);
  });
});
