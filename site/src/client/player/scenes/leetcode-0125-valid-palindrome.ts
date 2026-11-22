import { parseText } from "../inputs.ts";
import type {
  InputValues,
  Mark,
  Question,
  Scene,
  Slot,
  Step,
} from "../types.ts";

const LINE = {
  init: [6, 7],
  loop: 8,
  read: [9, 10],
  skipLeft: [11, 12],
  skipRight: [13, 14],
  mismatch: [15, 16],
  match: [18, 19],
  done: 22,
  call: 25,
} as const;

type Action = "skipLeft" | "skipRight" | "mismatch" | "match";

function code(s: string): string {
  return `function isLowercaseOrDigit(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
}

function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    const a = s.charAt(left).toLowerCase();
    const b = s.charAt(right).toLowerCase();
    if (!isLowercaseOrDigit(a)) {
      left++;
    } else if (!isLowercaseOrDigit(b)) {
      right--;
    } else if (a !== b) {
      return false;
    } else {
      left++;
      right--;
    }
  }
  return true;
}

console.log(isPalindrome(${JSON.stringify(s)}));`;
}

function isLowercaseOrDigit(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
}

/** How a character is shown in a cell: spaces become visible. */
function cell(ch: string): string {
  return ch === " " ? "␣" : ch;
}

function quoted(ch: string): string {
  return JSON.stringify(ch);
}

/**
 * How a character is named in a note, written straight after 是:
 * `a 是空白` or `a 是 "t"`.
 */
function spoken(ch: string): string {
  return ch === " " ? "空白" : ` ${quoted(ch)}`;
}

/** Variable slots; the names in `changed` are marked as new. */
function slots(
  values: Array<[name: string, value: string]>,
  changed: readonly string[] = [],
): Slot[] {
  return values.map(([name, value]) =>
    changed.includes(name) ? { name, value, mark: "new" } : { name, value },
  );
}

const CHOICES = [
  "`left++`：跳過左邊的字",
  "`right--`：跳過右邊的字",
  "回傳 `false`",
  "`left++` 和 `right--`：兩邊一起往中間走",
];

function actionQuestion(action: Action, a: string, b: string): Question {
  const answers: Record<Action, { answer: number; explain: string }> = {
    skipLeft: {
      answer: 0,
      explain: `a 是${spoken(a)}，不是字母或數字，不列入比較，所以先跳過左邊。`,
    },
    skipRight: {
      answer: 1,
      explain: `a 是字母或數字，但 b 是${spoken(b)}，不列入比較，所以跳過右邊。`,
    },
    mismatch: {
      answer: 2,
      explain: `兩個都是字母或數字，但 ${quoted(a)} 和 ${quoted(b)} 不一樣，馬上就知道不是回文。`,
    },
    match: {
      answer: 3,
      explain: "兩個都是字母或數字而且一樣，這一對檢查完了，兩邊一起往中間走。",
    },
  };
  return {
    prompt: "下一步會執行哪一個分支？",
    choices: CHOICES,
    ...answers[action],
  };
}

function buildSteps(s: string): Step[] {
  const items = s.split("").map(cell);
  const settled: Record<number, Mark> = {};
  const panel = (
    extra: Record<number, Mark>,
    pointers: Record<string, number>,
  ) => [{ name: "s", items, marks: { ...settled, ...extra }, pointers }];
  const position = (left: number, right: number): Slot[] =>
    slots([
      ["left", String(left)],
      ["right", String(right)],
    ]);

  const steps: Step[] = [
    {
      line: LINE.call,
      note: `判斷 ${quoted(s)} 是不是回文。${s.includes(" ") ? "格子裡的 ␣ 代表空白。" : ""}`,
      arrays: panel({}, {}),
      vars: [],
    },
  ];

  let left = 0;
  let right = s.length - 1;
  steps.push({
    line: [...LINE.init],
    note: `\`left\` 從最左邊的 0 開始，\`right\` 從最右邊的 ${right} 開始。`,
    arrays: panel({}, { left, right }),
    vars: position(left, right),
  });

  let asked = false;
  while (left < right) {
    const a = s.charAt(left).toLowerCase();
    const b = s.charAt(right).toLowerCase();
    const action: Action = !isLowercaseOrDigit(a)
      ? "skipLeft"
      : !isLowercaseOrDigit(b)
        ? "skipRight"
        : a !== b
          ? "mismatch"
          : "match";

    // For example `a 是 "t"（由 "T" 轉成小寫）`.
    const side = (original: string, lowered: string): string =>
      original === lowered
        ? spoken(lowered)
        : `${spoken(lowered)}（由 ${quoted(original)} 轉成小寫）`;
    const vars = (changed: readonly string[]): Slot[] =>
      slots(
        [
          ["left", String(left)],
          ["right", String(right)],
          ["a", quoted(a)],
          ["b", quoted(b)],
        ],
        changed,
      );
    const read: Step = {
      line: [...LINE.read],
      note: `${left} < ${right}，繼續。讀出兩端：a 是${side(s.charAt(left), a)}，b 是${side(s.charAt(right), b)}。`,
      arrays: panel({ [left]: "compare", [right]: "compare" }, { left, right }),
      vars: vars(["a", "b"]),
    };
    if (!asked) {
      asked = true;
      read.question = actionQuestion(action, a, b);
    }
    steps.push(read);

    if (action === "skipLeft") {
      settled[left] = "dim";
      left++;
      steps.push({
        line: [...LINE.skipLeft],
        note: `a 是${spoken(a)}，不是字母或數字，跳過它：\`left\` 往右一格，變成 ${left}。`,
        arrays: panel({}, { left, right }),
        vars: vars(["left"]),
      });
    } else if (action === "skipRight") {
      settled[right] = "dim";
      right--;
      steps.push({
        line: [...LINE.skipRight],
        note: `b 是${spoken(b)}，不是字母或數字，跳過它：\`right\` 往左一格，變成 ${right}。`,
        arrays: panel({}, { left, right }),
        vars: vars(["right"]),
      });
    } else if (action === "mismatch") {
      steps.push({
        line: [...LINE.mismatch],
        note: `兩個都是字母或數字，但 ${quoted(a)} 和 ${quoted(b)} 不一樣，所以不是回文，回傳 \`false\`。`,
        arrays: panel({ [left]: "error", [right]: "error" }, { left, right }),
        vars: vars([]),
      });
      steps.push({
        line: LINE.call,
        note: "印出 `false`。後面的字都不用再看了。",
        print: "false",
      });
      return steps;
    } else {
      settled[left] = "done";
      settled[right] = "done";
      left++;
      right--;
      steps.push({
        line: [...LINE.match],
        note: `${quoted(a)} 和 ${quoted(b)} 一樣，這一對沒問題。\`left\` 往右、\`right\` 往左，各走一格。`,
        arrays: panel({}, { left, right }),
        vars: vars(["left", "right"]),
      });
    }
  }

  steps.push({
    line: LINE.loop,
    note:
      left === right
        ? `\`left\` 和 \`right\` 都是 ${left}，\`left < right\` 不成立，迴圈結束。中間剩下的那個字只會和自己比，不用比。`
        : `\`left\`（${left}）已經不小於 \`right\`（${right}），\`left < right\` 不成立，迴圈結束。`,
    arrays: panel({}, { left, right }),
    vars: position(left, right),
  });
  steps.push({
    line: LINE.done,
    note: "每一對都檢查過，沒有發現不一樣的字，回傳 `true`。",
  });
  steps.push({
    line: LINE.call,
    note: `印出 \`true\`：${quoted(s)} 是回文。`,
    print: "true",
  });
  return steps;
}

function parseInput(input: InputValues): string {
  return parseText(input.s ?? "", { max: 16, label: "字串" });
}

const scene: Scene = {
  id: "leetcode-0125-valid-palindrome",
  title: "Valid Palindrome：從兩端往中間比",
  summary:
    "`left` 和 `right` 從兩端往中間走，空白與標點直接跳過，遇到不一樣的字就停下來。改改看輸入，觀察每一圈走的是哪個分支。",
  inputs: [
    {
      name: "s",
      label: "s",
      value: "Top spot!",
      hint: "1 到 16 個字元，可以有空白與標點",
    },
  ],
  code: (input) => code(parseInput(input)),
  steps: (input) => buildSteps(parseInput(input)),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { s: "Step on a pet" },
  { s: "?!" },
  { s: "x" },
  { s: "No, on!" },
];
