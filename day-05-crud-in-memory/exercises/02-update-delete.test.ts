import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { markAsRead, removeBook, updateBook } = await loadExercise<
  typeof import("./02-update-delete.ts")
>(import.meta.dir, "02-update-delete");

// A function, so every test starts from its own fresh copy of the data.
function sampleBooks() {
  return [
    { id: 1, title: "原子習慣", read: false },
    { id: 2, title: "被討厭的勇氣", read: true },
    { id: 3, title: "深夜食堂", read: false },
  ];
}

describe("練習 02：Update 與 Delete", () => {
  test("updateBook 只改指定的那一本", () => {
    expect(updateBook(sampleBooks(), 1, { title: "原子習慣（新版）" })).toEqual(
      [
        { id: 1, title: "原子習慣（新版）", read: false },
        { id: 2, title: "被討厭的勇氣", read: true },
        { id: 3, title: "深夜食堂", read: false },
      ],
    );
  });

  test("updateBook 可以一次改多個屬性", () => {
    const result = updateBook(sampleBooks(), 3, {
      title: "深夜食堂 2",
      read: true,
    });
    expect(result[2]).toEqual({ id: 3, title: "深夜食堂 2", read: true });
  });

  test("updateBook 不修改傳入的陣列與物件", () => {
    const books = sampleBooks();
    const firstBook = books[0];
    const result = updateBook(books, 1, { read: true });
    expect(books).toEqual(sampleBooks());
    expect(firstBook).toEqual({ id: 1, title: "原子習慣", read: false });
    expect(result).not.toBe(books);
    expect(result[0]).not.toBe(firstBook);
  });

  test("updateBook 找不到 id 時回傳內容相同的陣列", () => {
    expect(updateBook(sampleBooks(), 99, { read: true })).toEqual(
      sampleBooks(),
    );
  });

  test("markAsRead 把指定的書標成已讀", () => {
    expect(markAsRead(sampleBooks(), 3)).toEqual([
      { id: 1, title: "原子習慣", read: false },
      { id: 2, title: "被討厭的勇氣", read: true },
      { id: 3, title: "深夜食堂", read: true },
    ]);
  });

  test("markAsRead 不修改傳入的陣列", () => {
    const books = sampleBooks();
    markAsRead(books, 1);
    expect(books).toEqual(sampleBooks());
  });

  test("removeBook 回傳少一本的新陣列", () => {
    expect(removeBook(sampleBooks(), 2)).toEqual([
      { id: 1, title: "原子習慣", read: false },
      { id: 3, title: "深夜食堂", read: false },
    ]);
  });

  test("removeBook 不修改傳入的陣列", () => {
    const books = sampleBooks();
    const result = removeBook(books, 1);
    expect(books).toEqual(sampleBooks());
    expect(result).not.toBe(books);
  });

  test("removeBook 找不到 id 時回傳內容相同的陣列", () => {
    expect(removeBook(sampleBooks(), 99)).toEqual(sampleBooks());
  });
});
