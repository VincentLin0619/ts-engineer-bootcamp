import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import type { Todo } from "../examples/todo/types.ts";

const { addTodoSafely, completeTodo, completeTodoSafely } = await loadExercise<
  typeof import("./03-todo-safe.ts")
>(import.meta.dir, "03-todo-safe");

// A function, so every test starts from its own fresh copy of the data.
function sampleTodos(): Todo[] {
  return [
    { id: 1, title: "買牛奶", done: false, priority: "high" },
    { id: 2, title: "寫作業", done: true, priority: "medium" },
  ];
}

describe("練習 03（加練）：不會丟錯誤的 Todo 指令", () => {
  test("completeTodo 把未完成的待辦事項標成完成", () => {
    expect(completeTodo(sampleTodos(), 1)).toEqual([
      { id: 1, title: "買牛奶", done: true, priority: "high" },
      { id: 2, title: "寫作業", done: true, priority: "medium" },
    ]);
  });

  test("completeTodo 不修改傳入的陣列", () => {
    const todos = sampleTodos();
    completeTodo(todos, 1);
    expect(todos).toEqual(sampleTodos());
  });

  test("completeTodo 找不到 id 時丟出錯誤", () => {
    expect(() => completeTodo(sampleTodos(), 99)).toThrow(
      "找不到 id 為 99 的待辦事項",
    );
  });

  test("completeTodo 遇到已完成的待辦事項時丟出錯誤", () => {
    expect(() => completeTodo(sampleTodos(), 2)).toThrow(
      "id 為 2 的待辦事項已經完成",
    );
  });

  test("addTodoSafely 成功時回傳新清單與訊息", () => {
    expect(addTodoSafely([], " 買牛奶 ")).toEqual({
      todos: [{ id: 1, title: "買牛奶", done: false, priority: "medium" }],
      message: "已新增：買牛奶",
    });
  });

  test("addTodoSafely 失敗時不丟錯誤，清單內容不變", () => {
    expect(addTodoSafely(sampleTodos(), "  ")).toEqual({
      todos: sampleTodos(),
      message: "錯誤：標題不可以是空白",
    });
    expect(addTodoSafely([], "字".repeat(101))).toEqual({
      todos: [],
      message: "錯誤：標題不可以超過 100 個字",
    });
  });

  test("completeTodoSafely 成功時回傳新清單與訊息", () => {
    expect(completeTodoSafely(sampleTodos(), 1)).toEqual({
      todos: [
        { id: 1, title: "買牛奶", done: true, priority: "high" },
        { id: 2, title: "寫作業", done: true, priority: "medium" },
      ],
      message: "已完成 id 為 1 的待辦事項",
    });
  });

  test("completeTodoSafely 失敗時不丟錯誤，清單內容不變", () => {
    expect(completeTodoSafely(sampleTodos(), 99)).toEqual({
      todos: sampleTodos(),
      message: "錯誤：找不到 id 為 99 的待辦事項",
    });
    expect(completeTodoSafely(sampleTodos(), 2)).toEqual({
      todos: sampleTodos(),
      message: "錯誤：id 為 2 的待辦事項已經完成",
    });
  });
});
