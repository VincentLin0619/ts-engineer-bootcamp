import { parseIntegerList } from "../inputs.ts";
import type { InputValues, MapPanel, Mark, Scene, Step } from "../types.ts";

const CODE_LINES = {
  call: 12,
  seen: 2,
  loop: 3,
  check: 4,
  found: 5,
  add: 7,
  notFound: 9,
} as const;

const SET_NAME = "seen（Set）";

function code(nums: number[]): string {
  return `function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const value of nums) {
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
  }
  return false;
}

console.log(containsDuplicate([${nums.join(", ")}]));`;
}

function parseNums(input: InputValues): number[] {
  return parseIntegerList(input.nums ?? "", { min: 1, max: 10 });
}

function buildSteps(nums: number[]): Step[] {
  const items = nums.map(String);
  const seen = new Set<number>();
  // Only for the display: where each value was first seen.
  const firstIndex = new Map<number, number>();
  const setPanel = (focus?: number, focusMark?: Mark): MapPanel => ({
    name: SET_NAME,
    kind: "set",
    entries: [...seen].map((value): [string, string] => [String(value), ""]),
    ...(focus === undefined ? {} : { focus: String(focus), focusMark }),
  });
  const marks = (current: number): Record<number, Mark> => {
    const result: Record<number, Mark> = {};
    for (let k = 0; k < current; k++) result[k] = "dim";
    result[current] = "active";
    return result;
  };

  const steps: Step[] = [
    {
      line: CODE_LINES.call,
      note: `呼叫 \`containsDuplicate\`：檢查這 ${nums.length} 個數字裡有沒有重複。`,
      arrays: [{ name: "nums", items }],
      vars: [],
    },
    {
      line: CODE_LINES.seen,
      note: "建立一個空的 Set，叫做 `seen`，用來記住看過的數字。",
      map: setPanel(),
    },
  ];

  for (const [k, value] of nums.entries()) {
    const valueSlot = { name: "value", value: String(value) };
    steps.push({
      line: CODE_LINES.loop,
      note: `第 ${k + 1} 圈：\`value\` 是位置 ${k} 的數字 ${value}。`,
      arrays: [
        { name: "nums", items, marks: marks(k), pointers: { value: k } },
      ],
      vars: [{ ...valueSlot, mark: "new" }],
      map: setPanel(),
      ...(k === 0
        ? {
            question: {
              prompt: `\`seen\` 現在是空的。\`seen.has(${value})\` 會得到什麼？`,
              choices: ["`false`", "`true`", "`undefined`"],
              answer: 0,
              explain:
                "`has` 只回答「在不在裡面」，結果一定是 `true` 或 `false`。Set 是空的，所以是 `false`。",
            },
          }
        : {}),
    });

    const first = firstIndex.get(value);
    if (first !== undefined) {
      steps.push({
        line: CODE_LINES.check,
        note: `\`seen.has(${value})\` 是 \`true\`：${value} 在位置 ${first} 已經出現過，找到重複了。`,
        arrays: [
          {
            name: "nums",
            items,
            marks: { ...marks(k), [first]: "found", [k]: "found" },
            pointers: { value: k },
          },
        ],
        vars: [valueSlot],
        map: setPanel(value, "found"),
        question: {
          prompt: `\`seen.has(${value})\` 是 \`true\`。接下來執行哪一行？`,
          choices: [
            "第 5 行 `return true`，函式立刻結束",
            `第 7 行 \`seen.add(${value})\`，再放一次`,
            "回到第 3 行，看下一個數字",
          ],
          answer: 0,
          explain:
            "`if` 的條件成立，就執行大括號裡的 `return true`。`return` 會讓函式立刻結束，迴圈也跟著停下來。",
        },
      });
      const rest = nums.length - k - 1;
      const skipped: Record<number, Mark> = {};
      for (let later = k + 1; later < nums.length; later++) {
        skipped[later] = "dim";
      }
      steps.push({
        line: CODE_LINES.found,
        note:
          rest > 0
            ? `\`return true\`：函式立刻結束。後面還有 ${rest} 個數字，都不用再看。`
            : "`return true`：函式結束，回傳 `true`。",
        arrays: [
          {
            name: "nums",
            items,
            marks: { ...marks(k), [first]: "found", [k]: "found", ...skipped },
            pointers: { value: k },
          },
        ],
      });
      steps.push({
        line: CODE_LINES.call,
        note: "印出回傳值 `true`：陣列裡有重複的數字。",
        print: "true",
      });
      return steps;
    }

    steps.push({
      line: CODE_LINES.check,
      note: `\`seen.has(${value})\` 是 \`false\`：前面沒有看過 ${value}，條件不成立。`,
      vars: [valueSlot],
    });
    seen.add(value);
    firstIndex.set(value, k);
    const legend = k === 0 ? "右邊的 Set 面板列出目前收集到的值。" : "";
    steps.push({
      line: CODE_LINES.add,
      note: `\`seen.add(${value})\`：把 ${value} 記進 Set，後面的數字會用到它。${legend}`,
      map: setPanel(value, "new"),
    });
  }

  const allDim: Record<number, Mark> = {};
  for (let k = 0; k < nums.length; k++) allDim[k] = "dim";
  steps.push({
    line: CODE_LINES.notFound,
    note: `${nums.length} 個數字都看過了，每次 \`has\` 都是 \`false\`，沒有重複，回傳 \`false\`。`,
    arrays: [{ name: "nums", items, marks: allDim }],
    vars: [],
    map: setPanel(),
  });
  steps.push({
    line: CODE_LINES.call,
    note: "印出回傳值 `false`：每個數字都只出現一次。",
    print: "false",
  });
  return steps;
}

const scene: Scene = {
  id: "leetcode-0217-contains-duplicate",
  title: "Contains Duplicate：用 Set 記住看過的數字",
  summary:
    "一邊往右走，一邊問 Set「這個數字看過嗎？」。改改看輸入，觀察找到重複之後，後面的數字是不是都不用看了。",
  inputs: [
    {
      name: "nums",
      label: "nums",
      value: "6, 2, 8, 2, 5",
      hint: "1 到 10 個整數，用逗號分開",
    },
  ],
  code: (input) => code(parseNums(input)),
  steps: (input) => buildSteps(parseNums(input)),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { nums: "7, 3, 10, 1" },
  { nums: "4" },
  { nums: "5, 5" },
  { nums: "1, 2, 3, 4, 5, 6, 7, 8, 9, 1" },
];
