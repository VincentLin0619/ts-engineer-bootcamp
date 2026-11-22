import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { isPalindrome } = await loadExercise<
  typeof import("./valid-palindrome.ts")
>(import.meta.dir, "valid-palindrome");

describe("LeetCode 125：Valid Palindrome", () => {
  test("題目的範例", () => {
    expect(isPalindrome("Top spot!")).toBe(true);
    expect(isPalindrome("Step on a pet")).toBe(false);
    expect(isPalindrome("12:21")).toBe(true);
    expect(isPalindrome("?!")).toBe(true);
  });

  test("大小寫視為同一個字母", () => {
    expect(isPalindrome("Noon")).toBe(true);
    expect(isPalindrome("AbBa")).toBe(true);
  });

  test("空白與標點符號都略過", () => {
    expect(isPalindrome("ab, ba")).toBe(true);
    expect(isPalindrome(" r.a-c e_c,a r ")).toBe(true);
    expect(isPalindrome("a.b")).toBe(false);
  });

  test("數字也要比較：0 和 o 不一樣", () => {
    expect(isPalindrome("1a1")).toBe(true);
    expect(isPalindrome("0o")).toBe(false);
    expect(isPalindrome("a1")).toBe(false);
  });

  test("最短的輸入：空字串與一個字", () => {
    expect(isPalindrome("")).toBe(true);
    expect(isPalindrome("x")).toBe(true);
    expect(isPalindrome(" ")).toBe(true);
  });

  test("只有最中間不一樣也要抓到", () => {
    expect(isPalindrome("abcxdcba")).toBe(false);
    expect(isPalindrome("abcddcba")).toBe(true);
  });

  test("稍大的輸入：一萬多個字", () => {
    const half = "Ab, ".repeat(2500);
    const mirrored = " ,bA".repeat(2500);
    expect(isPalindrome(`${half}z${mirrored}`)).toBe(true);
    expect(isPalindrome(`${half}zy${mirrored}`)).toBe(false);
  });
});
