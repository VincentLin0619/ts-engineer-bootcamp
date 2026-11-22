import { parseInteger, parseIntegerList } from "../inputs.ts";
import type { InputValues, Mark, Scene, Step } from "../types.ts";

const CODE_LINES = {
  call: 14,
  seen: 2,
  loop: 3,
  need: 4,
  lookup: 5,
  check: 6,
  found: 7,
  remember: 9,
  notFound: 11,
} as const;

function code(nums: number[], target: number): string {
  return `function twoSum(nums: readonly number[], target: number): number[] {
  const seen = new Map<number, number>(); // value -> index
  for (const [i, value] of nums.entries()) {
    const need = target - value;
    const j = seen.get(need);
    if (j !== undefined) {
      return [j, i];
    }
    seen.set(value, i);
  }
  return [];
}

console.log(twoSum([${nums.join(", ")}], ${target}));`;
}

function buildSteps(nums: number[], target: number): Step[] {
  const items = nums.map(String);
  const seen = new Map<number, number>();
  const entries = (): Array<[string, string]> =>
    [...seen].map(([value, index]) => [String(value), String(index)]);
  const marks = (
    current: number,
    extra: Record<number, Mark> = {},
  ): Record<number, Mark> => {
    const result: Record<number, Mark> = {};
    for (let k = 0; k < current; k++) result[k] = "dim";
    result[current] = "active";
    return { ...result, ...extra };
  };

  const steps: Step[] = [
    {
      line: CODE_LINES.call,
      note: `找出兩個數字，相加等於 ${target}，回傳它們的位置。`,
      arrays: [{ name: "nums", items }],
      vars: [{ name: "target", value: String(target) }],
    },
    {
      line: CODE_LINES.seen,
      note: "建立一個空的 Map，用來記住「看過的數字 → 它的位置」。",
      map: { name: "seen", entries: [] },
    },
  ];

  for (const [i, value] of nums.entries()) {
    const need = target - value;
    const vars = [
      { name: "target", value: String(target) },
      { name: "i", value: String(i) },
      { name: "value", value: String(value) },
    ];
    steps.push({
      line: CODE_LINES.loop,
      note: `第 ${i + 1} 圈：看位置 ${i} 的數字 ${value}。`,
      arrays: [{ name: "nums", items, marks: marks(i), pointers: { i } }],
      vars,
      map: { name: "seen", entries: entries() },
    });
    steps.push({
      line: CODE_LINES.need,
      note: `要湊到 ${target}，還差 ${target} - ${value} = ${need}。`,
      vars: [...vars, { name: "need", value: String(need), mark: "new" }],
    });
    const j = seen.get(need);
    const lookup: Step = {
      line: CODE_LINES.lookup,
      note:
        j === undefined
          ? `Map 裡沒有 ${need}，所以 j 是 undefined。`
          : `Map 裡有 ${need}，它在位置 ${j}。`,
      vars: [
        ...vars,
        { name: "need", value: String(need) },
        {
          name: "j",
          value: j === undefined ? "undefined" : String(j),
          mark: "new",
        },
      ],
      map: {
        name: "seen",
        entries: entries(),
        ...(j === undefined
          ? {}
          : { focus: String(need), focusMark: "found" as const }),
      },
    };
    if (i === 0) {
      lookup.question = {
        prompt: `seen 現在是空的，\`seen.get(${need})\` 會得到什麼？`,
        // Avoid two identical choices when `need` happens to be 0.
        choices: ["`undefined`", "`0`", need === 0 ? "`null`" : `\`${need}\``],
        answer: 0,
        explain: "Map 裡找不到這個 key 時，`get` 回傳 `undefined`。",
      };
    }
    steps.push(lookup);

    if (j !== undefined) {
      steps.push({
        line: CODE_LINES.found,
        note: `找到了：位置 ${j} 的 ${nums[j]} 加上位置 ${i} 的 ${value} 等於 ${target}。`,
        arrays: [
          {
            name: "nums",
            items,
            marks: { ...marks(i), [j]: "found", [i]: "found" },
            pointers: { j, i },
          },
        ],
      });
      steps.push({
        line: CODE_LINES.call,
        note: `回傳 [${j}, ${i}]。只看過每個數字一次就找到答案，不需要兩層迴圈。`,
        print: `[ ${j}, ${i} ]`,
      });
      return steps;
    }

    seen.set(value, i);
    steps.push({
      line: CODE_LINES.remember,
      note: `沒找到。把 ${value} 和它的位置 ${i} 記進 Map，之後的數字可能需要它。`,
      map: {
        name: "seen",
        entries: entries(),
        focus: String(value),
        focusMark: "new",
      },
    });
  }

  steps.push({
    line: CODE_LINES.notFound,
    note: `每個數字都看完了，沒有兩個數字相加等於 ${target}，回傳空陣列。`,
    arrays: [
      {
        name: "nums",
        items,
        marks: Object.fromEntries(items.map((_, k) => [k, "dim" as const])),
      },
    ],
  });
  steps.push({
    line: CODE_LINES.call,
    note: "印出回傳的空陣列。",
    print: "[]",
  });
  return steps;
}

const scene: Scene = {
  id: "leetcode-0001-two-sum",
  title: "Two Sum：用 Map 記住看過的數字",
  summary:
    "一邊往右走，一邊問 Map「需要的另一半出現過嗎？」。改改看輸入，觀察找到答案的時機。",
  inputs: [
    {
      name: "nums",
      label: "nums",
      value: "3, 8, 5, 1",
      hint: "2 到 10 個整數，用逗號分開",
    },
    { name: "target", label: "target", value: "13", hint: "一個整數" },
  ],
  code: (input) =>
    code(
      parseIntegerList(input.nums ?? "", { min: 2, max: 10 }),
      parseInteger(input.target ?? ""),
    ),
  steps: (input) =>
    buildSteps(
      parseIntegerList(input.nums ?? "", { min: 2, max: 10 }),
      parseInteger(input.target ?? ""),
    ),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { nums: "6, 6", target: "12" },
  { nums: "2, 4, 7", target: "20" },
  { nums: "6, 1", target: "12" },
  { nums: "-4, 10, 7, 3", target: "3" },
];
