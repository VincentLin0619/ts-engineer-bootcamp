import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import type { Todo } from "./03-todo-updates.ts";

const {
  countByPriority,
  getOpenTitles,
  sortByPriority,
  toggleDone,
  toggleDoneById,
} = await loadExercise<typeof import("./03-todo-updates.ts")>(
  import.meta.dir,
  "03-todo-updates",
);

const buyMilk: Todo = { id: 1, title: "買牛奶", done: false, priority: "high" };
const homework: Todo = {
  id: 2,
  title: "寫作業",
  done: true,
  priority: "medium",
};
const jogging: Todo = { id: 3, title: "運動", done: false, priority: "low" };
const trash: Todo = { id: 4, title: "倒垃圾", done: true, priority: "low" };
const todos: readonly Todo[] = [buyMilk, homework, jogging, trash];

describe("練習 03（加練）：Todo 的陣列操作與不可變更新", () => {
  test("toggleDone 回傳 done 相反的新物件", () => {
    const original: Todo = {
      id: 1,
      title: "買牛奶",
      done: false,
      priority: "high",
    };
    const toggled = toggleDone(original);
    expect(toggled).toEqual({
      id: 1,
      title: "買牛奶",
      done: true,
      priority: "high",
    });
    expect(toggleDone(toggled).done).toBe(false);
  });

  test("toggleDone 不會改動原本的物件", () => {
    const original: Todo = {
      id: 1,
      title: "買牛奶",
      done: false,
      priority: "high",
    };
    const toggled = toggleDone(original);
    expect(toggled).not.toBe(original);
    expect(original.done).toBe(false);
  });

  test("getOpenTitles 取出未完成事項的標題", () => {
    expect(getOpenTitles(todos)).toEqual(["買牛奶", "運動"]);
    expect(getOpenTitles([homework])).toEqual([]);
  });

  test("countByPriority 數出指定優先度的筆數", () => {
    expect(countByPriority(todos, "low")).toBe(2);
    expect(countByPriority(todos, "medium")).toBe(1);
    expect(countByPriority([], "high")).toBe(0);
  });

  test("toggleDoneById 只切換指定 id 的那一筆", () => {
    const result = toggleDoneById(todos, 3);
    expect(result).toEqual([
      buyMilk,
      homework,
      { id: 3, title: "運動", done: true, priority: "low" },
      trash,
    ]);
    // The untouched todos are the same objects, the toggled one is new.
    expect(result[0]).toBe(buyMilk);
    expect(result[2]).not.toBe(jogging);
  });

  test("toggleDoneById 不會改動原本的陣列與物件", () => {
    toggleDoneById(todos, 3);
    expect(jogging.done).toBe(false);
    expect(todos).toEqual([buyMilk, homework, jogging, trash]);
  });

  test("toggleDoneById 找不到 id 時回傳內容相同的新陣列", () => {
    const result = toggleDoneById(todos, 99);
    expect(result).toEqual([buyMilk, homework, jogging, trash]);
    expect(result).not.toBe(todos);
  });

  test("sortByPriority 把優先度高的排在前面", () => {
    expect(sortByPriority(todos)).toEqual([buyMilk, homework, jogging, trash]);
    expect(sortByPriority([jogging, homework, buyMilk])).toEqual([
      buyMilk,
      homework,
      jogging,
    ]);
  });

  test("sortByPriority 不會改動原本的順序", () => {
    const list: Todo[] = [jogging, homework, buyMilk];
    sortByPriority(list);
    expect(list).toEqual([jogging, homework, buyMilk]);
  });
});
