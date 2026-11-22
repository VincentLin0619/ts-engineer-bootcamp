import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { Book } = await loadExercise<typeof import("./01-book.ts")>(
  import.meta.dir,
  "01-book",
);

describe("練習 01：第一個類別 Book", () => {
  test("建構子存下書名與總頁數，從第 0 頁開始", () => {
    const book = new Book("原子習慣", 320);
    expect(book.title).toBe("原子習慣");
    expect(book.totalPages).toBe(320);
    expect(book.currentPage).toBe(0);
  });

  test("read 會累加已讀頁數", () => {
    const book = new Book("原子習慣", 320);
    book.read(120);
    expect(book.currentPage).toBe(120);
    book.read(30);
    expect(book.currentPage).toBe(150);
  });

  test("read 不會超過最後一頁", () => {
    const book = new Book("小王子", 96);
    book.read(500);
    expect(book.currentPage).toBe(96);
  });

  test("isFinished 讀到最後一頁才是 true", () => {
    const book = new Book("小王子", 96);
    expect(book.isFinished()).toBe(false);
    book.read(95);
    expect(book.isFinished()).toBe(false);
    book.read(1);
    expect(book.isFinished()).toBe(true);
  });

  test("describe 組出一行進度", () => {
    const book = new Book("原子習慣", 320);
    book.read(120);
    expect(book.describe()).toBe("《原子習慣》120/320 頁");
  });

  test("兩個實例的資料互不影響", () => {
    const first = new Book("原子習慣", 320);
    const second = new Book("小王子", 96);
    first.read(100);
    expect(first.currentPage).toBe(100);
    expect(second.currentPage).toBe(0);
    expect(second.describe()).toBe("《小王子》0/96 頁");
  });
});
