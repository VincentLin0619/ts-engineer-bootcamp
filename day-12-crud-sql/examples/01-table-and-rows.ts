// Run from the project root:
//   bun run day-12-crud-sql/examples/01-table-and-rows.ts

import { Database } from "bun:sqlite";

// ":memory:" opens a database that lives in memory. It disappears when the
// program ends, which is perfect for experiments.
const db = new Database(":memory:");

// db.run(sql) runs a statement that needs no values.
// CREATE TABLE describes the columns: a name, a type and some rules each.
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL
  )
`);
console.log("資料表 todos 建立完成");

// The shape of one row when it comes back from SELECT.
// Copy the <TodoRow, []> part for now: it tells TypeScript what a row looks
// like and which values the statement needs. Angle brackets are a Day 14 topic.
type TodoRow = { id: number; title: string; done: number; priority: string };

// db.query(sql) prepares a statement. Nothing runs until .all() is called.
const selectAll = db.query<TodoRow, []>(
  "SELECT id, title, done, priority FROM todos ORDER BY id",
);

// A new table has columns but no rows.
console.log(`目前有 ${selectAll.all().length} 列`);

// INSERT adds one row. Each ? is filled in by a value passed to run().
// id and done are left out: the database fills them in by itself.
const insert = db.query("INSERT INTO todos (title, priority) VALUES (?, ?)");
const result = insert.run("買牛奶", "high");
console.log(
  `新增了 ${result.changes} 列，資料庫給它的 id 是 ${result.lastInsertRowid}`,
);

// A prepared statement can be run again with other values.
insert.run("寫作業", "medium");
insert.run("倒垃圾", "low");

// .all() gives every row as an array of objects: one object per row,
// one property per column.
console.log("id | title | done | priority");
for (const row of selectAll.all()) {
  console.log(`${row.id} | ${row.title} | ${row.done} | ${row.priority}`);
}

// The rules in CREATE TABLE are enforced by the database itself.
// title is NOT NULL, so a row without a title is refused.
try {
  db.query("INSERT INTO todos (priority) VALUES (?)").run("low");
} catch (error) {
  if (error instanceof Error) {
    console.log(`資料庫拒絕了這一列：${error.message}`);
  }
}

db.close();
