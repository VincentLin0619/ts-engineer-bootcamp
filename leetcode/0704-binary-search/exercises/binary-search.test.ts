import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { search } = await loadExercise<typeof import("./binary-search.ts")>(
  import.meta.dir,
  "binary-search",
);

const nums = [3, 9, 14, 20, 27, 31, 38, 45, 52, 60];

describe("LeetCode 704：Binary Search", () => {
  test("題目的範例：找得到", () => {
    expect(search(nums, 38)).toBe(6);
  });

  test("題目的範例：找不到時回傳 -1", () => {
    expect(search(nums, 10)).toBe(-1);
  });

  test("target 在第一個或最後一個位置", () => {
    expect(search(nums, 3)).toBe(0);
    expect(search(nums, 60)).toBe(9);
  });

  test("每一個位置都找得到", () => {
    for (const [i, value] of nums.entries()) {
      expect(search(nums, value)).toBe(i);
    }
  });

  test("比全部都小、比全部都大，都找不到", () => {
    expect(search(nums, 1)).toBe(-1);
    expect(search(nums, 99)).toBe(-1);
  });

  test("最短的陣列：只有一個數字", () => {
    expect(search([7], 7)).toBe(0);
    expect(search([7], 4)).toBe(-1);
    expect(search([7], 8)).toBe(-1);
  });

  test("兩個數字", () => {
    expect(search([1, 4], 1)).toBe(0);
    expect(search([1, 4], 4)).toBe(1);
    expect(search([1, 4], 2)).toBe(-1);
  });

  test("負數也能處理", () => {
    expect(search([-8, -2, 0, 7], -8)).toBe(0);
    expect(search([-8, -2, 0, 7], -5)).toBe(-1);
  });

  test("稍大的輸入：十萬個數字", () => {
    // 0, 2, 4, ..., 199998
    const evens: number[] = [];
    for (let i = 0; i < 100000; i++) {
      evens.push(i * 2);
    }
    expect(search(evens, 123456)).toBe(61728);
    expect(search(evens, 123457)).toBe(-1);
    expect(search(evens, 199998)).toBe(99999);
  });
});
