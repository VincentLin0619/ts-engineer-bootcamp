import type { HeapObject, Mark, Scene, Slot } from "../types.ts";

type Fields = { id: string; title: string; done: string };

// One Todo instance card. `changed` marks the field that changed this step.
const instance = (
  objectId: string,
  fields: Fields,
  options: { mark?: Mark; changed?: keyof Fields } = {},
): HeapObject => {
  const slot = (name: string, key: keyof Fields): Slot => ({
    name,
    value: fields[key],
    ...(options.changed === key ? { mark: "active" as const } : {}),
  });
  return {
    id: objectId,
    label: "Todo 實例",
    slots: [slot("id", "id"), slot("#title", "title"), slot("#done", "done")],
    ...(options.mark ? { mark: options.mark } : {}),
  };
};

const milkOpen: Fields = { id: "1", title: '"買牛奶"', done: "false" };
const milkDone: Fields = { id: "1", title: '"買牛奶"', done: "true" };
const reportOpen: Fields = { id: "2", title: '"寫報告"', done: "false" };

const scene: Scene = {
  id: "day08-this-instances",
  title: "this：點號左邊的那個實例",
  summary:
    "兩個 Todo 實例各有自己的 #done，方法只有一份。看 milk.complete() 執行時 this 指向誰，改到的又是哪一個實例。",
  code: `class Todo {
  readonly id: number;
  #title: string;
  #done = false;

  constructor(id: number, title: string) {
    this.id = id;
    this.#title = validateTitle(title);
  }

  get done(): boolean {
    return this.#done;
  }

  complete(): void {
    this.#done = true;
  }
}

const milk = new Todo(1, "買牛奶");
const report = new Todo(2, "寫報告");
milk.complete();
console.log(milk.done, report.done);`,
  steps: [
    {
      line: 1,
      note: "`class Todo` 是藍圖：規定每個實例有 `id`、`#title`、`#done` 三個欄位，以及大家共用的 `done` 與 `complete()`。記憶體裡還沒有任何實例。",
      heap: { roots: [], objects: [] },
    },
    {
      line: 20,
      note: '`new Todo(1, "買牛奶")`：`new` 先在記憶體建立一個新實例。`#done` 照第 4 行的初始值放進 `false`，另外兩個欄位還沒有值，先是 `undefined`。',
      heap: {
        roots: [],
        objects: [
          instance(
            "milk",
            { id: "undefined", title: "undefined", done: "false" },
            { mark: "new" },
          ),
        ],
      },
    },
    {
      line: 6,
      note: "接著執行建構子。建構子裡的 `this`，就是剛剛建立的那個新實例。",
      heap: {
        roots: [{ name: "this", ref: "milk", mark: "active" }],
        objects: [
          instance("milk", {
            id: "undefined",
            title: "undefined",
            done: "false",
          }),
        ],
      },
    },
    {
      line: 7,
      note: "`this.id = id`：把 1 存進 `this` 指向的實例。",
      heap: {
        roots: [{ name: "this", ref: "milk", mark: "active" }],
        objects: [
          instance(
            "milk",
            { id: "1", title: "undefined", done: "false" },
            { changed: "id" },
          ),
        ],
      },
    },
    {
      line: 8,
      note: '`validateTitle` 檢查過標題，`this.#title` 存進 `"買牛奶"`。',
      heap: {
        roots: [{ name: "this", ref: "milk", mark: "active" }],
        objects: [instance("milk", milkOpen, { changed: "title" })],
      },
    },
    {
      line: 20,
      note: "建構子結束，`this` 跟著消失。`new` 的結果交給 `milk`，現在 `milk` 指向這個實例。",
      heap: {
        roots: [{ name: "milk", ref: "milk", mark: "new" }],
        objects: [instance("milk", milkOpen)],
      },
    },
    {
      line: 21,
      note: "同樣的步驟再跑一次：建立第二個實例，`report` 指向它。兩個實例各有一份自己的 `#title` 與 `#done`。",
      heap: {
        roots: [
          { name: "milk", ref: "milk" },
          { name: "report", ref: "report", mark: "new" },
        ],
        objects: [
          instance("milk", milkOpen),
          instance("report", reportOpen, { mark: "new" }),
        ],
      },
    },
    {
      line: 22,
      note: "呼叫 `milk.complete()`。`complete()` 只有一份，寫在類別裡，兩個實例共用。",
      heap: {
        roots: [
          { name: "milk", ref: "milk" },
          { name: "report", ref: "report" },
        ],
        objects: [instance("milk", milkOpen), instance("report", reportOpen)],
      },
      question: {
        prompt: "進入 `complete()` 之後，`this` 會指向哪一個？",
        choices: [
          "`milk` 指向的實例",
          "`report` 指向的實例",
          "`Todo` 類別本身",
        ],
        answer: 0,
        explain:
          "`this` 是呼叫時點號左邊的那個實例。`milk.complete()` 的點號左邊是 `milk`。",
      },
    },
    {
      line: 15,
      note: "進入 `complete()`。這次呼叫的 `this` 指向 `milk` 的實例，和 `milk` 是同一個。",
      heap: {
        roots: [
          { name: "milk", ref: "milk" },
          { name: "report", ref: "report" },
          { name: "this", ref: "milk", mark: "active" },
        ],
        objects: [
          instance("milk", milkOpen, { mark: "active" }),
          instance("report", reportOpen),
        ],
      },
    },
    {
      line: 16,
      note: "`this.#done = true` 改的是 `this` 指向的實例：milk 的 `#done` 變成 `true`。report 的 `#done` 沒有被碰到，仍然是 `false`。",
      heap: {
        roots: [
          { name: "milk", ref: "milk" },
          { name: "report", ref: "report" },
          { name: "this", ref: "milk", mark: "active" },
        ],
        objects: [
          instance("milk", milkDone, { mark: "active", changed: "done" }),
          instance("report", reportOpen),
        ],
      },
    },
    {
      line: 22,
      note: "`complete()` 結束，`this` 消失，回到主程式。",
      heap: {
        roots: [
          { name: "milk", ref: "milk" },
          { name: "report", ref: "report" },
        ],
        objects: [instance("milk", milkDone), instance("report", reportOpen)],
      },
    },
    {
      line: 23,
      note: "先讀 `milk.done`。沒有括號，但 `done` 是 getter，所以會執行 `get done()`。",
    },
    {
      line: 12,
      note: "執行 `get done()`，這次 `this` 指向 `milk`，回傳 milk 的 `#done`：`true`。",
      heap: {
        roots: [
          { name: "milk", ref: "milk" },
          { name: "report", ref: "report" },
          { name: "this", ref: "milk", mark: "active" },
        ],
        objects: [
          instance("milk", milkDone, { mark: "active" }),
          instance("report", reportOpen),
        ],
      },
    },
    {
      line: 12,
      note: "接著讀 `report.done`：同一個 getter 再執行一次，這次 `this` 指向 `report`，回傳 `false`。",
      heap: {
        roots: [
          { name: "milk", ref: "milk" },
          { name: "report", ref: "report" },
          { name: "this", ref: "report", mark: "active" },
        ],
        objects: [
          instance("milk", milkDone),
          instance("report", reportOpen, { mark: "active" }),
        ],
      },
    },
    {
      line: 23,
      note: "印出 `true false`。同一段 `this.#done`，由不同的實例呼叫，讀到的是各自的資料。",
      heap: {
        roots: [
          { name: "milk", ref: "milk" },
          { name: "report", ref: "report" },
        ],
        objects: [instance("milk", milkDone), instance("report", reportOpen)],
      },
      print: "true false",
    },
  ],
};

export default scene;
