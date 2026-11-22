import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { loadExercise } from "../../support/load-exercise.ts";

const {
  completeTodo,
  createTodo,
  describeTodo,
  findTodoById,
  nextId,
  priorityLabel,
  updateTodo,
  validateTitle,
} = await loadExercise<typeof import("./03-todo-store.ts")>(
  import.meta.dir,
  "03-todo-store",
);

type Todo = import("./03-todo-store.ts").Todo;

// The text of the file being tested, to check what cannot be observed by
// calling functions: names, leftover `any`, `as` and suppression comments.
const source = await Bun.file(
  join(
    import.meta.dir,
    process.env.SOLUTIONS ? "../solutions" : ".",
    "03-todo-store.ts",
  ),
).text();
const lines = source.split("\n").map((line) => line.trim());
const codeLines = lines.filter((line) => !line.startsWith("//"));

// A function, so every test starts from its own fresh copy of the data.
function sampleTodos(): Todo[] {
  return [
    { id: 1, title: "買牛奶", done: false, priority: "high" },
    { id: 2, title: "寫作業", done: false, priority: "low" },
  ];
}

describe("練習 03（加練）：依規範修正 Todo store", () => {
  test("沒有留下 biome-ignore 或 @ts-expect-error 註解", () => {
    const suppressions = lines.filter(
      (line) =>
        line.startsWith("// biome-ignore") ||
        line.startsWith("// @ts-expect-error"),
    );
    expect(suppressions).toEqual([]);
  });

  test("程式裡沒有 any 型別、as 轉型與底線命名", () => {
    const looseLines = codeLines.filter(
      (line) =>
        /:\s*any\b/.test(line) ||
        line.includes(" as Todo") ||
        line.includes("max_title_length"),
    );
    expect(looseLines).toEqual([]);
  });

  test("validateTitle 回傳去掉前後空白的標題", () => {
    expect(validateTitle("  買牛奶 ")).toBe("買牛奶");
  });

  test("validateTitle 拒絕空白與太長的標題", () => {
    expect(() => validateTitle("   ")).toThrow("標題不可以是空白");
    expect(() => validateTitle("字".repeat(101))).toThrow(
      "標題不可以超過 100 個字",
    );
  });

  test("nextId 在空陣列時回傳 1", () => {
    expect(nextId([])).toBe(1);
  });

  test("nextId 回傳最大的 id 加 1", () => {
    expect(
      nextId([
        { id: 5, title: "繳電費", done: false, priority: "low" },
        { id: 2, title: "寫作業", done: false, priority: "low" },
      ]),
    ).toBe(6);
  });

  test("createTodo 回傳多一筆的新陣列，不修改傳入的陣列", () => {
    const todos = sampleTodos();
    const result = createTodo(todos, { title: "倒垃圾", priority: "medium" });
    expect(result).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
      { id: 2, title: "寫作業", done: false, priority: "low" },
      { id: 3, title: "倒垃圾", done: false, priority: "medium" },
    ]);
    expect(todos).toEqual(sampleTodos());
  });

  test("findTodoById 找不到時回傳 undefined", () => {
    expect(findTodoById(sampleTodos(), 2)).toEqual({
      id: 2,
      title: "寫作業",
      done: false,
      priority: "low",
    });
    expect(findTodoById(sampleTodos(), 99)).toBeUndefined();
  });

  test("priorityLabel 三種優先度都有名稱", () => {
    expect(priorityLabel("high")).toBe("高");
    expect(priorityLabel("medium")).toBe("中");
    expect(priorityLabel("low")).toBe("低");
  });

  test("describeTodo 描述一筆待辦事項", () => {
    expect(describeTodo(sampleTodos(), 1)).toBe("買牛奶（高）");
    expect(describeTodo(sampleTodos(), 2)).toBe("寫作業（低）");
  });

  test("describeTodo 找不到時回傳提示，不會當掉", () => {
    expect(describeTodo(sampleTodos(), 99)).toBe("找不到 id 為 99 的待辦事項");
  });

  test("updateTodo 只改指定的那一筆", () => {
    expect(updateTodo(sampleTodos(), 2, { priority: "high" })).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
      { id: 2, title: "寫作業", done: false, priority: "high" },
    ]);
  });

  test("updateTodo 找不到 id 時丟出錯誤", () => {
    expect(() => updateTodo(sampleTodos(), 99, { done: true })).toThrow(
      "找不到 id 為 99 的待辦事項",
    );
  });

  test("completeTodo 把待辦事項標成完成", () => {
    expect(completeTodo(sampleTodos(), 1)).toEqual([
      { id: 1, title: "買牛奶", done: true, priority: "high" },
      { id: 2, title: "寫作業", done: false, priority: "low" },
    ]);
  });
});
