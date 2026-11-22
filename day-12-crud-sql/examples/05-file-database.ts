// Run from the project root:
//   bun run day-12-crud-sql/examples/05-file-database.ts
//
// ":memory:" forgets everything. A database file keeps the data.

import { Database } from "bun:sqlite";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL
  )
`;

type CountRow = { total: number };

function countRows(db: Database): number {
  const row = db
    .query<CountRow, []>("SELECT COUNT(*) AS total FROM todos")
    .get();
  return row === null ? 0 : row.total;
}

// Runtime files go into the lesson's .data/ folder, which git ignores.
const dataFolder = join(import.meta.dir, "..", ".data");
const databasePath = join(dataFolder, "file-demo.sqlite");

// SQLite creates the file, but not the folder around it.
await mkdir(dataFolder, { recursive: true });

// Start from a clean state so that every run prints the same thing.
if (await Bun.file(databasePath).exists()) {
  await Bun.file(databasePath).delete();
}

// 1. First "program": open the file, create the table, add a row, close.
const firstConnection = new Database(databasePath);
firstConnection.run(CREATE_TABLE_SQL);
firstConnection
  .query("INSERT INTO todos (title, priority) VALUES (?, ?)")
  .run("買牛奶", "high");
console.log(`第一次開啟：寫入後有 ${countRows(firstConnection)} 列`);
firstConnection.close();

// 2. Second "program": open the same file again. The row is still there.
// CREATE TABLE IF NOT EXISTS does nothing, because the table exists.
const secondConnection = new Database(databasePath);
secondConnection.run(CREATE_TABLE_SQL);
console.log(`第二次開啟同一個檔案：有 ${countRows(secondConnection)} 列`);
secondConnection.close();

// 3. Two in-memory databases share nothing: each one starts empty.
const memoryOne = new Database(":memory:");
memoryOne.run(CREATE_TABLE_SQL);
memoryOne
  .query("INSERT INTO todos (title, priority) VALUES (?, ?)")
  .run("寫作業", "low");
const memoryTwo = new Database(":memory:");
memoryTwo.run(CREATE_TABLE_SQL);
console.log(
  `兩個 :memory: 資料庫：第一個 ${countRows(memoryOne)} 列，第二個 ${countRows(memoryTwo)} 列`,
);
memoryOne.close();
memoryTwo.close();

// Clean up, so the example leaves nothing behind.
await Bun.file(databasePath).delete();
console.log("示範用的資料庫檔案已刪除");
