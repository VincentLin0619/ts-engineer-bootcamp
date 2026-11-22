import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { isValid } = await loadExercise<typeof import("./valid-parentheses.ts")>(
  import.meta.dir,
  "valid-parentheses",
);

describe("LeetCode 20：Valid Parentheses", () => {
  test("題目的範例", () => {
    expect(isValid("{[]()}")).toBe(true);
    expect(isValid("[(])")).toBe(false);
    expect(isValid("((")).toBe(false);
    expect(isValid("}{")).toBe(false);
  });

  test("並排與一層包一層都可以", () => {
    expect(isValid("[]{}()")).toBe(true);
    expect(isValid("{{[[(())]]}}")).toBe(true);
    expect(isValid("([]){}[({})]")).toBe(true);
  });

  test("種類不同就不能配對", () => {
    expect(isValid("(}")).toBe(false);
    expect(isValid("{)")).toBe(false);
    expect(isValid("[}")).toBe(false);
  });

  test("右括號前面沒有左括號", () => {
    expect(isValid(")")).toBe(false);
    expect(isValid("())")).toBe(false);
  });

  test("最後還有沒關上的左括號", () => {
    expect(isValid("[")).toBe(false);
    expect(isValid("{[]")).toBe(false);
  });

  test("最短的有效輸入", () => {
    expect(isValid("{}")).toBe(true);
  });

  test("稍大的輸入：三萬個字元，括號疊了一萬五千層", () => {
    const deep = `${"([{".repeat(5000)}${"}])".repeat(5000)}`;
    expect(isValid(deep)).toBe(true);
    expect(isValid(`${deep}(`)).toBe(false);
    expect(isValid("()".repeat(10000))).toBe(true);
  });
});
