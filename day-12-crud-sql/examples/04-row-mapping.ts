// Run from the project root:
//   bun run day-12-crud-sql/examples/04-row-mapping.ts
//
// A row from the database is not yet a Todo. This file shows the conversion
// in both directions.

import { Database } from "bun:sqlite";
import { isPriority, Todo } from "./todo/todo.ts";

const db = new Database(":memory:");
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL
  )
`);

// What SQLite really gives back: done is a number, priority is any text.
type TodoRow = { id: number; title: string; done: number; priority: string };

// Row -> Todo
function rowToTodo(row: TodoRow): Todo {
  // row.priority is `string` here. After the guard it is `Priority`.
  if (!isPriority(row.priority)) {
    throw new Error(`資料庫裡有不認識的優先度：${row.priority}`);
  }
  // 1 -> true, 0 -> false
  return new Todo(row.id, row.title, row.priority, row.done === 1);
}

const insert = db.query(
  "INSERT INTO todos (title, done, priority) VALUES (?, ?, ?)",
);
insert.run("買牛奶", 1, "high");
insert.run("寫作業", 0, "medium");

const selectAll = db.query<TodoRow, []>(
  "SELECT id, title, done, priority FROM todos ORDER BY id",
);

// 1. Reading: row -> Todo
console.log("--- 從資料庫讀出來 ---");
for (const row of selectAll.all()) {
  const todo = rowToTodo(row);
  console.log(
    `列：done = ${row.done}（${typeof row.done}） → Todo：done = ${todo.done}（${typeof todo.done}）`,
  );
}

// 2. Writing: Todo -> values for the ? marks. boolean becomes 1 or 0.
const firstRow = selectAll.all()[0];
if (firstRow !== undefined) {
  const todo = rowToTodo(firstRow);
  todo.reopen();
  db.query("UPDATE todos SET done = ? WHERE id = ?").run(
    todo.done ? 1 : 0,
    todo.id,
  );
  console.log("--- 把 id 1 改回未完成，再讀一次 ---");
  for (const row of selectAll.all()) {
    console.log(`${row.id} | ${row.title} | ${row.done} | ${row.priority}`);
  }
}

// 3. The table accepts any text as priority. Another program (or a typo in
// a SQL tool) can store a word that our program does not know.
insert.run("倒垃圾", 0, "urgent");
console.log("--- 資料表裡出現了不認識的優先度 ---");
try {
  const todos = selectAll.all().map((row) => rowToTodo(row));
  console.log(`這一行不會執行：${todos.length}`);
} catch (error) {
  if (error instanceof Error) {
    console.log(`轉換失敗：${error.message}`);
  }
}

db.close();
