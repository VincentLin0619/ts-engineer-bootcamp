import { parseIntegerList } from "../inputs.ts";
import type { ArrayPanel, InputValues, Mark, Scene, Step } from "../types.ts";

const LINE = {
  write: 2,
  loop: 3,
  check: 4,
  copy: 5,
  advance: 6,
  fillLoop: 9,
  fill: 10,
  call: 15,
  print: 16,
} as const;

function code(nums: readonly number[]): string {
  return `function moveZeroes(nums: number[]): void {
  let write = 0; // next position for a non-zero value
  for (const value of nums) {
    if (value !== 0) {
      nums[write] = value;
      write++;
    }
  }
  for (let i = write; i < nums.length; i++) {
    nums[i] = 0;
  }
}

const numbers = [${nums.join(", ")}];
moveZeroes(numbers);
console.log(numbers);`;
}

/** Marks positions 0 .. end - 1 as finished. */
function doneUpTo(end: number): Record<number, Mark> {
  const marks: Record<number, Mark> = {};
  for (let k = 0; k < end; k++) marks[k] = "done";
  return marks;
}

function buildSteps(input: readonly number[]): Step[] {
  // Runs the real algorithm on a copy, recording a step after each change.
  const nums = [...input];
  const n = nums.length;
  const panel = (
    marks: Record<number, Mark>,
    pointers: Record<string, number>,
  ): ArrayPanel[] => [
    { name: "nums", items: nums.map(String), marks, pointers },
  ];

  const steps: Step[] = [
    {
      line: LINE.call,
      note: "呼叫 `moveZeroes(numbers)`。參數 `nums` 和 `numbers` 指向**同一個陣列**，函式改 `nums`，`numbers` 也會跟著變。",
      arrays: panel({}, {}),
      vars: [],
    },
    {
      line: LINE.write,
      note: "`write` 是下一個非零數字要放的位置，從 0 開始。",
      arrays: panel({}, { write: 0 }),
      vars: [{ name: "write", value: "0" }],
    },
  ];

  let write = 0;
  let asked = false;
  for (const [read, value] of nums.entries()) {
    const vars = [
      { name: "write", value: String(write) },
      { name: "value", value: String(value), mark: "new" as const },
    ];
    if (value === 0) {
      steps.push({
        line: [LINE.loop, LINE.check],
        note: `讀到位置 ${read} 的 0。條件不成立，什麼都不做，\`write\` 停在 ${write}。`,
        arrays: panel(
          { ...doneUpTo(write), [read]: "dim" },
          { write, value: read },
        ),
        vars,
      });
      continue;
    }

    const step: Step = {
      line: [LINE.loop, LINE.check],
      note: `讀到位置 ${read} 的 ${value}，不是 0，要寫到 \`write\` 的位置 ${write}。`,
      arrays: panel(
        { ...doneUpTo(write), [read]: "active" },
        { write, value: read },
      ),
      vars,
    };
    if (!asked && read > write) {
      asked = true;
      step.question = {
        prompt: `\`nums[write] = value\` 執行之後，位置 ${read} 會變成什麼？`,
        choices: [`還是 ${value}`, "變成 0", "變成空的，陣列少一格"],
        answer: 0,
        explain: `賦值只改 \`nums[${write}]\` 這一格，位置 ${read} 的舊值會留著，之後才被覆蓋或補成 0。`,
      };
    }
    steps.push(step);

    nums[write] = value;
    write++;
    steps.push({
      line: [LINE.copy, LINE.advance],
      note:
        read === write - 1
          ? `位置 ${read} 前面沒有 0，把 ${value} 寫回原位，\`write\` 變成 ${write}。`
          : `把 ${value} 寫到位置 ${write - 1}，\`write\` 變成 ${write}。位置 ${read} 還留著舊的 ${value}。`,
      arrays: panel(
        { ...doneUpTo(write - 1), [write - 1]: "new" },
        { write, value: read },
      ),
      vars: [
        { name: "write", value: String(write), mark: "new" },
        { name: "value", value: String(value) },
      ],
    });
  }

  const fillStart: Step = {
    line: LINE.fillLoop,
    note:
      write < n
        ? `非零的數字都排到前面了。從位置 ${write} 開始都是用不到的舊值，進入第二個迴圈。`
        : `陣列裡沒有 0，\`write\` 等於長度 ${n}，第二個迴圈一次都不會執行。`,
    arrays: panel(doneUpTo(write), { write }),
    vars: [{ name: "write", value: String(write) }],
  };
  if (write > 0 && write < n - 1) {
    fillStart.question = {
      prompt: "第二個迴圈的 `i` 從幾開始？",
      choices: [String(write), "0", String(n - 1)],
      answer: 0,
      explain: `\`let i = write\`：位置 0 到 ${write - 1} 已經放好非零的數字，從 ${write} 開始補 0 就好。`,
    };
  }
  steps.push(fillStart);

  for (let i = write; i < n; i++) {
    nums[i] = 0;
    steps.push({
      line: LINE.fill,
      note: `i = ${i}：把位置 ${i} 設成 0。`,
      arrays: panel({ ...doneUpTo(i), [i]: "new" }, { write, i }),
      vars: [
        { name: "write", value: String(write) },
        { name: "i", value: String(i), mark: "new" },
      ],
    });
  }

  steps.push({
    line: LINE.print,
    note: "函式沒有回傳值，但 `numbers` 已經被改好了：0 全部在最後面，其他數字的順序沒有變。",
    arrays: panel(doneUpTo(n), {}),
    vars: [],
    print: `[ ${nums.join(", ")} ]`,
  });
  return steps;
}

function parseNums(input: InputValues): number[] {
  return parseIntegerList(input.nums ?? "", { min: 1, max: 10 });
}

const scene: Scene = {
  id: "leetcode-0283-move-zeroes",
  title: "Move Zeroes：讀的位置與寫的位置",
  summary:
    "讀的位置每圈往右一格，`write` 只在寫入非零數字時前進。改改看輸入，觀察陣列怎麼在原地被整理好。",
  inputs: [
    {
      name: "nums",
      label: "nums",
      value: "0, 4, 0, 0, 7, 2",
      hint: "1 到 10 個整數，用逗號分開",
    },
  ],
  code: (input) => code(parseNums(input)),
  steps: (input) => buildSteps(parseNums(input)),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { nums: "0, 0" },
  { nums: "5, -1" },
  { nums: "0" },
  { nums: "1, 0, 2, 0, 0, 3" },
];
