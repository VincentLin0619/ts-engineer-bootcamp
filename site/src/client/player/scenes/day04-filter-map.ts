import type { ArrayPanel, Scene } from "../types.ts";

const TODOS = "todos：Todo[]";
const FILTERED = "filter 的結果：Todo[]";
const MAPPED = "map 的結果：string[]";

const todoItems = ["#1 買牛奶 ·", "#2 寫作業 ✓", "#3 運動 ·"];
const openItems = ["#1 買牛奶 ·", "#3 運動 ·"];

const todos = (extra: Omit<ArrayPanel, "name" | "items"> = {}): ArrayPanel => ({
  name: TODOS,
  items: todoItems,
  ...extra,
});

const scene: Scene = {
  id: "day04-filter-map",
  title: "串接 filter 與 map：資料一步一步變成新陣列",
  summary:
    "看 filter 怎麼一筆一筆決定留下誰，map 再把留下來的每一筆換成標題，而 todos 本身從頭到尾都沒有變。",
  code: `const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "medium" },
  { id: 3, title: "運動", done: false, priority: "low" },
];

// Chain: filter returns an array, so map can be called on its result.
const openTitles = todos
  .filter((todo) => !todo.done)
  .map((todo) => todo.title);
console.log(openTitles);`,
  steps: [
    {
      line: [1, 2, 3, 4, 5],
      note: "`todos` 有三筆待辦事項，✓ 代表已完成。只有「寫作業」完成了。",
      arrays: [todos()],
    },
    {
      line: 9,
      note: "`filter` 建立一個新陣列，接著對 `todos` 的每一筆各呼叫一次回呼函式，回傳 `true` 的才放進去。",
      arrays: [todos(), { name: FILTERED, items: [] }],
    },
    {
      line: 9,
      note: "第 1 次呼叫：`todo` 是「買牛奶」。`!todo.done` 是 `!false`，回傳 `true`。",
      arrays: [
        todos({ marks: { 0: "active" }, pointers: { todo: 0 } }),
        { name: FILTERED, items: [] },
      ],
    },
    {
      line: 9,
      note: "回傳 `true`，這一筆留下，放進 filter 的結果。",
      arrays: [
        todos({ marks: { 0: "done" }, pointers: { todo: 0 } }),
        { name: FILTERED, items: openItems.slice(0, 1), marks: { 0: "new" } },
      ],
    },
    {
      line: 9,
      note: "第 2 次呼叫：`todo` 是「寫作業」。`!todo.done` 是 `!true`，回傳 `false`。",
      arrays: [
        todos({ marks: { 0: "done", 1: "active" }, pointers: { todo: 1 } }),
        { name: FILTERED, items: openItems.slice(0, 1) },
      ],
      question: {
        prompt: "回傳 `false`，這一筆「寫作業」會怎樣？",
        choices: [
          "不放進 filter 的結果，`todos` 裡的它保持原樣",
          "從 `todos` 裡被刪掉",
          "`filter` 在這裡停下來，不再看後面的「運動」",
        ],
        answer: 0,
        explain:
          "`filter` 只決定新陣列要放哪幾筆。它會看完每一筆，也不會改動原本的 `todos`。",
      },
    },
    {
      line: 9,
      note: "回傳 `false`，這一筆不放進結果。`todos` 裡的「寫作業」還在，只是沒被選中。",
      arrays: [
        todos({ marks: { 0: "done", 1: "dim" }, pointers: { todo: 1 } }),
        { name: FILTERED, items: openItems.slice(0, 1) },
      ],
    },
    {
      line: 9,
      note: "第 3 次呼叫：`todo` 是「運動」。`!todo.done` 是 `!false`，回傳 `true`。",
      arrays: [
        todos({
          marks: { 0: "done", 1: "dim", 2: "active" },
          pointers: { todo: 2 },
        }),
        { name: FILTERED, items: openItems.slice(0, 1) },
      ],
    },
    {
      line: 9,
      note: "留下，放進 filter 的結果。三筆都看完了，`filter` 回傳這個 2 筆的新陣列，型別仍然是 `Todo[]`。",
      arrays: [
        todos({
          marks: { 0: "done", 1: "dim", 2: "done" },
          pointers: { todo: 2 },
        }),
        { name: FILTERED, items: openItems, marks: { 1: "new" } },
      ],
    },
    {
      line: 10,
      note: "`.map(...)` 接在 filter 的結果後面呼叫，它同樣建立一個新陣列。",
      arrays: [
        todos(),
        { name: FILTERED, items: openItems },
        { name: MAPPED, items: [] },
      ],
      question: {
        prompt: "`map` 的回呼函式會被呼叫幾次？",
        choices: [
          "2 次：filter 的結果有 2 筆",
          "3 次：`todos` 有 3 筆",
          "1 次：整個陣列一次交給它處理",
        ],
        answer: 0,
        explain:
          "`map` 是對 filter 回傳的新陣列呼叫的。那個陣列只有 2 筆，所以回呼函式只跑 2 次。",
      },
    },
    {
      line: 10,
      note: '第 1 次呼叫：`todo` 是「買牛奶」，回傳 `todo.title`，新陣列多了 `"買牛奶"`。',
      arrays: [
        todos(),
        {
          name: FILTERED,
          items: openItems,
          marks: { 0: "active" },
          pointers: { todo: 0 },
        },
        { name: MAPPED, items: ['"買牛奶"'], marks: { 0: "new" } },
      ],
    },
    {
      line: 10,
      note: '第 2 次呼叫：`todo` 是「運動」，新陣列多了 `"運動"`。filter 的結果只有 2 筆，所以 map 只呼叫 2 次。',
      arrays: [
        todos(),
        {
          name: FILTERED,
          items: openItems,
          marks: { 0: "done", 1: "active" },
          pointers: { todo: 1 },
        },
        { name: MAPPED, items: ['"買牛奶"', '"運動"'], marks: { 1: "new" } },
      ],
    },
    {
      line: [8, 11],
      note: "`map` 回傳的新陣列存進 `openTitles`，印出來。筆數和 filter 的結果相同，型別變成 `string[]`；`todos` 仍然是原本的 3 筆。",
      arrays: [
        todos(),
        { name: FILTERED, items: openItems },
        { name: MAPPED, items: ['"買牛奶"', '"運動"'] },
      ],
      print: '[ "買牛奶", "運動" ]',
    },
  ],
};

export default scene;
