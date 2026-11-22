// Run from the project root:
//   bun run day-12-crud-sql/examples/03-parameter-binding.ts
//
// Parameter binding: the SQL text and the values travel separately.
// A bound value is always treated as data, never as part of the SQL.

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
type CountRow = { total: number };

function countRows(): number {
  const row = db
    .query<CountRow, []>("SELECT COUNT(*) AS total FROM todos")
    .get();
  return row === null ? 0 : row.total;
}

const insert = db.query("INSERT INTO todos (title, priority) VALUES (?, ?)");
insert.run("買牛奶", "high");
insert.run("寫作業", "low");

// 1. Text with a quote in it. No escaping is needed with binding.
insert.run("It's Friday", "low");

// 2. Text that looks like SQL. A user could type this as a todo title,
// hoping the program glues it into the SQL string.
const hostileTitle = "'); DROP TABLE todos; --";
insert.run(hostileTitle, "low");

// The table is still there, and the strange titles are stored as plain text.
console.log(`資料表還在，共有 ${countRows()} 列`);
const rows = db
  .query<TodoRow, []>("SELECT id, title, done, priority FROM todos ORDER BY id")
  .all();
for (const row of rows) {
  console.log(`${row.id} | ${row.title}`);
}

// 3. The same protection for WHERE. This input tries to make the condition
// always true. With binding it is only a title that nobody has.
const selectByTitle = db.query<TodoRow, [string]>(
  "SELECT id, title, done, priority FROM todos WHERE title = ?",
);
const trickyInput = "' OR '1'='1";
console.log(`搜尋「買牛奶」：${selectByTitle.all("買牛奶").length} 列`);
console.log(
  `搜尋「${trickyInput}」：${selectByTitle.all(trickyInput).length} 列`,
);

// 4. Values are matched to the ? marks by position: first value, first ?.
const update = db.query("UPDATE todos SET priority = ? WHERE id = ?");
const changed = update.run("medium", 1);
console.log(`把 id 1 的 priority 改成 medium，改到 ${changed.changes} 列`);

db.close();
