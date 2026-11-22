import type { Scene, Slot } from "../types.ts";

const title: Slot = { name: "title", value: '"買牛奶"', type: "string" };
const minutes: Slot = {
  name: "estimatedMinutes",
  value: "15",
  type: "number",
};
const done: Slot = { name: "done", value: "false", type: "boolean" };
const basics: Slot[] = [title, minutes, done];

const scene: Scene = {
  id: "day01-variables",
  title: "變數與型別：const、let 與型別標註",
  summary:
    "看每個變數帶著什麼型別、let 的變數怎麼重新指派，以及 console.log 印出什麼。",
  code: `// Type annotation: \`name: type = value\`
const title: string = "買牛奶";
const estimatedMinutes: number = 15;
const done: boolean = false;
console.log(title, estimatedMinutes, done);

// Type inference: no annotation, TypeScript works out the type from the value.
let attempts = 0; // inferred as number
attempts = attempts + 1;
console.log(attempts);

// typeof reports the type of a value while the program runs.
console.log(typeof title);

// Template literal: backticks, with \${...} replaced by the value inside.
const summary = \`\${title}（預估 \${estimatedMinutes} 分鐘，完成：\${done}）\`;
console.log(summary);`,
  steps: [
    {
      line: 2,
      note: "`const title: string` 宣告一個名字 `title`，型別標註寫明它只能放文字。`const` 的名字之後不能改指向別的值。",
      vars: [{ ...title, mark: "new" }],
    },
    {
      line: 3,
      note: "`estimatedMinutes` 的型別是 `number`，放的是數字 15。",
      vars: [title, { ...minutes, mark: "new" }],
    },
    {
      line: 4,
      note: "`done` 的型別是 `boolean`，只能放 `true` 或 `false`。",
      vars: [title, minutes, { ...done, mark: "new" }],
    },
    {
      line: 5,
      note: "`console.log` 可以一次印出好幾個值，值與值之間用空白隔開。",
      vars: basics,
      print: "買牛奶 15 false",
    },
    {
      line: 8,
      note: "這一行沒有型別標註，TypeScript 從 `0` 推論出 `number`。用 `let` 是因為下一行要重新指派。",
      vars: [
        ...basics,
        { name: "attempts", value: "0", type: "number", mark: "new" },
      ],
    },
    {
      line: 9,
      note: "重新指派：這一行沒有寫 `let`，因為 `attempts` 已經存在。等號右邊要先算出來。",
      vars: [...basics, { name: "attempts", value: "0", type: "number" }],
      question: {
        prompt: "這一行執行完，`attempts` 是多少？",
        choices: [
          "`1`",
          "`0`，右邊用的是 `attempts` 自己，所以不會變",
          "錯誤：同一個名字不能同時出現在等號兩邊",
        ],
        answer: 0,
        explain:
          "先算右邊 `0 + 1` 得到 1，再把 1 放回左邊的 `attempts`。這是重新指派，不是數學等式。",
      },
    },
    {
      line: 9,
      note: "右邊算出 1，再放回 `attempts`。`let` 的變數可以這樣改指向新的值，型別仍然是 `number`。",
      vars: [
        ...basics,
        { name: "attempts", value: "1", type: "number", mark: "active" },
      ],
    },
    {
      line: 10,
      note: "印出 `attempts` 現在的值 1。",
      vars: [...basics, { name: "attempts", value: "1", type: "number" }],
      print: "1",
    },
    {
      line: 13,
      note: "`typeof` 在程式執行時查出一個值的型別。這裡查的是 `title`。",
      vars: [
        { ...title, mark: "active" },
        minutes,
        done,
        { name: "attempts", value: "1", type: "number" },
      ],
      question: {
        prompt: "`console.log(typeof title)` 會印出什麼？",
        choices: ["`string`", "`買牛奶`", "`title`"],
        answer: 0,
        explain:
          "`typeof` 不印出值本身，而是印出值的型別名稱。`title` 放的是文字，所以是 `string`。",
      },
    },
    {
      line: 13,
      note: "印出 `string`：`title` 放的是文字。",
      print: "string",
    },
    {
      line: 16,
      note: `樣板字串把每個 \`\${...}\` 換成變數的值，數字 15 和 \`false\` 也會變成文字，組出一段新文字。\`summary\` 的型別推論為 \`string\`。`,
      vars: [
        ...basics,
        { name: "attempts", value: "1", type: "number" },
        {
          name: "summary",
          value: '"買牛奶（預估 15 分鐘，完成：false）"',
          type: "string",
          mark: "new",
        },
      ],
    },
    {
      line: 17,
      note: "印出 `summary` 組好的文字。",
      vars: [
        ...basics,
        { name: "attempts", value: "1", type: "number" },
        {
          name: "summary",
          value: '"買牛奶（預估 15 分鐘，完成：false）"',
          type: "string",
        },
      ],
      print: "買牛奶（預估 15 分鐘，完成：false）",
    },
  ],
};

export default scene;
