import type { HeapObject, Mark, Scene, Slot } from "../types.ts";

const withMark = <T extends object>(item: T, mark?: Mark): T =>
  mark ? { ...item, mark } : item;

const todo = (
  key: string,
  label: string,
  id: string,
  done: string,
  mark?: Mark,
  doneMark?: Mark,
): HeapObject =>
  withMark(
    {
      id: key,
      label,
      slots: [
        { name: "id", value: id },
        withMark({ name: "done", value: done }, doneMark),
      ],
    },
    mark,
  );

const t1 = (mark?: Mark) => todo("t1", "Todo「買牛奶」", "1", "false", mark);
const t2 = (mark?: Mark) => todo("t2", "Todo「寫作業」", "2", "false", mark);
const t3 = (mark?: Mark) => todo("t3", "Todo「倒垃圾」", "3", "false", mark);
const copy = (done: string, mark?: Mark, doneMark?: Mark) =>
  todo("t2b", "Todo「寫作業」（複製出來的）", "2", done, mark, doneMark);

/** An array object whose slots point at todo objects. */
const array = (
  key: string,
  label: string,
  refs: string[],
  slotMarks: Record<number, Mark> = {},
  mark?: Mark,
): HeapObject =>
  withMark(
    {
      id: key,
      label,
      slots: refs.map((ref, index) =>
        withMark({ name: String(index), ref }, slotMarks[index]),
      ),
    },
    mark,
  );

const OLD_REFS = ["t1", "t2", "t3"];
const NEW_REFS = ["t1", "t2b", "t3"];
const oldArray = (slotMarks?: Record<number, Mark>) =>
  array("old", "舊陣列", OLD_REFS, slotMarks);
const building = (count: number, slotMarks?: Record<number, Mark>) =>
  array("new", "新陣列（map 建立中）", NEW_REFS.slice(0, count), slotMarks);
const newArray = (slotMarks?: Record<number, Mark>) =>
  array("new", "新陣列", NEW_REFS, slotMarks);

const todosRoot: Slot = { name: "todos", ref: "old" };
const params: Slot[] = [
  { name: "id", value: "2" },
  { name: "changes", value: "{ done: true }" },
];
const during = (current: string): Slot[] => [
  todosRoot,
  ...params,
  { name: "todo", ref: current, mark: "active" },
];

const scene: Scene = {
  id: "day05-crud-update",
  title: "updateTodo：不改舊陣列，回傳新陣列",
  summary:
    "看 map 怎麼做出新陣列：沒改的 Todo 兩個陣列共用同一個物件，要改的那一筆則複製出一個新物件。",
  code: `function updateTodo(
  todos: readonly Todo[],
  id: number,
  changes: TodoChanges,
): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo));
}

const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: false, priority: "medium" },
  { id: 3, title: "倒垃圾", done: false, priority: "low" },
];

const updated = updateTodo(todos, 2, { done: true });

console.log(todos === updated);
console.log(todos[0] === updated[0]);
console.log(todos[1] === updated[1]);`,
  steps: [
    {
      line: [9, 10, 11, 12, 13],
      note: "陣列和三個 Todo 物件建立在記憶體裡。陣列的每一格存的是參考，指向各自的物件。（標題寫在卡片上方，`priority` 省略不畫）",
      heap: {
        roots: [todosRoot],
        objects: [oldArray(), t1(), t2(), t3()],
      },
    },
    {
      line: 15,
      note: "呼叫 `updateTodo(todos, 2, { done: true })`。參數 `todos` 拿到的是同一個陣列的參考，不是複本。",
      heap: {
        roots: [
          todosRoot,
          { name: "id", value: "2", mark: "new" },
          { name: "changes", value: "{ done: true }", mark: "new" },
        ],
        objects: [oldArray(), t1(), t2(), t3()],
      },
    },
    {
      line: 6,
      note: "`todos.map(...)` 建立一個新陣列，接著對舊陣列的每一筆各呼叫一次回呼函式。",
      heap: {
        roots: [todosRoot, ...params],
        objects: [
          oldArray(),
          array("new", "新陣列（map 建立中）", [], {}, "new"),
          t1(),
          t2(),
          t3(),
        ],
      },
    },
    {
      line: 6,
      note: "第 1 筆：`todo` 指向「買牛奶」。`todo.id === id` 是 `1 === 2`，不成立。",
      heap: {
        roots: during("t1"),
        objects: [oldArray(), building(0), t1("active"), t2(), t3()],
      },
    },
    {
      line: 6,
      note: "不成立就回傳 `todo` 本身：新陣列的第 0 格指向**同一個**「買牛奶」物件，沒有複製。",
      heap: {
        roots: during("t1"),
        objects: [
          oldArray(),
          building(1, { 0: "new" }),
          t1("active"),
          t2(),
          t3(),
        ],
      },
    },
    {
      line: 6,
      note: "第 2 筆：`todo` 指向「寫作業」。`todo.id === id` 是 `2 === 2`，成立。",
      heap: {
        roots: during("t2"),
        objects: [oldArray(), building(1), t1(), t2("active"), t3()],
      },
      question: {
        prompt: "條件成立之後，新陣列的第 1 格會指向哪裡？",
        choices: [
          "一個新建立的物件：複製「寫作業」，再把 `done` 改成 `true`",
          "舊的「寫作業」物件，它的 `done` 被改成 `true`",
          "舊的「寫作業」物件，`done` 維持 `false`",
        ],
        answer: 0,
        explain:
          "`{ ...todo, ...changes }` 會建立一個新物件。舊物件完全沒有被修改，舊陣列看到的仍然是 `done: false`。",
      },
    },
    {
      line: 6,
      note: "`{ ...todo, ...changes }` 先處理 `...todo`：建立一個新物件，把「寫作業」的屬性全部複製過去。",
      heap: {
        roots: during("t2"),
        objects: [
          oldArray(),
          building(1),
          t1(),
          t2("active"),
          copy("false", "new"),
          t3(),
        ],
      },
    },
    {
      line: 6,
      note: "接著 `...changes` 蓋上 `done: true`。被改的是新物件，舊的「寫作業」仍然是 `done: false`。",
      heap: {
        roots: during("t2"),
        objects: [
          oldArray(),
          building(1),
          t1(),
          t2("active"),
          copy("true", "new", "active"),
          t3(),
        ],
      },
    },
    {
      line: 6,
      note: "回呼函式回傳這個新物件，它放進新陣列的第 1 格。",
      heap: {
        roots: during("t2"),
        objects: [
          oldArray(),
          building(2, { 1: "new" }),
          t1(),
          t2("active"),
          copy("true"),
          t3(),
        ],
      },
    },
    {
      line: 6,
      note: "第 3 筆：`todo` 指向「倒垃圾」。`todo.id === id` 是 `3 === 2`，不成立。",
      heap: {
        roots: during("t3"),
        objects: [
          oldArray(),
          building(2),
          t1(),
          t2(),
          copy("true"),
          t3("active"),
        ],
      },
    },
    {
      line: 6,
      note: "原樣回傳 `todo`：新陣列的第 2 格指向同一個「倒垃圾」物件。",
      heap: {
        roots: during("t3"),
        objects: [
          oldArray(),
          building(3, { 2: "new" }),
          t1(),
          t2(),
          copy("true"),
          t3("active"),
        ],
      },
    },
    {
      line: 15,
      note: "`map` 回傳新陣列，`updateTodo` 結束，它的參數也跟著消失。`updated` 指向這個新陣列。",
      heap: {
        roots: [todosRoot, { name: "updated", ref: "new", mark: "new" }],
        objects: [oldArray(), newArray(), t1(), t2(), copy("true"), t3()],
      },
    },
    {
      line: 17,
      note: "`todos` 和 `updated` 指向兩個不同的陣列，所以 `===` 印出 `false`。",
      heap: {
        roots: [
          { ...todosRoot, mark: "compare" },
          { name: "updated", ref: "new", mark: "compare" },
        ],
        objects: [oldArray(), newArray(), t1(), t2(), copy("true"), t3()],
      },
      print: "false",
    },
    {
      line: 18,
      note: "比較兩個陣列的第 0 格。",
      heap: {
        roots: [todosRoot, { name: "updated", ref: "new" }],
        objects: [
          oldArray({ 0: "compare" }),
          newArray({ 0: "compare" }),
          t1(),
          t2(),
          copy("true"),
          t3(),
        ],
      },
      question: {
        prompt: "`todos[0] === updated[0]` 會印出什麼？",
        choices: ["`true`", "`false`"],
        answer: 0,
        explain:
          "兩個陣列的第 0 格指向同一個「買牛奶」物件。`===` 比的是「是不是同一個物件」。",
      },
    },
    {
      line: 18,
      note: "兩格都指向同一個「買牛奶」物件，印出 `true`。沒改的資料直接沿用，不必複製。",
      heap: {
        roots: [todosRoot, { name: "updated", ref: "new" }],
        objects: [
          oldArray({ 0: "compare" }),
          newArray({ 0: "compare" }),
          t1("compare"),
          t2(),
          copy("true"),
          t3(),
        ],
      },
      print: "true",
    },
    {
      line: 19,
      note: "第 1 格一個指向舊的「寫作業」，一個指向複製出來的新物件，所以印出 `false`。舊陣列和它指向的物件，從頭到尾都沒有被修改。",
      heap: {
        roots: [todosRoot, { name: "updated", ref: "new" }],
        objects: [
          oldArray({ 1: "compare" }),
          newArray({ 1: "compare" }),
          t1(),
          t2("compare"),
          copy("true", "compare"),
          t3(),
        ],
      },
      print: "false",
    },
  ],
};

export default scene;
