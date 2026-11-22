import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const {
  createBooksTable,
  deleteBook,
  findTitlesWithAtLeast,
  insertBook,
  updatePages,
} = await loadExercise<typeof import("./01-sql-crud.ts")>(
  import.meta.dir,
  "01-sql-crud",
);

type BookRow = { id: number; title: string; pages: number };

// Reads the table directly, without using the exercise functions.
function readBooks(db: Database): BookRow[] {
  return db
    .query<BookRow, []>("SELECT id, title, pages FROM books ORDER BY id")
    .all();
}

// Every test gets its own empty in-memory database.
function createDatabase(): Database {
  const db = new Database(":memory:");
  createBooksTable(db);
  return db;
}

describe("練習 01：SQL 的四個動詞", () => {
  test("createBooksTable 建立 books 資料表，呼叫兩次也不會出錯", () => {
    const db = createDatabase();
    createBooksTable(db);

    expect(readBooks(db)).toEqual([]);
  });

  test("books 資料表的 title 與 pages 不可以是空值", () => {
    const db = createDatabase();

    expect(() => db.run("INSERT INTO books (pages) VALUES (10)")).toThrow();
    expect(() => db.run("INSERT INTO books (title) VALUES ('x')")).toThrow();
  });

  test("insertBook 新增一列並回傳資料庫產生的 id", () => {
    const db = createDatabase();

    expect(insertBook(db, "TypeScript 入門", 320)).toBe(1);
    expect(insertBook(db, "SQL 入門", 180)).toBe(2);
    expect(readBooks(db)).toEqual([
      { id: 1, title: "TypeScript 入門", pages: 320 },
      { id: 2, title: "SQL 入門", pages: 180 },
    ]);
  });

  test("insertBook 用參數綁定：書名裡的引號與 SQL 只是普通文字", () => {
    const db = createDatabase();
    const quoteTitle = "It's a book";
    const hostileTitle = "x', 1); DROP TABLE books; --";

    insertBook(db, quoteTitle, 100);
    insertBook(db, hostileTitle, 200);

    expect(readBooks(db)).toEqual([
      { id: 1, title: quoteTitle, pages: 100 },
      { id: 2, title: hostileTitle, pages: 200 },
    ]);
  });

  test("findTitlesWithAtLeast 用 WHERE 篩選，並依 id 排序", () => {
    const db = createDatabase();
    insertBook(db, "TypeScript 入門", 320);
    insertBook(db, "SQL 入門", 180);
    insertBook(db, "演算法", 200);

    expect(findTitlesWithAtLeast(db, 200)).toEqual([
      "TypeScript 入門",
      "演算法",
    ]);
    expect(findTitlesWithAtLeast(db, 100)).toEqual([
      "TypeScript 入門",
      "SQL 入門",
      "演算法",
    ]);
    expect(findTitlesWithAtLeast(db, 999)).toEqual([]);
  });

  test("updatePages 只改指定的那一列，並回傳有沒有改到", () => {
    const db = createDatabase();
    insertBook(db, "TypeScript 入門", 320);
    insertBook(db, "SQL 入門", 180);

    expect(updatePages(db, 1, 350)).toBe(true);
    expect(updatePages(db, 99, 350)).toBe(false);
    expect(readBooks(db)).toEqual([
      { id: 1, title: "TypeScript 入門", pages: 350 },
      { id: 2, title: "SQL 入門", pages: 180 },
    ]);
  });

  test("deleteBook 只刪指定的那一列，並回傳有沒有刪到", () => {
    const db = createDatabase();
    insertBook(db, "TypeScript 入門", 320);
    insertBook(db, "SQL 入門", 180);

    expect(deleteBook(db, 1)).toBe(true);
    expect(deleteBook(db, 1)).toBe(false);
    expect(readBooks(db)).toEqual([{ id: 2, title: "SQL 入門", pages: 180 }]);
  });

  test("刪除之後再新增，id 不會重複使用", () => {
    const db = createDatabase();
    insertBook(db, "TypeScript 入門", 320);
    const second = insertBook(db, "SQL 入門", 180);
    deleteBook(db, second);

    expect(insertBook(db, "演算法", 200)).toBe(3);
  });
});
