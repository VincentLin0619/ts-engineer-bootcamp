import { parseInteger, parseIntegerList } from "../inputs.ts";
import {
  type InputValues,
  type Mark,
  type Scene,
  SceneInputError,
  type Slot,
  type Step,
} from "../types.ts";

const LINE = {
  range: [2, 3],
  loop: 4,
  mid: [5, 6],
  found: [10, 11],
  goRight: [13, 14],
  goLeft: [15, 16],
  notFound: 19,
  call: 22,
} as const;

function code(nums: readonly number[], target: number): string {
  return `function search(nums: readonly number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = nums[mid];
    if (value === undefined) {
      return -1; // never happens: mid is always between left and right
    }
    if (value === target) {
      return mid;
    }
    if (value < target) {
      left = mid + 1; // target can only be on the right
    } else {
      right = mid - 1; // target can only be on the left
    }
  }
  return -1;
}

console.log(search([${nums.join(", ")}], ${target}));`;
}

function buildSteps(nums: readonly number[], target: number): Step[] {
  const items = nums.map(String);
  // Everything outside left..right has been thrown away.
  const panel = (
    left: number,
    right: number,
    pointers: Record<string, number>,
    extra: Record<number, Mark> = {},
  ) => {
    const marks: Record<number, Mark> = {};
    for (let k = 0; k < nums.length; k++) {
      if (k < left || k > right) marks[k] = "dim";
    }
    return [{ name: "nums", items, marks: { ...marks, ...extra }, pointers }];
  };
  const slots = (
    values: Array<[name: string, value: number]>,
    changed: readonly string[] = [],
  ): Slot[] => [
    { name: "target", value: String(target) },
    ...values.map(([name, value]): Slot => {
      const slot: Slot = { name, value: String(value) };
      if (changed.includes(name)) slot.mark = "new";
      return slot;
    }),
  ];

  let left = 0;
  let right = nums.length - 1;
  const steps: Step[] = [
    {
      line: LINE.call,
      note: `在排好的陣列裡找 ${target}，回傳它的位置。`,
      arrays: [{ name: "nums", items }],
      vars: slots([]),
    },
    {
      line: [...LINE.range],
      note: `一開始答案可能在任何位置：\`left\` 是 0，\`right\` 是 ${right}。`,
      arrays: panel(left, right, { left, right }),
      vars: slots(
        [
          ["left", left],
          ["right", right],
        ],
        ["left", "right"],
      ),
    },
  ];

  let asked = false;
  let looked = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = nums[mid];
    if (value === undefined) break; // cannot happen, see the code panel
    looked++;
    const current: Array<[string, number]> = [
      ["left", left],
      ["right", right],
      ["mid", mid],
      ["value", value],
    ];
    const look: Step = {
      line: [...LINE.mid],
      note: `${left} ≤ ${right}，範圍裡還有數字。mid = ⌊(${left} + ${right}) / 2⌋ = ${mid}，\`nums[${mid}]\` 是 ${value}。`,
      arrays: panel(left, right, { left, mid, right }, { [mid]: "compare" }),
      vars: slots(current, ["mid", "value"]),
    };
    if (!asked) {
      asked = true;
      look.question = {
        prompt: `\`nums[${mid}]\` 是 ${value}，target 是 ${target}。下一步會怎麼做？`,
        choices: [
          "回傳 `mid`：找到了",
          "丟掉左半：`left = mid + 1`",
          "丟掉右半：`right = mid - 1`",
        ],
        answer: value === target ? 0 : value < target ? 1 : 2,
        explain:
          value === target
            ? "中間的數字剛好就是 target，直接回傳它的位置。"
            : value < target
              ? `${value} 比 ${target} 小，陣列由小到大排好，所以 mid 和它左邊的數字都太小，可以全部丟掉。`
              : `${value} 比 ${target} 大，陣列由小到大排好，所以 mid 和它右邊的數字都太大，可以全部丟掉。`,
      };
    }
    steps.push(look);

    if (value === target) {
      steps.push({
        line: [...LINE.found],
        note: `${value} 等於 target，找到了，回傳位置 ${mid}。`,
        arrays: panel(left, right, { mid }, { [mid]: "found" }),
        vars: slots(current),
      });
      steps.push({
        line: LINE.call,
        note: `印出 ${mid}。${nums.length} 個數字只看了 ${looked} 個。`,
        print: String(mid),
      });
      return steps;
    }

    if (value < target) {
      const dropped = left === mid ? `位置 ${mid}` : `位置 ${left}–${mid}`;
      left = mid + 1;
      steps.push({
        line: [...LINE.goRight],
        note: `${value} < ${target}，target 只可能在右邊。丟掉${dropped}，\`left\` 變成 ${left}。`,
        arrays: panel(left, right, { left, right }),
        vars: slots(
          [
            ["left", left],
            ["right", right],
            ["mid", mid],
            ["value", value],
          ],
          ["left"],
        ),
      });
    } else {
      const dropped = right === mid ? `位置 ${mid}` : `位置 ${mid}–${right}`;
      right = mid - 1;
      steps.push({
        line: [...LINE.goLeft],
        note: `${value} > ${target}，target 只可能在左邊。丟掉${dropped}，\`right\` 變成 ${right}。`,
        arrays: panel(left, right, { left, right }),
        vars: slots(
          [
            ["left", left],
            ["right", right],
            ["mid", mid],
            ["value", value],
          ],
          ["right"],
        ),
      });
    }
  }

  steps.push({
    line: LINE.loop,
    note: `\`left\`（${left}）比 \`right\`（${right}）大，範圍裡沒有任何數字了，迴圈結束。`,
    // mid and value only exist inside the loop body.
    vars: slots([
      ["left", left],
      ["right", right],
    ]),
  });
  steps.push({
    line: LINE.notFound,
    note: `${target} 不在陣列裡，回傳 -1。`,
  });
  steps.push({
    line: LINE.call,
    note: "印出 -1。",
    print: "-1",
  });
  return steps;
}

function parseNums(text: string): number[] {
  const nums = parseIntegerList(text, { min: 1, max: 12 });
  for (const [k, value] of nums.entries()) {
    const previous = nums[k - 1];
    if (previous !== undefined && previous >= value) {
      throw new SceneInputError(
        "陣列要由小到大排好，而且不能有重複的數字，例如 1, 4, 9, 16。",
      );
    }
  }
  return nums;
}

const scene: Scene = {
  id: "leetcode-0704-binary-search",
  title: "Binary Search：每次丟掉一半",
  summary:
    "`left` 和 `right` 圍出答案可能在的範圍，每看一次中間就丟掉一半。改改看 target，觀察找得到與找不到時各看了幾次。",
  inputs: [
    {
      name: "nums",
      label: "nums",
      value: "3, 9, 14, 20, 27, 31, 38, 45, 52, 60",
      hint: "1 到 12 個由小到大排好、不重複的整數，用逗號分開",
    },
    { name: "target", label: "target", value: "38", hint: "一個整數" },
  ],
  code: (input) =>
    code(parseNums(input.nums ?? ""), parseInteger(input.target ?? "")),
  steps: (input) =>
    buildSteps(parseNums(input.nums ?? ""), parseInteger(input.target ?? "")),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { nums: "3, 9, 14, 20, 27, 31, 38, 45, 52, 60", target: "10" },
  { nums: "5", target: "5" },
  { nums: "5", target: "2" },
  { nums: "-8, -2, 0, 7", target: "99" },
];
