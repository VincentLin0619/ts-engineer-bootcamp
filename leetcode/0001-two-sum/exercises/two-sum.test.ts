import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { twoSum } = await loadExercise<typeof import("./two-sum.ts")>(
  import.meta.dir,
  "two-sum",
);

describe("LeetCode 1：Two Sum", () => {
  test("題目的範例：8 + 5 = 13", () => {
    expect(twoSum([3, 8, 5, 1], 13)).toEqual([1, 2]);
  });

  test("兩個位置上的數字可以一樣", () => {
    expect(twoSum([6, 6], 12)).toEqual([0, 1]);
  });

  test("找不到時回傳空陣列", () => {
    expect(twoSum([2, 4, 7], 20)).toEqual([]);
  });

  test("同一個位置不能用兩次", () => {
    expect(twoSum([6, 1], 12)).toEqual([]);
    expect(twoSum([5, 2, 9], 10)).toEqual([]);
  });

  test("最短的陣列：只有兩個數字", () => {
    expect(twoSum([1, 2], 3)).toEqual([0, 1]);
  });

  test("答案在頭尾兩端，小的位置放前面", () => {
    expect(twoSum([4, 10, 20, 6], 10)).toEqual([0, 3]);
  });

  test("負數與 0 也能處理", () => {
    expect(twoSum([-4, 10, 7, 3], 3)).toEqual([0, 2]);
    expect(twoSum([0, 5, 0], 0)).toEqual([0, 2]);
  });

  test("稍大的輸入：一萬多個數字", () => {
    // 0, 2, 4, ..., 19998, then 1. Only 19998 + 1 makes the odd target.
    const nums: number[] = [];
    for (let i = 0; i < 10000; i++) {
      nums.push(i * 2);
    }
    nums.push(1);
    expect(twoSum(nums, 19999)).toEqual([9999, 10000]);
  });
});
