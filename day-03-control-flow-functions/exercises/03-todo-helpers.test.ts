import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import type { Todo } from "./03-todo-helpers.ts";

const exercise = await loadExercise<typeof import("./03-todo-helpers.ts")>(
  import.meta.dir,
  "03-todo-helpers",
);
const { countByPriority, countDone, formatSummary, formatTodo, priorityLabel } =
  exercise;

const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "medium" },
  { id: 3, title: "運動", done: false, priority: "low" },
  { id: 4, title: "倒垃圾", done: true, priority: "low" },
];

describe("練習 03（加練）：Todo 輔助函式", () => {
  test("priorityLabel 把優先度換成中文", () => {
    expect(priorityLabel("low")).toBe("低");
    expect(priorityLabel("medium")).toBe("中");
    expect(priorityLabel("high")).toBe("高");
  });

  test("formatTodo 把一筆待辦事項排成一行", () => {
    expect(
      formatTodo({ id: 2, title: "寫作業", done: true, priority: "medium" }),
    ).toBe("[x] #2 寫作業（優先度：中）");
    expect(
      formatTodo({ id: 1, title: "買牛奶", done: false, priority: "high" }),
    ).toBe("[ ] #1 買牛奶（優先度：高）");
  });

  test("countDone 數出已完成的筆數", () => {
    expect(countDone(todos)).toBe(2);
    expect(countDone([])).toBe(0);
  });

  test("countByPriority 數出指定優先度的筆數", () => {
    expect(countByPriority(todos, "low")).toBe(2);
    expect(countByPriority(todos, "medium")).toBe(1);
    expect(countByPriority(todos, "high")).toBe(1);
    expect(countByPriority([], "high")).toBe(0);
  });

  test("formatSummary 組出統計文字", () => {
    expect(formatSummary(todos)).toBe("共 4 筆，已完成 2 筆，未完成 2 筆");
    expect(formatSummary([])).toBe("共 0 筆，已完成 0 筆，未完成 0 筆");
  });
});
