// Run from the project root:
//   bun run day-12-crud-sql/examples/02-sql-crud.ts

import { Database } from "bun:sqlite";

const db = new Database(":memory:");
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL
  )
`);

type TodoRow = { id: number; title: string; done: number; priority: string };

function formatRow(row: TodoRow): string {
  return `${row.id} | ${row.title} | ${row.done} | ${row.priority}`;
}

function printTable(label: string): void {
  console.log(`--- ${label} ---`);
  const rows = db
    .query<TodoRow, []>(
      "SELECT id, title, done, priority FROM todos ORDER BY id",
    )
    .all();
  for (const row of rows) {
    console.log(formatRow(row));
  }
}

// C = INSERT: add rows.
const insert = db.query("INSERT INTO todos (title, priority) VALUES (?, ?)");
insert.run("買牛奶", "high");
insert.run("寫作業", "medium");
insert.run("倒垃圾", "high");
printTable("C：INSERT 三列之後");

// R = SELECT: read rows. WHERE keeps only the rows that match.
// .all() gives an array of every matching row.
const highRows = db
  .query<TodoRow, [string]>(
    "SELECT id, title, done, priority FROM todos WHERE priority = ? ORDER BY id",
  )
  .all("high");
console.log("--- R：SELECT ... WHERE priority = 'high' ---");
for (const row of highRows) {
  console.log(formatRow(row));
}

// .get() gives the first matching row, or null when there is none.
const selectById = db.query<TodoRow, [number]>(
  "SELECT id, title, done, priority FROM todos WHERE id = ?",
);
const second = selectById.get(2);
const missing = selectById.get(99);
console.log(`id 2：${second === null ? "找不到" : formatRow(second)}`);
console.log(`id 99：${missing === null ? "找不到" : formatRow(missing)}`);

// U = UPDATE: change columns of the rows that match WHERE.
// run() reports how many rows were changed.
const update = db.query("UPDATE todos SET done = ? WHERE id = ?");
const updated = update.run(1, 2);
console.log(`U：UPDATE id 2，改到 ${updated.changes} 列`);

// No row matches id 99. That is not an error: zero rows are changed.
const updatedNothing = update.run(1, 99);
console.log(`U：UPDATE id 99，改到 ${updatedNothing.changes} 列`);
printTable("UPDATE 之後");

// D = DELETE: remove the rows that match WHERE.
const deleted = db.query("DELETE FROM todos WHERE id = ?").run(3);
console.log(`D：DELETE id 3，刪掉 ${deleted.changes} 列`);

// AUTOINCREMENT never hands out an id twice, even after a delete.
const added = insert.run("洗碗", "low");
console.log(`再新增一列，id 是 ${added.lastInsertRowid}，不是 3`);
printTable("最後的資料表");

db.close();
