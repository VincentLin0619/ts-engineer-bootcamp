import type { ArrayPanel, Mark, Scene, Slot } from "../types.ts";

const OLD = "傳入的陣列 todos";
const NEW = "回傳的新陣列";
const oldItems = ["#2 寫作業", "#3 倒垃圾"];
const newItems = [...oldItems, "#4 繳電費"];

const old = (extra: Omit<ArrayPanel, "name" | "items"> = {}): ArrayPanel => ({
  name: OLD,
  items: oldItems,
  ...extra,
});

const input: Slot = {
  name: "input",
  value: '{ title: "繳電費", priority: "medium" }',
  type: "NewTodo",
};
const maxId = (value: string, mark?: Mark): Slot => ({
  name: "maxId",
  value,
  type: "number",
  ...(mark ? { mark } : {}),
});
const newTodo = (mark?: Mark): Slot => ({
  name: "todo",
  value: '{ id: 4, title: "繳電費", done: false, priority: "medium" }',
  type: "Todo",
  ...(mark ? { mark } : {}),
});

const scene: Scene = {
  id: "day05-crud-create",
  title: "createTodo：用最大的 id 加 1，放在新陣列的尾端",
  summary:
    "刪掉 #1 之後再新增一筆，看 nextId 怎麼找出最大的 id，createTodo 又怎麼用展開做出新陣列。",
  code: `function nextId(todos: readonly Todo[]): number {
  let maxId = 0;
  for (const todo of todos) {
    if (todo.id > maxId) {
      maxId = todo.id;
    }
  }
  return maxId + 1;
}

function createTodo(todos: readonly Todo[], input: NewTodo): Todo[] {
  const todo: Todo = {
    id: nextId(todos),
    title: input.title,
    done: false,
    priority: input.priority,
  };
  return [...todos, todo];
}

todos = createTodo(todos, { title: "繳電費", priority: "medium" });`,
  steps: [
    {
      line: 21,
      note: "#1 已經被刪掉，`todos` 只剩 #2 與 #3 兩筆。呼叫 `createTodo` 新增「繳電費」，只需要提供標題和優先度。",
      arrays: [old()],
      vars: [input],
    },
    {
      line: [12, 13],
      note: "組出新的 Todo 之前，先呼叫 `nextId(todos)` 算出它的 `id`。",
      question: {
        prompt: "新的這一筆，`id` 會是多少？",
        choices: ["`4`", "`3`：目前有 2 筆，再加 1", "`1`：#1 已經空出來了"],
        answer: 0,
        explain:
          "`nextId` 找的是目前最大的 `id`，也就是 3，再加 1。用筆數加 1 會算出 3，和現有的 #3 重複。",
      },
    },
    {
      line: 2,
      note: "進入 `nextId`。`maxId` 從 0 開始，用來記住目前看過最大的 `id`。",
      vars: [maxId("0", "new")],
    },
    {
      line: [3, 4],
      note: "第 1 圈：`todo` 是 #2。`2 > 0` 成立。",
      arrays: [old({ marks: { 0: "active" }, pointers: { todo: 0 } })],
      vars: [maxId("0", "compare")],
    },
    {
      line: 5,
      note: "`maxId` 更新成 2。",
      vars: [maxId("2", "active")],
    },
    {
      line: [3, 4],
      note: "第 2 圈：`todo` 是 #3。`3 > 2` 成立。",
      arrays: [
        old({ marks: { 0: "done", 1: "active" }, pointers: { todo: 1 } }),
      ],
      vars: [maxId("2", "compare")],
    },
    {
      line: 5,
      note: "`maxId` 更新成 3。",
      vars: [maxId("3", "active")],
    },
    {
      line: 8,
      note: "陣列看完了，最大的 `id` 是 3。回傳 `3 + 1`，也就是 4。",
      arrays: [old({ marks: { 0: "done", 1: "done" } })],
      vars: [maxId("3")],
    },
    {
      line: [12, 13, 14, 15, 16, 17],
      note: "回到 `createTodo`，組出新的 Todo：`id` 是 4，標題和優先度來自 `input`，`done` 固定從 `false` 開始。",
      arrays: [old()],
      vars: [input, newTodo("new")],
    },
    {
      line: 18,
      note: "`[...todos, todo]` 建立一個新陣列：先放進舊陣列的每一筆，再把新的一筆放在尾端。舊陣列仍然是 2 筆。",
      arrays: [old(), { name: NEW, items: newItems, marks: { 2: "new" } }],
      vars: [input, newTodo()],
    },
    {
      line: 21,
      note: "`createTodo` 結束。`todos =` 把新陣列接回變數，它才成為「目前的資料」；舊陣列沒有被修改，只是不再被使用。",
      arrays: [
        old({ marks: { 0: "dim", 1: "dim" } }),
        { name: NEW, items: newItems },
      ],
      vars: [],
    },
  ],
};

export default scene;
