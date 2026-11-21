import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { formatTodoLine, remainingMinutes } = await loadExercise<
  typeof import("./03-todo-line.ts")
>(import.meta.dir, "03-todo-line");

describe("練習 03（加練）：一行待辦事項", () => {
  test("formatTodoLine 組出一行文字", () => {
    expect(formatTodoLine("買牛奶", 15, false)).toBe(
      "買牛奶（15 分鐘）完成：false",
    );
    expect(formatTodoLine("寫作業", 60, true)).toBe(
      "寫作業（60 分鐘）完成：true",
    );
  });

  test("remainingMinutes 算出剩餘分鐘數", () => {
    expect(remainingMinutes(15, 10)).toBe(5);
    expect(remainingMinutes(60, 60)).toBe(0);
  });
});
