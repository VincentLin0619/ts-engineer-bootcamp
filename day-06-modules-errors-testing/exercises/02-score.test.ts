import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { averageScore, describeScore, errorMessage, parseScore } =
  await loadExercise<typeof import("./02-score.ts")>(
    import.meta.dir,
    "02-score",
  );

describe("練習 02：throw 與 try/catch", () => {
  test("parseScore 回傳合格的分數", () => {
    expect(parseScore("85")).toBe(85);
    expect(parseScore(" 85 ")).toBe(85);
    expect(parseScore("0")).toBe(0);
    expect(parseScore("100")).toBe(100);
  });

  test("parseScore 遇到空白時丟出錯誤", () => {
    expect(() => parseScore("")).toThrow("分數不可以是空白");
    expect(() => parseScore("   ")).toThrow("分數不可以是空白");
  });

  test("parseScore 遇到不是整數的文字時丟出錯誤", () => {
    expect(() => parseScore("abc")).toThrow("分數必須是整數：abc");
    expect(() => parseScore(" 85.5 ")).toThrow("分數必須是整數：85.5");
  });

  test("parseScore 遇到超出範圍的數字時丟出錯誤", () => {
    expect(() => parseScore("120")).toThrow("分數必須介於 0 到 100：120");
    expect(() => parseScore("-1")).toThrow("分數必須介於 0 到 100：-1");
  });

  test("errorMessage 取出 Error 的訊息", () => {
    expect(errorMessage(new Error("壞掉了"))).toBe("壞掉了");
  });

  test("errorMessage 遇到不是 Error 的值時回傳固定文字", () => {
    expect(errorMessage("just text")).toBe("未知的錯誤");
    expect(errorMessage(42)).toBe("未知的錯誤");
    expect(errorMessage(undefined)).toBe("未知的錯誤");
  });

  test("describeScore 成功時描述分數", () => {
    expect(describeScore("85")).toBe("分數：85");
  });

  test("describeScore 失敗時不丟錯誤，改回傳說明", () => {
    expect(describeScore("abc")).toBe("輸入錯誤：分數必須是整數：abc");
    expect(describeScore("")).toBe("輸入錯誤：分數不可以是空白");
    expect(describeScore("120")).toBe("輸入錯誤：分數必須介於 0 到 100：120");
  });

  test("averageScore 算出平均", () => {
    expect(averageScore(["80", "90"])).toBe(85);
    expect(averageScore(["100"])).toBe(100);
  });

  test("averageScore 遇到空陣列時丟出錯誤", () => {
    expect(() => averageScore([])).toThrow("至少需要一個分數");
  });

  test("averageScore 讓 parseScore 的錯誤往上傳", () => {
    expect(() => averageScore(["80", "abc"])).toThrow("分數必須是整數：abc");
  });
});
