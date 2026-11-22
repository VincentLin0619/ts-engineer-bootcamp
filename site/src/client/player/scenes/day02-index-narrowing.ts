import type { Scene, Slot } from "../types.ts";

const items = ["#1 買牛奶", "#2 寫作業", "#3 運動"];
const todosArray = { name: "todos：Todo[]", items };

const buyMilk = '{ id: 1, title: "買牛奶", … }';
const firstTodo = (type: string, mark?: Slot["mark"]): Slot => ({
  name: "firstTodo",
  value: buyMilk,
  type,
  ...(mark ? { mark } : {}),
});
const missingTodo = (type: string, mark?: Slot["mark"]): Slot => ({
  name: "missingTodo",
  value: "undefined",
  type,
  ...(mark ? { mark } : {}),
});

const scene: Scene = {
  id: "day02-index-narrowing",
  title: "用索引取值：Todo | undefined 與型別縮小",
  summary:
    "看 todos[0] 的型別為什麼多了 undefined，以及 if 檢查之後，型別在大括號裡外怎麼變化。",
  code: `const todos: Todo[] = [buyMilk, doHomework, goJogging];

const firstTodo = todos[0];
if (firstTodo !== undefined) {
  console.log(
    \`#\${firstTodo.id} \${firstTodo.title}（優先度：\${firstTodo.priority}，完成：\${firstTodo.done}）\`,
  );
}

const missingTodo = todos[10];
if (missingTodo === undefined) {
  console.log("索引 10 的位置是空的");
}`,
  steps: [
    {
      line: 1,
      note: "`todos` 的型別是 `Todo[]`：一個裝著 Todo 物件的陣列。現在有 3 筆，索引是 0、1、2。",
      arrays: [todosArray],
      vars: [],
    },
    {
      line: 3,
      note: "`todos[0]` 用索引取出第一筆，存進 `firstTodo`。",
      arrays: [
        { ...todosArray, marks: { 0: "active" }, pointers: { "[0]": 0 } },
      ],
      question: {
        prompt: "`firstTodo` 的型別是什麼？",
        choices: ["`Todo | undefined`", "`Todo`", "`Todo[]`"],
        answer: 0,
        explain:
          "TypeScript 不會去數陣列裡有幾筆，無法保證索引 0 一定有東西，所以用索引取出來的型別多了 `undefined`。",
      },
    },
    {
      line: 3,
      note: "執行時拿到的確實是「買牛奶」這筆，但型別是 `Todo | undefined`。TypeScript 只看型別，不知道這個位置有沒有東西。",
      vars: [firstTodo("Todo | undefined", "new")],
    },
    {
      line: 4,
      note: "`firstTodo !== undefined`：它是一個物件，不是 `undefined`，條件成立。",
      vars: [firstTodo("Todo | undefined", "compare")],
    },
    {
      line: 5,
      note: "進入大括號。`undefined` 已經被排除，`firstTodo` 的型別縮小成 `Todo`。",
      vars: [firstTodo("Todo", "active")],
    },
    {
      line: [5, 6, 7],
      note: "型別是 `Todo`，才能讀 `firstTodo.id`、`firstTodo.title` 這些屬性。樣板字串組出一行，印出來。",
      print: "#1 買牛奶（優先度：high，完成：false）",
    },
    {
      line: 8,
      note: "離開大括號，縮小就失效了，`firstTodo` 的型別又變回 `Todo | undefined`。",
      vars: [firstTodo("Todo | undefined")],
    },
    {
      line: 10,
      note: "`todos[10]`：陣列只有索引 0 到 2，索引 10 已經超出陣列的尾端。",
      arrays: [{ ...todosArray, pointers: { "[10]": 3 } }],
      question: {
        prompt: "執行 `todos[10]` 會發生什麼事？",
        choices: [
          "得到 `undefined`，程式繼續執行",
          "程式出錯，在這一行中斷",
          "得到最後一筆「運動」",
        ],
        answer: 0,
        explain:
          "索引超出範圍不會讓程式中斷，只會得到 `undefined`。這正是型別裡多了 `undefined` 的原因。",
      },
    },
    {
      line: 10,
      note: "這個位置是空的，`missingTodo` 得到 `undefined`。它的型別同樣是 `Todo | undefined`。",
      vars: [
        firstTodo("Todo | undefined"),
        missingTodo("Todo | undefined", "new"),
      ],
    },
    {
      line: 11,
      note: "用 `===` 檢查「是不是 `undefined`」。`missingTodo` 正是 `undefined`，條件成立。",
      vars: [
        firstTodo("Todo | undefined"),
        missingTodo("Todo | undefined", "compare"),
      ],
    },
    {
      line: 12,
      note: "進入大括號。這次留下的是 `undefined`，`missingTodo` 的型別縮小成 `undefined`。",
      vars: [firstTodo("Todo | undefined"), missingTodo("undefined", "active")],
    },
    {
      line: 12,
      note: "印出「索引 10 的位置是空的」。先檢查再使用，兩種情況都處理到了，程式不會因為空的位置出錯。",
      print: "索引 10 的位置是空的",
    },
  ],
};

export default scene;
