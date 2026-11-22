// Reference solution for exercise 01.

import type { Database } from "bun:sqlite";

export function createBooksTable(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      pages INTEGER NOT NULL
    )
  `);
}

export function insertBook(db: Database, title: string, pages: number): number {
  // The values are bound to the ? marks: they are never part of the SQL text.
  const result = db
    .query("INSERT INTO books (title, pages) VALUES (?, ?)")
    .run(title, pages);
  return Number(result.lastInsertRowid);
}

type TitleRow = { title: string };

export function findTitlesWithAtLeast(
  db: Database,
  minPages: number,
): string[] {
  const rows = db
    .query<TitleRow, [number]>(
      "SELECT title FROM books WHERE pages >= ? ORDER BY id",
    )
    .all(minPages);
  return rows.map((row) => row.title);
}

export function updatePages(db: Database, id: number, pages: number): boolean {
  const result = db
    .query("UPDATE books SET pages = ? WHERE id = ?")
    .run(pages, id);
  // No matching row is not an error: changes is simply 0.
  return result.changes > 0;
}

export function deleteBook(db: Database, id: number): boolean {
  const result = db.query("DELETE FROM books WHERE id = ?").run(id);
  return result.changes > 0;
}
