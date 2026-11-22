import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { applyCommand, parseCommand } = await loadExercise<
  typeof import("./03-todo-commands.ts")
>(import.meta.dir, "03-todo-commands");

type Todo = import("./03-todo-commands.ts").Todo;

// A function, so every test starts from its own fresh copy of the data.
function sampleTodos(): Todo[] {
  return [
    { id: 1, title: "買牛奶", done: false, priority: "high" },
    { id: 2, title: "寫作業", done: false, priority: "medium" },
  ];
}

describe("練習 03（加練）：Todo 指令", () => {
  test("parseCommand 拆出指令名稱與參數", () => {
    expect(parseCommand("add 買牛奶")).toEqual({
      name: "add",
      argument: "買牛奶",
    });
    expect(parseCommand("done 2")).toEqual({ name: "done", argument: "2" });
  });

  test("parseCommand 只在第一個空白切開", () => {
    expect(parseCommand("add 買牛奶 和雞蛋")).toEqual({
      name: "add",
      argument: "買牛奶 和雞蛋",
    });
  });

  test("parseCommand 去掉前後的空白", () => {
    expect(parseCommand("  list  ")).toEqual({ name: "list", argument: "" });
    expect(parseCommand("  add   買牛奶  ")).toEqual({
      name: "add",
      argument: "買牛奶",
    });
  });

  test("add 新增一筆 priority 為 medium 的待辦事項", () => {
    expect(applyCommand([], "add 買牛奶")).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "medium" },
    ]);
    expect(applyCommand(sampleTodos(), "add 倒垃圾")).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
      { id: 2, title: "寫作業", done: false, priority: "medium" },
      { id: 3, title: "倒垃圾", done: false, priority: "medium" },
    ]);
  });

  test("add 沒有標題時內容不變", () => {
    expect(applyCommand(sampleTodos(), "add")).toEqual(sampleTodos());
    expect(applyCommand(sampleTodos(), "add   ")).toEqual(sampleTodos());
  });

  test("done 把指定的待辦事項標成完成", () => {
    expect(applyCommand(sampleTodos(), "done 2")).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
      { id: 2, title: "寫作業", done: true, priority: "medium" },
    ]);
  });

  test("rm 刪除指定的待辦事項", () => {
    expect(applyCommand(sampleTodos(), "rm 1")).toEqual([
      { id: 2, title: "寫作業", done: false, priority: "medium" },
    ]);
  });

  test("id 不存在或不是數字時內容不變", () => {
    expect(applyCommand(sampleTodos(), "done 99")).toEqual(sampleTodos());
    expect(applyCommand(sampleTodos(), "rm abc")).toEqual(sampleTodos());
  });

  test("其他指令內容不變", () => {
    expect(applyCommand(sampleTodos(), "list")).toEqual(sampleTodos());
    expect(applyCommand(sampleTodos(), "hello world")).toEqual(sampleTodos());
  });

  test("applyCommand 不修改傳入的陣列", () => {
    const todos = sampleTodos();
    applyCommand(todos, "add 倒垃圾");
    applyCommand(todos, "done 1");
    applyCommand(todos, "rm 2");
    expect(todos).toEqual(sampleTodos());
  });

  test("連續套用多個指令", () => {
    let todos: Todo[] = [];
    const lines = ["add 買牛奶", "add 寫作業", "done 1", "rm 2", "add 倒垃圾"];
    for (const line of lines) {
      todos = applyCommand(todos, line);
    }
    expect(todos).toEqual([
      { id: 1, title: "買牛奶", done: true, priority: "medium" },
      { id: 2, title: "倒垃圾", done: false, priority: "medium" },
    ]);
  });
});
