// Run from the project root:
//   bun test day-06-modules-errors-testing/examples/todo
//
// Tests for store.ts. Every test follows the same three steps:
// Arrange (prepare data), Act (call the function once), Assert (check).

import { describe, expect, test } from "bun:test";
import {
  createTodo,
  deleteTodo,
  findTodoById,
  nextId,
  updateTodo,
} from "./store.ts";
import type { Todo } from "./types.ts";

// A function, so every test gets its own fresh copy of the data.
function sampleTodos(): Todo[] {
  return [
    { id: 1, title: "買牛奶", done: false, priority: "high" },
    { id: 2, title: "寫作業", done: false, priority: "medium" },
  ];
}

describe("nextId", () => {
  test("空陣列時回傳 1", () => {
    // Arrange
    const todos: Todo[] = [];

    // Act
    const id = nextId(todos);

    // Assert
    expect(id).toBe(1);
  });

  test("回傳最大的 id 加 1", () => {
    const todos: Todo[] = [
      { id: 5, title: "繳電費", done: false, priority: "low" },
      { id: 2, title: "寫作業", done: false, priority: "medium" },
    ];

    const id = nextId(todos);

    expect(id).toBe(6);
  });
});

describe("createTodo", () => {
  test("在尾端加上一筆未完成的待辦事項", () => {
    const todos = sampleTodos();

    const result = createTodo(todos, { title: "倒垃圾", priority: "low" });

    // toEqual compares the contents of objects and arrays.
    expect(result).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
      { id: 2, title: "寫作業", done: false, priority: "medium" },
      { id: 3, title: "倒垃圾", done: false, priority: "low" },
    ]);
  });

  test("不修改傳入的陣列", () => {
    const todos = sampleTodos();

    createTodo(todos, { title: "倒垃圾", priority: "low" });

    expect(todos).toEqual(sampleTodos());
  });

  test("存進去的是去掉前後空白的標題", () => {
    const result = createTodo([], { title: "  買牛奶  ", priority: "high" });

    expect(result).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
    ]);
  });

  test("標題是空白時丟出錯誤", () => {
    const todos = sampleTodos();

    // Pass a function to expect(): expect calls it and catches the error.
    expect(() => createTodo(todos, { title: "   ", priority: "low" })).toThrow(
      "標題不可以是空白",
    );
  });

  test("標題超過 100 個字時丟出錯誤", () => {
    // repeat(101) builds a string of 101 characters.
    const longTitle = "字".repeat(101);

    expect(() => createTodo([], { title: longTitle, priority: "low" })).toThrow(
      "標題不可以超過 100 個字",
    );
  });
});

describe("findTodoById", () => {
  test("找得到時回傳那一筆", () => {
    const found = findTodoById(sampleTodos(), 2);

    expect(found).toEqual({
      id: 2,
      title: "寫作業",
      done: false,
      priority: "medium",
    });
  });

  test("找不到時回傳 undefined，不丟錯誤", () => {
    const found = findTodoById(sampleTodos(), 99);

    expect(found).toBeUndefined();
  });
});

describe("updateTodo", () => {
  test("只改指定的那一筆", () => {
    const result = updateTodo(sampleTodos(), 2, { done: true });

    expect(result).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
      { id: 2, title: "寫作業", done: true, priority: "medium" },
    ]);
  });

  test("不修改傳入的陣列", () => {
    const todos = sampleTodos();

    updateTodo(todos, 2, { done: true });

    expect(todos).toEqual(sampleTodos());
  });

  test("找不到 id 時丟出錯誤", () => {
    expect(() => updateTodo(sampleTodos(), 99, { done: true })).toThrow(
      "找不到 id 為 99 的待辦事項",
    );
  });

  test("新標題不合格時丟出錯誤", () => {
    expect(() => updateTodo(sampleTodos(), 1, { title: "" })).toThrow(
      "標題不可以是空白",
    );
  });
});

describe("deleteTodo", () => {
  test("回傳少一筆的新陣列", () => {
    const result = deleteTodo(sampleTodos(), 1);

    expect(result).toEqual([
      { id: 2, title: "寫作業", done: false, priority: "medium" },
    ]);
  });

  test("找不到 id 時丟出錯誤", () => {
    expect(() => deleteTodo(sampleTodos(), 99)).toThrow(
      "找不到 id 為 99 的待辦事項",
    );
  });
});
