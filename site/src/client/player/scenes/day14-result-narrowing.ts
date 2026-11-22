import type { Mark, Scene, Slot } from "../types.ts";

const RESULT_TYPE = "Result<number, string>";
const OK_TYPE = "{ ok: true; value: number }";
const ERROR_TYPE = "{ ok: false; error: string }";

const text = (value: string): Slot => ({
  name: "text",
  value: `"${value}"`,
  type: "string",
});

const result = (value: string, type: string, mark?: Mark): Slot => ({
  name: "result",
  value,
  type,
  ...(mark ? { mark } : {}),
});

const success = "{ ok: true, value: 42 }";
const abcFailure = '{ ok: false, error: "「abc」不是正整數" }';
const minusFailure = '{ ok: false, error: "「-3」不是正整數" }';

const scene: Scene = {
  id: "day14-result-narrowing",
  title: "Result：用 if (result.ok) 縮小型別",
  summary:
    "同一個 result 變數，檢查判別屬性 ok 之前是 Result<number, string>；進入 if 或 else 之後，型別欄跟著縮小成其中一種。",
  code: `type Result<TValue, TError> =
  { ok: true; value: TValue } | { ok: false; error: TError };

function parsePositiveInteger(text: string): Result<number, string> {
  const value = Number(text);
  if (!Number.isInteger(value) || value < 1) {
    return { ok: false, error: \`「\${text}」不是正整數\` };
  }
  return { ok: true, value };
}

for (const text of ["42", "abc", "-3"]) {
  const result = parsePositiveInteger(text);
  if (result.ok) {
    // Narrowed to { ok: true; value: number }
    console.log(\`成功：\${result.value}，加一是 \${result.value + 1}\`);
  } else {
    // Narrowed to { ok: false; error: string }
    console.log(\`失敗：\${result.error}\`);
  }
}`,
  steps: [
    {
      line: [1, 2],
      note: "`Result` 是 discriminated union：兩種形狀都有 `ok`，而且一個是 `true`、一個是 `false`。`ok` 就是判別屬性。",
      vars: [],
    },
    {
      line: 12,
      note: '迴圈第 1 圈：`text` 是 `"42"`。',
      vars: [text("42")],
    },
    {
      line: [9, 13],
      note: '`"42"` 是正整數，走第 9 行回傳成功的那一種。可是 TypeScript 只看回傳型別：`result` 的型別是 `Result<number, string>`，還不知道是哪一種。',
      vars: [text("42"), result(success, RESULT_TYPE, "new")],
    },
    {
      line: 14,
      note: "`if (result.ok)` 檢查判別屬性。這次 `ok` 是 `true`，條件成立。",
      vars: [text("42"), result(success, RESULT_TYPE)],
      question: {
        prompt: "進入 `if` 的大括號之後，`result` 的型別是什麼？",
        choices: [
          "`{ ok: true; value: number }`",
          "仍然是 `Result<number, string>`",
          "`number`",
        ],
        answer: 0,
        explain:
          "`ok` 是 `true` 的只有成功那一種，所以 TypeScript 在這個區塊裡把 `result` 縮小成它。`result` 本身仍是物件，不會變成 `number`。",
      },
    },
    {
      line: 15,
      note: "進入 `if` 區塊：`result` 縮小成 `{ ok: true; value: number }`，所以可以讀 `result.value`。",
      vars: [text("42"), result(success, OK_TYPE, "active")],
    },
    {
      line: 16,
      note: "`result.value` 是 `number`，可以直接加一。印出結果。",
      print: "成功：42，加一是 43",
    },
    {
      line: 12,
      note: '迴圈第 2 圈：`text` 換成 `"abc"`。上一圈的 `result` 已經不存在。',
      vars: [text("abc")],
    },
    {
      line: [7, 13],
      note: '`Number("abc")` 是 `NaN`，不是整數，走第 7 行回傳失敗的那一種。`result` 的型別又是 `Result<number, string>`。',
      vars: [text("abc"), result(abcFailure, RESULT_TYPE, "new")],
    },
    {
      line: 14,
      note: "`if (result.ok)`：這次 `ok` 是 `false`，條件不成立，往 `else` 走。",
      vars: [text("abc"), result(abcFailure, RESULT_TYPE)],
      question: {
        prompt: "在 `else` 的大括號裡，可以讀 `result.value` 嗎？",
        choices: [
          "不行：`result` 縮小成 `{ ok: false; error: string }`，沒有 `value`",
          "可以，只是讀到的值是 `undefined`",
        ],
        answer: 0,
        explain:
          "`else` 代表 `ok` 不是 `true`，只剩失敗那一種，它只有 `error`。寫 `result.value` 會是型別錯誤。",
      },
    },
    {
      line: 18,
      note: "進入 `else` 區塊：`result` 縮小成 `{ ok: false; error: string }`，可以讀 `result.error`。",
      vars: [text("abc"), result(abcFailure, ERROR_TYPE, "active")],
    },
    {
      line: 19,
      note: "印出失敗的原因。",
      print: "失敗：「abc」不是正整數",
    },
    {
      line: 12,
      note: '迴圈第 3 圈：`text` 換成 `"-3"`。',
      vars: [text("-3")],
    },
    {
      line: [7, 13],
      note: "`-3` 是整數，但小於 1，一樣走第 7 行回傳失敗。型別仍然是 `Result<number, string>`。",
      vars: [text("-3"), result(minusFailure, RESULT_TYPE, "new")],
    },
    {
      line: [14, 18],
      note: "`ok` 是 `false`，走 `else`，`result` 縮小成 `{ ok: false; error: string }`。",
      vars: [text("-3"), result(minusFailure, ERROR_TYPE, "active")],
    },
    {
      line: 19,
      note: "印出失敗的原因。陣列沒有下一個了，迴圈結束。",
      print: "失敗：「-3」不是正整數",
    },
  ],
};

export default scene;
