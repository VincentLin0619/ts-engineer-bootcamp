// Exercise 01: the four SQL verbs with parameter binding.
//
// Every function receives an open Database. The table is called `books`:
//
//   id     INTEGER PRIMARY KEY AUTOINCREMENT
//   title  TEXT NOT NULL
//   pages  INTEGER NOT NULL
//
// Rule for the whole file: values go in through `?` marks. Never build a
// SQL string out of the parameters. One of the tests uses a book title that
// contains quotes and SQL to check this.
//
// Complete the functions marked TODO, then run: bun test day-12

import type { Database } from "bun:sqlite";

// Create the `books` table described above. Calling it twice must not fail.
export function createBooksTable(db: Database): void {
  // TODO: run a CREATE TABLE IF NOT EXISTS statement with db.run(...)
  throw new Error("TODO：尚未完成 createBooksTable");
}

// C: add one book and return the id the database gave it.
// insertBook(db, "TypeScript 入門", 320) -> 1   (first book)
// insertBook(db, "SQL 入門", 180)        -> 2
export function insertBook(db: Database, title: string, pages: number): number {
  // TODO: INSERT with two ? marks, then return Number(result.lastInsertRowid)
  throw new Error("TODO：尚未完成 insertBook");
}

// R: return the titles of all books with at least `minPages` pages,
// ordered by id.
// With the two books above:
// findTitlesWithAtLeast(db, 200) -> ["TypeScript 入門"]
// findTitlesWithAtLeast(db, 100) -> ["TypeScript 入門", "SQL 入門"]
// findTitlesWithAtLeast(db, 999) -> []
export function findTitlesWithAtLeast(
  db: Database,
  minPages: number,
): string[] {
  // TODO: SELECT title ... WHERE pages >= ? ORDER BY id, then take the titles
  // Hint: the row type is { title: string }
  throw new Error("TODO：尚未完成 findTitlesWithAtLeast");
}

// U: change the page count of one book. Return true when a row was changed,
// false when no book has that id.
// updatePages(db, 1, 350)  -> true
// updatePages(db, 99, 350) -> false
export function updatePages(db: Database, id: number, pages: number): boolean {
  // TODO: UPDATE ... WHERE id = ?, then look at result.changes
  throw new Error("TODO：尚未完成 updatePages");
}

// D: delete one book. Return true when a row was deleted.
// deleteBook(db, 1)  -> true
// deleteBook(db, 1)  -> false (already gone)
export function deleteBook(db: Database, id: number): boolean {
  // TODO: DELETE ... WHERE id = ?, then look at result.changes
  throw new Error("TODO：尚未完成 deleteBook");
}
