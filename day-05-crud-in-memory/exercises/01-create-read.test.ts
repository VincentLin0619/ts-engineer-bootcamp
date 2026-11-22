import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { addBook, describeBook, findBookById, nextBookId } = await loadExercise<
  typeof import("./01-create-read.ts")
>(import.meta.dir, "01-create-read");

const sampleBooks = [
  { id: 1, title: "原子習慣", read: false },
  { id: 2, title: "被討厭的勇氣", read: true },
];

describe("練習 01：Create 與 Read", () => {
  test("nextBookId 在空陣列時回傳 1", () => {
    expect(nextBookId([])).toBe(1);
  });

  test("nextBookId 回傳最大的 id 加 1，不是筆數加 1", () => {
    expect(nextBookId(sampleBooks)).toBe(3);
    expect(
      nextBookId([
        { id: 5, title: "深夜食堂", read: false },
        { id: 2, title: "被討厭的勇氣", read: true },
      ]),
    ).toBe(6);
  });

  test("addBook 回傳多一筆的新陣列", () => {
    expect(addBook([], "原子習慣")).toEqual([
      { id: 1, title: "原子習慣", read: false },
    ]);
    expect(addBook(sampleBooks, "深夜食堂")).toEqual([
      { id: 1, title: "原子習慣", read: false },
      { id: 2, title: "被討厭的勇氣", read: true },
      { id: 3, title: "深夜食堂", read: false },
    ]);
  });

  test("addBook 不修改傳入的陣列", () => {
    const books = [{ id: 1, title: "原子習慣", read: false }];
    const result = addBook(books, "深夜食堂");
    expect(books).toEqual([{ id: 1, title: "原子習慣", read: false }]);
    expect(result).not.toBe(books);
  });

  test("findBookById 找得到時回傳那一本書", () => {
    expect(findBookById(sampleBooks, 2)).toEqual({
      id: 2,
      title: "被討厭的勇氣",
      read: true,
    });
  });

  test("findBookById 找不到時回傳 undefined", () => {
    expect(findBookById(sampleBooks, 99)).toBeUndefined();
    expect(findBookById([], 1)).toBeUndefined();
  });

  test("describeBook 依照 read 組出句子", () => {
    expect(describeBook(sampleBooks, 1)).toBe("《原子習慣》未讀");
    expect(describeBook(sampleBooks, 2)).toBe("《被討厭的勇氣》已讀");
  });

  test("describeBook 找不到時回傳提示文字", () => {
    expect(describeBook(sampleBooks, 99)).toBe("找不到 id 為 99 的書");
  });
});
