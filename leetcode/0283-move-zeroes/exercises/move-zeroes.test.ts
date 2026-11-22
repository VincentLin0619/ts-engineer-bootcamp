import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { moveZeroes } = await loadExercise<typeof import("./move-zeroes.ts")>(
  import.meta.dir,
  "move-zeroes",
);

// Runs moveZeroes on a copy and returns that copy, so each test can start
// from a fresh array.
function moved(input: readonly number[]): number[] {
  const nums = [...input];
  moveZeroes(nums);
  return nums;
}

describe("LeetCode 283：Move Zeroes", () => {
  test("題目的範例", () => {
    expect(moved([0, 4, 0, 0, 7, 2])).toEqual([4, 7, 2, 0, 0, 0]);
  });

  test("直接修改傳進來的陣列，不回傳任何東西", () => {
    const nums = [9, 0, 3];
    const result = moveZeroes(nums);
    expect(result).toBeUndefined();
    expect(nums).toEqual([9, 3, 0]);
  });

  test("其他數字保持原本的順序", () => {
    expect(moved([0, 3, 0, 1, 2])).toEqual([3, 1, 2, 0, 0]);
    expect(moved([5, 0, 5, 0, 1])).toEqual([5, 5, 1, 0, 0]);
  });

  test("全部都是 0", () => {
    expect(moved([0, 0])).toEqual([0, 0]);
  });

  test("沒有任何 0", () => {
    expect(moved([5, -1])).toEqual([5, -1]);
  });

  test("最短的陣列：只有一個數字", () => {
    expect(moved([0])).toEqual([0]);
    expect(moved([8])).toEqual([8]);
  });

  test("0 已經都在最後面", () => {
    expect(moved([1, 2, 0, 0])).toEqual([1, 2, 0, 0]);
  });

  test("負數不是 0，要留在前面", () => {
    expect(moved([-3, 0, -3])).toEqual([-3, -3, 0]);
  });

  test("稍大的輸入：一萬個數字", () => {
    // Every third number is 0: 0, 1, 2, 0, 4, 5, 0, ...
    const nums: number[] = [];
    for (let i = 0; i < 10000; i++) {
      nums.push(i % 3 === 0 ? 0 : i);
    }
    const nonZeros = nums.filter((value) => value !== 0);
    const zeros = nums.filter((value) => value === 0);
    moveZeroes(nums);
    expect(nums).toEqual([...nonZeros, ...zeros]);
  });
});
