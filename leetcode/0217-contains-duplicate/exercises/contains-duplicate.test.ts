import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { containsDuplicate } = await loadExercise<
  typeof import("./contains-duplicate.ts")
>(import.meta.dir, "contains-duplicate");

describe("LeetCode 217：Contains Duplicate", () => {
  test("題目的範例：2 出現兩次", () => {
    expect(containsDuplicate([6, 2, 8, 2, 5])).toBe(true);
  });

  test("每個數字都只出現一次", () => {
    expect(containsDuplicate([7, 3, 10, 1])).toBe(false);
  });

  test("最短的輸入：只有一個數字", () => {
    expect(containsDuplicate([4])).toBe(false);
  });

  test("兩個相同的數字", () => {
    expect(containsDuplicate([5, 5])).toBe(true);
  });

  test("重複的數字分別在最前面和最後面", () => {
    expect(containsDuplicate([9, 1, 2, 3, 9])).toBe(true);
  });

  test("負數與 0 也要能判斷", () => {
    expect(containsDuplicate([-1, 0, 1])).toBe(false);
    expect(containsDuplicate([0, -3, 0])).toBe(true);
    expect(containsDuplicate([-2, 2])).toBe(false);
  });

  test("不會改動傳進來的陣列", () => {
    const nums = [3, 1, 3];
    containsDuplicate(nums);
    expect(nums).toEqual([3, 1, 3]);
  });

  test("稍大的輸入：1 萬個數字", () => {
    const nums: number[] = [];
    for (let i = 0; i < 10000; i++) {
      nums.push(i);
    }
    expect(containsDuplicate(nums)).toBe(false);
    nums.push(42);
    expect(containsDuplicate(nums)).toBe(true);
  });
});
