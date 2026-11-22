import type { Scene } from "../types.ts";

const todos = [
  { title: "買牛奶", done: true },
  { title: "寫作業", done: false },
  { title: "倒垃圾", done: true },
];

const items = todos.map((todo) => `${todo.title} ${todo.done ? "✓" : "·"}`);

const scene: Scene = {
  id: "day03-count-done",
  title: "for...of 迴圈：數出完成了幾件事",
  summary: "看 countDone 怎麼一筆一筆檢查待辦事項，count 什麼時候加 1。",
  code: `function countDone(todos: Todo[]): number {
  let count = 0;
  for (const todo of todos) {
    if (todo.done) {
      count++;
    }
  }
  return count;
}

console.log(countDone(todos));`,
  steps: [
    {
      line: 11,
      note: "主程式呼叫 `countDone(todos)`，把三筆待辦事項交給它。",
      arrays: [{ name: "todos", items }],
      vars: [],
    },
    {
      line: 2,
      note: "`let count = 0`：計數器從 0 開始。之後會改變，所以用 `let`。",
      vars: [{ name: "count", value: "0", type: "number" }],
    },
    {
      line: 3,
      note: "迴圈第 1 圈：`todo` 是第 0 筆「買牛奶」。",
      arrays: [
        { name: "todos", items, marks: { 0: "active" }, pointers: { todo: 0 } },
      ],
      vars: [
        { name: "count", value: "0", type: "number" },
        { name: "todo", value: "買牛奶（done: true）" },
      ],
    },
    {
      line: 4,
      note: "`todo.done` 是 `true`，條件成立，進入大括號。",
      question: {
        prompt: "條件成立之後，下一個執行的是哪一行？",
        choices: [
          "第 5 行 `count++`",
          "第 8 行 `return count`",
          "回到第 3 行拿下一筆",
        ],
        answer: 0,
        explain: "`if` 的條件成立，就執行它大括號裡的程式，也就是第 5 行。",
      },
    },
    {
      line: 5,
      note: "`count++` 把 count 加 1，變成 1。",
      vars: [
        { name: "count", value: "1", type: "number" },
        { name: "todo", value: "買牛奶（done: true）" },
      ],
      arrays: [
        { name: "todos", items, marks: { 0: "done" }, pointers: { todo: 0 } },
      ],
    },
    {
      line: 3,
      note: "迴圈第 2 圈：`todo` 換成第 1 筆「寫作業」。",
      arrays: [
        {
          name: "todos",
          items,
          marks: { 0: "done", 1: "active" },
          pointers: { todo: 1 },
        },
      ],
      vars: [
        { name: "count", value: "1", type: "number" },
        { name: "todo", value: "寫作業（done: false）" },
      ],
    },
    {
      line: 4,
      note: "`todo.done` 是 `false`，條件不成立，跳過大括號，count 不變。",
      arrays: [
        {
          name: "todos",
          items,
          marks: { 0: "done", 1: "dim" },
          pointers: { todo: 1 },
        },
      ],
    },
    {
      line: 3,
      note: "迴圈第 3 圈：`todo` 換成第 2 筆「倒垃圾」。",
      arrays: [
        {
          name: "todos",
          items,
          marks: { 0: "done", 1: "dim", 2: "active" },
          pointers: { todo: 2 },
        },
      ],
      vars: [
        { name: "count", value: "1", type: "number" },
        { name: "todo", value: "倒垃圾（done: true）" },
      ],
    },
    {
      line: [4, 5],
      note: "`todo.done` 是 `true`，`count++` 讓 count 變成 2。",
      arrays: [
        {
          name: "todos",
          items,
          marks: { 0: "done", 1: "dim", 2: "done" },
          pointers: { todo: 2 },
        },
      ],
      vars: [
        { name: "count", value: "2", type: "number" },
        { name: "todo", value: "倒垃圾（done: true）" },
      ],
    },
    {
      line: 8,
      note: "陣列沒有下一筆了，迴圈結束。`return count` 把 2 交回給呼叫的地方。",
      arrays: [
        { name: "todos", items, marks: { 0: "done", 1: "dim", 2: "done" } },
      ],
      vars: [{ name: "count", value: "2", type: "number" }],
    },
    {
      line: 11,
      note: "`countDone(todos)` 變成回傳值 2，`console.log` 把它印出來。",
      print: "2",
    },
  ],
};

export default scene;
