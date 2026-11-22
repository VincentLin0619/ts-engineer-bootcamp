import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { maximumWealth } = await loadExercise<
  typeof import("./richest-customer-wealth.ts")
>(import.meta.dir, "richest-customer-wealth");

describe("LeetCode 1672：Richest Customer Wealth", () => {
  test("題目的範例：資產是 12、15、12", () => {
    expect(
      maximumWealth([
        [3, 8, 1],
        [5, 5, 5],
        [2, 9, 1],
      ]),
    ).toBe(15);
  });

  test("每位客戶只有一筆存款", () => {
    expect(maximumWealth([[4], [10], [7]])).toBe(10);
  });

  test("最短的輸入：一位客戶、一筆存款", () => {
    expect(maximumWealth([[7]])).toBe(7);
  });

  test("兩位客戶一樣多", () => {
    expect(
      maximumWealth([
        [6, 1, 2],
        [2, 4, 3],
      ]),
    ).toBe(9);
  });

  test("最富有的客戶在最前面或最後面", () => {
    expect(
      maximumWealth([
        [50, 50],
        [1, 2],
        [3, 4],
      ]),
    ).toBe(100);
    expect(
      maximumWealth([
        [1, 1],
        [2, 2],
        [9, 9],
      ]),
    ).toBe(18);
  });

  test("不會改動傳進來的陣列", () => {
    const accounts = [
      [1, 2],
      [3, 4],
    ];
    maximumWealth(accounts);
    expect(accounts).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test("稍大的輸入：50 位客戶、每位 10 筆存款", () => {
    // Customer i has 10 accounts of (i + 1), so the richest has 10 * 50.
    const accounts: number[][] = [];
    for (let i = 0; i < 50; i++) {
      const customer: number[] = [];
      for (let bank = 0; bank < 10; bank++) {
        customer.push(i + 1);
      }
      accounts.push(customer);
    }
    expect(maximumWealth(accounts)).toBe(500);
  });
});
