import type { HeapObject, Scene } from "../types.ts";

const todo = (done: string, mark?: HeapObject["mark"]): HeapObject => ({
  id: "t1",
  label: "Todo 物件",
  slots: [
    { name: "id", value: "1" },
    { name: "title", value: '"買牛奶"' },
    { name: "done", value: done },
  ],
  ...(mark ? { mark } : {}),
});

const copy = (done: string, mark?: HeapObject["mark"]): HeapObject => ({
  id: "t2",
  label: "Todo 物件（複製出來的）",
  slots: [
    { name: "id", value: "1" },
    { name: "title", value: '"買牛奶"' },
    { name: "done", value: done },
  ],
  ...(mark ? { mark } : {}),
});

const scene: Scene = {
  id: "day04-reference",
  title: "值與參考：兩個名字，同一個物件",
  summary:
    "物件不會被自動複製。看變數怎麼指向物件，以及展開 ... 怎麼做出真正的副本。",
  code: `const original: Todo = {
  id: 1,
  title: "買牛奶",
  done: false,
};
const sameTodo = original;
sameTodo.done = true;
console.log(original.done);

const copied = { ...original };
copied.done = false;
console.log(original.done, copied.done);
console.log(original === sameTodo, original === copied);`,
  steps: [
    {
      line: [1, 2, 3, 4, 5],
      note: "物件建立在記憶體裡。變數 `original` 存的不是物件本身，而是「物件在哪裡」，叫做參考（reference）。",
      heap: {
        roots: [{ name: "original", ref: "t1" }],
        objects: [todo("false", "new")],
      },
    },
    {
      line: 6,
      note: "`sameTodo = original` 複製的是參考，不是物件。現在兩個名字指向同一個物件。",
      heap: {
        roots: [
          { name: "original", ref: "t1" },
          { name: "sameTodo", ref: "t1", mark: "new" },
        ],
        objects: [todo("false")],
      },
    },
    {
      line: 7,
      note: "透過 `sameTodo` 修改 `done`。",
      question: {
        prompt: "這一行執行完，`original.done` 是什麼？",
        choices: ["`true`", "`false`"],
        answer: 0,
        explain: "只有一個物件。不管透過哪個名字修改，改到的都是同一個。",
      },
      heap: {
        roots: [
          { name: "original", ref: "t1" },
          { name: "sameTodo", ref: "t1", mark: "active" },
        ],
        objects: [todo("true", "active")],
      },
    },
    {
      line: 8,
      note: "`original.done` 也是 `true`，因為兩個名字看到的是同一個物件。",
      heap: {
        roots: [
          { name: "original", ref: "t1", mark: "active" },
          { name: "sameTodo", ref: "t1" },
        ],
        objects: [todo("true")],
      },
      print: "true",
    },
    {
      line: 10,
      note: "展開 `...original` 建立一個**新**物件，把每個屬性複製過去。`copied` 指向這個新物件。",
      heap: {
        roots: [
          { name: "original", ref: "t1" },
          { name: "sameTodo", ref: "t1" },
          { name: "copied", ref: "t2", mark: "new" },
        ],
        objects: [todo("true"), copy("true", "new")],
      },
    },
    {
      line: 11,
      note: "修改 `copied.done` 只影響新物件，原本的物件不受影響。",
      heap: {
        roots: [
          { name: "original", ref: "t1" },
          { name: "sameTodo", ref: "t1" },
          { name: "copied", ref: "t2", mark: "active" },
        ],
        objects: [todo("true"), copy("false", "active")],
      },
    },
    {
      line: 12,
      note: "兩個物件各自獨立：original 是 `true`，copied 是 `false`。",
      heap: {
        roots: [
          { name: "original", ref: "t1" },
          { name: "sameTodo", ref: "t1" },
          { name: "copied", ref: "t2" },
        ],
        objects: [todo("true"), copy("false")],
      },
      print: "true false",
    },
    {
      line: 13,
      note: "`===` 比較物件時問的是「是不是同一個物件」，不是「內容一不一樣」。所以結果是 `true false`。",
      print: "true false",
    },
  ],
};

export default scene;
