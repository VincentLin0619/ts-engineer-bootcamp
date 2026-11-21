import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { describeTodo, firstTodo, titleAt, todos } = await loadExercise<
  typeof import("./03-todo-data.ts")
>(import.meta.dir, "03-todo-data");

// `expect<unknown>` keeps this file type-checking before the `Todo` type
// in the exercise is completed.

describe("練習 03（加練）：Todo 的型別與資料", () => {
  test("firstTodo 是「買牛奶」這筆待辦事項", () => {
    expect<unknown>(firstTodo).toEqual({
      id: 1,
      title: "買牛奶",
      done: false,
      priority: "high",
    });
  });

  test("todos 依序放了三筆待辦事項", () => {
    expect<unknown>(todos).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
      { id: 2, title: "寫作業", done: true, priority: "medium" },
      { id: 3, title: "運動", done: false, priority: "low" },
    ]);
  });

  test("titleAt 回傳指定位置的標題", () => {
    expect(titleAt(todos, 0)).toBe("買牛奶");
    expect(titleAt(todos, 2)).toBe("運動");
  });

  test("titleAt 遇到空的位置回傳「（沒有這一筆）」", () => {
    expect(titleAt(todos, 9)).toBe("（沒有這一筆）");
    expect(titleAt([], 0)).toBe("（沒有這一筆）");
  });

  test("describeTodo 把一筆待辦事項組成一行文字", () => {
    expect(describeTodo(firstTodo)).toBe(
      "#1 買牛奶（優先度：high，完成：false）",
    );
  });
});
