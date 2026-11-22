import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { runningSum } = await loadExercise<
  typeof import("./running-sum-of-1d-array.ts")
>(import.meta.dir, "running-sum-of-1d-array");

describe("LeetCode 1480：Running Sum of 1d Array", () => {
  test("題目的範例：[2, 5, -1, 4]", () => {
    expect(runningSum([2, 5, -1, 4])).toEqual([2, 7, 6, 10]);
  });

  test("最短的輸入：只有一個數字", () => {
    expect(runningSum([10])).toEqual([10]);
  });

  test("0 不會讓總和改變", () => {
    expect(runningSum([4, 0, 6, 3, 0])).toEqual([4, 4, 10, 13, 13]);
  });

  test("全部是負數", () => {
    expect(runningSum([-3, -2, -5])).toEqual([-3, -5, -10]);
  });

  test("重複的數字", () => {
    expect(runningSum([7, 7, 7, 7])).toEqual([7, 14, 21, 28]);
  });

  test("不會改動傳進來的陣列", () => {
    const nums = [1, 2, 3];
    runningSum(nums);
    expect(nums).toEqual([1, 2, 3]);
  });

  test("稍大的輸入：1 到 1000", () => {
    const nums: number[] = [];
    for (let i = 1; i <= 1000; i++) {
      nums.push(i);
    }
    const sums = runningSum(nums);
    expect(sums).toHaveLength(1000);
    expect(sums[0]).toBe(1);
    expect(sums[9]).toBe(55);
    expect(sums[999]).toBe(500500);
  });
});
