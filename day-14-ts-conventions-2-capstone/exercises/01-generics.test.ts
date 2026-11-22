import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import type { TodoData } from "../examples/todo/todo.ts";

const { applyPatch, findById, lastItem, replaceById, toSummary } =
  await loadExercise<typeof import("./01-generics.ts")>(
    import.meta.dir,
    "01-generics",
  );

const members = [
  { id: 1, name: "小明" },
  { id: 2, name: "小華" },
  { id: 3, name: "小美" },
];

const milk: TodoData = {
  id: 1,
  title: "買牛奶",
  done: false,
  priority: "low",
};

describe("練習 01：泛型函式與工具型別", () => {
  test("lastItem 回傳最後一個元素，型別跟著元素走", () => {
    const lastNumber = lastItem([10, 20, 30]);
    const lastText = lastItem(["買牛奶", "寫作業"]);

    expect(lastNumber).toBe(30);
    expect(lastText).toBe("寫作業");
    expect(lastItem([])).toBeUndefined();
  });

  test("findById 找到 id 相同的那一筆", () => {
    expect(findById(members, 2)).toEqual({ id: 2, name: "小華" });
    expect(findById(members, 9)).toBeUndefined();
    expect(findById([milk], 1)).toEqual(milk);
  });

  test("replaceById 回傳換過的新陣列，順序不變", () => {
    const result = replaceById(members, { id: 2, name: "阿華" });

    expect(result).toEqual([
      { id: 1, name: "小明" },
      { id: 2, name: "阿華" },
      { id: 3, name: "小美" },
    ]);
  });

  test("replaceById 不修改原本的陣列", () => {
    const result = replaceById(members, { id: 2, name: "阿華" });

    expect(result).not.toBe(members);
    expect(members[1]).toEqual({ id: 2, name: "小華" });
  });

  test("replaceById 找不到 id 時內容不變", () => {
    const result = replaceById(members, { id: 9, name: "路人" });

    expect(result).toEqual(members);
    expect(result).not.toBe(members);
  });

  test("toSummary 只留下 id 與 title", () => {
    expect(toSummary(milk)).toEqual({ id: 1, title: "買牛奶" });
  });

  test("applyPatch 套用修改並回傳新物件", () => {
    const result = applyPatch(milk, { done: true, priority: "high" });

    expect(result).toEqual({
      id: 1,
      title: "買牛奶",
      done: true,
      priority: "high",
    });
    expect(applyPatch(milk, {})).toEqual(milk);
  });

  test("applyPatch 不修改原本的物件", () => {
    const result = applyPatch(milk, { title: "買豆漿" });

    expect(result).not.toBe(milk);
    expect(milk.title).toBe("買牛奶");
  });
});
