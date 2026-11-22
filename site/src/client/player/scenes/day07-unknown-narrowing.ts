import type { Mark, Scene, Slot } from "../types.ts";

const value = (display: string, type: string, mark?: Mark): Slot => ({
  name: "value",
  value: display,
  type,
  ...(mark ? { mark } : {}),
});

const ERROR_VALUE = "Error「壞掉了」";

const scene: Scene = {
  id: "day07-unknown-narrowing",
  title: "unknown：先檢查，再使用",
  summary:
    "同一個 unknown 參數收到不同的值，看 typeof 與 instanceof 檢查之後，型別怎麼在各個分支裡變成精確的型別。",
  code: `function describeValue(value: unknown): string {
  if (typeof value === "string") {
    // Inside this branch \`value\` is a string.
    return \`文字，長度 \${value.length}\`;
  }
  if (typeof value === "number") {
    // Inside this branch \`value\` is a number.
    return \`數字，兩倍是 \${value * 2}\`;
  }
  if (value instanceof Error) {
    return \`錯誤物件，訊息是「\${value.message}」\`;
  }
  return "不認識的值";
}

console.log(describeValue(21));
console.log(describeValue(new Error("壞掉了")));
console.log(describeValue(true));`,
  steps: [
    {
      line: 16,
      note: "呼叫 `describeValue(21)`，把數字 21 傳進去。",
      vars: [],
      question: {
        prompt: "進到函式之後，參數 `value` 的型別是什麼？",
        choices: ["`unknown`", "`number`", "`21`"],
        answer: 0,
        explain:
          "型別看的是宣告。參數寫的是 `unknown`，不管傳進什麼值，進到函式時都是 `unknown`，要檢查之後才會變。",
      },
    },
    {
      line: 1,
      note: "`value` 放的是 21，但型別是 `unknown`：寫這個函式時不知道會收到什麼，所以還不能直接拿它運算或讀屬性。",
      vars: [value("21", "unknown", "new")],
    },
    {
      line: 2,
      note: '`typeof value` 是 `"number"`，不等於 `"string"`。條件不成立，跳過大括號，型別仍然是 `unknown`。',
      vars: [value("21", "unknown", "compare")],
    },
    {
      line: 6,
      note: '`typeof value === "number"` 成立，進入大括號。',
    },
    {
      line: 8,
      note: "在這個大括號裡，`value` 的型別縮小成 `number`，所以可以寫 `value * 2`。",
      vars: [value("21", "number", "active")],
    },
    {
      line: 16,
      note: "回傳「數字，兩倍是 42」並印出。函式結束，`value` 也跟著消失。",
      vars: [],
      print: "數字，兩倍是 42",
    },
    {
      line: 1,
      note: "第 17 行再次呼叫，這次傳入一個 `Error` 物件。進到函式時，`value` 的型別一樣是 `unknown`。",
      vars: [value(ERROR_VALUE, "unknown", "new")],
    },
    {
      line: [2, 6],
      note: "它不是文字，也不是數字，兩個 `typeof` 檢查都不成立，型別仍然是 `unknown`。",
      vars: [value(ERROR_VALUE, "unknown", "compare")],
    },
    {
      line: 10,
      note: "`value instanceof Error` 成立：它是 `Error` 物件，進入大括號。",
    },
    {
      line: 11,
      note: "大括號裡 `value` 縮小成 `Error`，所以可以讀 `value.message`。",
      vars: [value(ERROR_VALUE, "Error", "active")],
    },
    {
      line: 17,
      note: "回傳的文字被印出來，函式結束。",
      vars: [],
      print: "錯誤物件，訊息是「壞掉了」",
    },
    {
      line: 1,
      note: "第 18 行第三次呼叫，傳入 `true`。`value` 的型別一樣是 `unknown`。",
      vars: [value("true", "unknown", "new")],
    },
    {
      line: [2, 6, 10],
      note: "`true` 不是文字、不是數字，也不是 `Error`，三個條件都不成立。",
      vars: [value("true", "unknown", "compare")],
      question: {
        prompt: "三個檢查都不成立，接下來會發生什麼事？",
        choices: [
          "執行第 13 行，回傳「不認識的值」",
          "回傳 `undefined`",
          "程式出錯：`value` 一直沒有被縮小",
        ],
        answer: 0,
        explain:
          "三個 `if` 都跳過，程式往下走到最後的 `return`。`unknown` 只影響型別檢查，不會讓程式在執行時出錯。",
      },
    },
    {
      line: 13,
      note: "走到最後的 `return`。`value` 從頭到尾都沒有被縮小，型別仍然是 `unknown`；函式也沒有拿它運算或讀屬性，所以不會出錯。",
      vars: [value("true", "unknown")],
    },
    {
      line: 18,
      note: "印出「不認識的值」。`unknown` 逼你在使用前先檢查，檢查通過的分支裡才拿得到精確的型別。",
      vars: [],
      print: "不認識的值",
    },
  ],
};

export default scene;
