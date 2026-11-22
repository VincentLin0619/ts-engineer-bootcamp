import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import { Todo } from "../examples/todo/todo.ts";

const { TodoList } = await loadExercise<typeof import("./03-todo-list.ts")>(
  import.meta.dir,
  "03-todo-list",
);

describe("練習 03（加練）：TodoList", () => {
  test("新的清單是空的", () => {
    const list = new TodoList();
    expect(list.size).toBe(0);
    expect(list.openCount).toBe(0);
    expect(list.toData()).toEqual([]);
  });

  test("add 建立 Todo，id 從 1 開始遞增", () => {
    const list = new TodoList();
    const milk = list.add("買牛奶");
    const report = list.add("寫報告", "high");
    expect(milk).toBeInstanceOf(Todo);
    expect(milk.id).toBe(1);
    expect(milk.priority).toBe("medium");
    expect(report.id).toBe(2);
    expect(report.priority).toBe("high");
    expect(list.size).toBe(2);
  });

  test("add 遇到不合法的標題會丟出錯誤，清單不變", () => {
    const list = new TodoList();
    list.add("買牛奶");
    expect(() => list.add("   ")).toThrow("標題不可以是空的");
    expect(list.size).toBe(1);
  });

  test("findById 回傳清單裡的同一個實例", () => {
    const list = new TodoList();
    const milk = list.add("買牛奶");
    list.add("寫報告");
    expect(list.findById(1)).toBe(milk);
    expect(list.findById(99)).toBeUndefined();
  });

  test("openCount 只算未完成的", () => {
    const list = new TodoList();
    const milk = list.add("買牛奶");
    list.add("寫報告");
    expect(list.openCount).toBe(2);
    milk.complete();
    expect(list.openCount).toBe(1);
    expect(list.size).toBe(2);
  });

  test("completeAll 完成所有未完成的，回傳這次改了幾筆", () => {
    const list = new TodoList();
    const milk = list.add("買牛奶");
    list.add("寫報告");
    list.add("倒垃圾");
    milk.complete();
    expect(list.completeAll()).toBe(2);
    expect(list.openCount).toBe(0);
    expect(list.completeAll()).toBe(0);
  });

  test("toData 依序回傳每一筆的純資料", () => {
    const list = new TodoList();
    list.add("買牛奶").complete();
    list.add("寫報告", "high");
    expect(list.toData()).toEqual([
      { id: 1, title: "買牛奶", done: true, priority: "medium" },
      { id: 2, title: "寫報告", done: false, priority: "high" },
    ]);
  });

  test("建構子接收既有的 Todo，id 從最大的 id 之後接續", () => {
    const list = new TodoList([new Todo(3, "買牛奶"), new Todo(7, "寫報告")]);
    expect(list.size).toBe(2);
    expect(list.add("倒垃圾").id).toBe(8);
  });

  test("建構子複製陣列，外面的陣列之後再變也不影響清單", () => {
    const todos = [new Todo(1, "買牛奶")];
    const list = new TodoList(todos);
    todos.push(new Todo(2, "寫報告"));
    expect(list.size).toBe(1);
  });

  test("TodoList.fromData 從純資料還原清單", () => {
    const original = new TodoList();
    original.add("買牛奶").complete();
    original.add("寫報告", "high");

    const restored = TodoList.fromData(original.toData());
    expect(restored.toData()).toEqual(original.toData());
    expect(restored.openCount).toBe(1);
    expect(restored.findById(1)).toBeInstanceOf(Todo);
    expect(restored.add("倒垃圾").id).toBe(3);
  });
});
