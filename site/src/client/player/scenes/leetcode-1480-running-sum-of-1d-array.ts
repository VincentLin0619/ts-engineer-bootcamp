import { parseIntegerList } from "../inputs.ts";
import type { InputValues, Mark, Question, Scene, Step } from "../types.ts";

const CODE_LINES = {
  call: 11,
  sums: 2,
  total: 3,
  loop: 4,
  add: 5,
  push: 6,
  done: 8,
} as const;

function code(nums: number[]): string {
  return `function runningSum(nums: number[]): number[] {
  const sums: number[] = [];
  let total = 0;
  for (const value of nums) {
    total += value;
    sums.push(total);
  }
  return sums;
}

console.log(runningSum([${nums.join(", ")}]));`;
}

function parseNums(input: InputValues): number[] {
  return parseIntegerList(input.nums ?? "", { min: 1, max: 8 });
}

/** Asks for the new total, if the three choices are all different. */
function addQuestion(total: number, value: number): Question | undefined {
  const choices = [total + value, value, total].map(String);
  if (new Set(choices).size !== choices.length) return undefined;
  return {
    prompt: `\`total\` 是 ${total}，\`value\` 是 ${value}。執行 \`total += value\` 之後，\`total\` 是多少？`,
    choices,
    answer: 0,
    explain:
      "`total += value` 等同 `total = total + value`：拿舊的 total 加上 value，再存回 total。",
  };
}

function buildSteps(nums: number[]): Step[] {
  const items = nums.map(String);
  const sums: number[] = [];
  const marks = (current: number): Record<number, Mark> => {
    const result: Record<number, Mark> = {};
    for (let k = 0; k < current; k++) result[k] = "done";
    result[current] = "active";
    return result;
  };
  const sumsPanel = (newIndex?: number) => ({
    name: "sums",
    items: sums.map(String),
    ...(newIndex === undefined
      ? {}
      : { marks: { [newIndex]: "new" as const } }),
  });

  const steps: Step[] = [
    {
      line: CODE_LINES.call,
      note: `呼叫 \`runningSum\`，\`nums\` 有 ${nums.length} 個數字。`,
      arrays: [{ name: "nums", items }],
      vars: [],
    },
    {
      line: CODE_LINES.sums,
      note: "`sums` 是空陣列，用來收集每個位置的答案。",
      arrays: [{ name: "nums", items }, sumsPanel()],
    },
    {
      line: CODE_LINES.total,
      note: "`total` 從 0 開始，代表「還沒加任何數字」。之後會改變，所以用 `let`。",
      vars: [{ name: "total", value: "0", type: "number", mark: "new" }],
    },
  ];

  let total = 0;
  let asked = false;
  for (const [k, value] of nums.entries()) {
    const before = total;
    const question = asked ? undefined : addQuestion(before, value);
    if (question) asked = true;
    steps.push({
      line: CODE_LINES.loop,
      note: `第 ${k + 1} 圈：\`value\` 是 \`nums[${k}]\`，也就是 ${value}。`,
      arrays: [
        { name: "nums", items, marks: marks(k), pointers: { value: k } },
        sumsPanel(),
      ],
      vars: [
        { name: "total", value: String(before), type: "number" },
        { name: "value", value: String(value), type: "number", mark: "new" },
      ],
      ...(question ? { question } : {}),
    });

    total += value;
    const shown = value < 0 ? `(${value})` : String(value);
    const meaning =
      k === 0
        ? "現在 total 就是第一個數字。"
        : `現在 total 是 \`nums[0]\` 到 \`nums[${k}]\` 的總和。`;
    steps.push({
      line: CODE_LINES.add,
      note: `\`total += value\`：${before} + ${shown} = ${total}。${meaning}`,
      vars: [
        { name: "total", value: String(total), type: "number", mark: "new" },
        { name: "value", value: String(value), type: "number" },
      ],
    });

    sums.push(total);
    steps.push({
      line: CODE_LINES.push,
      note: `把 ${total} 放進 \`sums\` 的尾端，它就是位置 ${k} 的答案。`,
      arrays: [
        { name: "nums", items, marks: marks(k), pointers: { value: k } },
        sumsPanel(k),
      ],
      vars: [
        { name: "total", value: String(total), type: "number" },
        { name: "value", value: String(value), type: "number" },
      ],
    });
  }

  const allDone: Record<number, Mark> = {};
  for (let k = 0; k < nums.length; k++) allDone[k] = "done";
  steps.push({
    line: CODE_LINES.done,
    note: `每個數字都加過一次，迴圈結束。回傳 \`sums\`，它和 \`nums\` 一樣有 ${nums.length} 個數字。`,
    arrays: [{ name: "nums", items, marks: allDone }, sumsPanel()],
    vars: [{ name: "total", value: String(total), type: "number" }],
  });
  steps.push({
    line: CODE_LINES.call,
    note: "印出回傳的陣列。每個數字只加了一次，就得到全部的答案。",
    print: `[ ${sums.join(", ")} ]`,
  });
  return steps;
}

const scene: Scene = {
  id: "leetcode-1480-running-sum-of-1d-array",
  title: "Running Sum：用 total 記住到目前為止的總和",
  summary:
    "一邊往右走，一邊把數字加進 total，再把 total 放進 sums。改改看輸入，確認每個數字只被加了一次。",
  inputs: [
    {
      name: "nums",
      label: "nums",
      value: "2, 5, -1, 4",
      hint: "1 到 8 個整數，用逗號分開",
    },
  ],
  code: (input) => code(parseNums(input)),
  steps: (input) => buildSteps(parseNums(input)),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { nums: "10" },
  { nums: "0, 0, 0" },
  { nums: "4, 0, 6, 3, 0" },
  { nums: "-3, 8, -5, 2, 10, -1, 4, 6" },
];
