import { parseInteger } from "../inputs.ts";
import {
  type InputValues,
  type Scene,
  SceneInputError,
  type Slot,
  type Step,
} from "../types.ts";

const MAX_N = 15;

const CODE_LINES = {
  call: 17,
  answer: 2,
  loop: 3,
  both: 4,
  pushBoth: 5,
  three: 6,
  pushThree: 7,
  five: 8,
  pushFive: 9,
  other: 10,
  pushOther: 11,
  done: 14,
} as const;

/** Which branch of the if / else chain runs. */
type Kind = "both" | "three" | "five" | "other";

function code(n: number): string {
  return `function fizzBuzz(n: number): string[] {
  const answer: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      answer.push("FizzBuzz");
    } else if (i % 3 === 0) {
      answer.push("Fizz");
    } else if (i % 5 === 0) {
      answer.push("Buzz");
    } else {
      answer.push(String(i));
    }
  }
  return answer;
}

console.log(fizzBuzz(${n}));`;
}

function parseN(input: InputValues): number {
  const n = parseInteger(input.n ?? "", "n");
  if (n < 1 || n > MAX_N) {
    throw new SceneInputError(`n 請填 1 到 ${MAX_N} 之間的整數。`);
  }
  return n;
}

/** Same branches as the code panel, in the same order. */
function classify(i: number): Kind {
  if (i % 3 === 0 && i % 5 === 0) return "both";
  if (i % 3 === 0) return "three";
  if (i % 5 === 0) return "five";
  return "other";
}

/** The string each branch pushes. */
function word(i: number, kind: Kind): string {
  if (kind === "both") return "FizzBuzz";
  if (kind === "three") return "Fizz";
  if (kind === "five") return "Buzz";
  return String(i);
}

/** The lines checked on the way to the branch that runs. */
const PATHS: Record<Kind, number[]> = {
  both: [CODE_LINES.both, CODE_LINES.pushBoth],
  three: [CODE_LINES.both, CODE_LINES.three, CODE_LINES.pushThree],
  five: [
    CODE_LINES.both,
    CODE_LINES.three,
    CODE_LINES.five,
    CODE_LINES.pushFive,
  ],
  other: [
    CODE_LINES.both,
    CODE_LINES.three,
    CODE_LINES.five,
    CODE_LINES.other,
    CODE_LINES.pushOther,
  ],
};

function note(i: number, kind: Kind): string {
  const r3 = i % 3;
  const r5 = i % 5;
  switch (kind) {
    case "both":
      return `\`i = ${i}\`：\`${i} % 3\` 和 \`${i} % 5\` 都是 0，第一個條件就成立，放入 \`"FizzBuzz"\`。`;
    case "three":
      return `\`i = ${i}\`：\`${i} % 3\` 是 0，但 \`${i} % 5\` 是 ${r5}，第一個條件不成立、第二個成立，放入 \`"Fizz"\`。`;
    case "five":
      return `\`i = ${i}\`：\`${i} % 3\` 是 ${r3}，前兩個條件都不成立；\`${i} % 5\` 是 0，第三個成立，放入 \`"Buzz"\`。`;
    case "other":
      return `\`i = ${i}\`：\`${i} % 3\` 是 ${r3}、\`${i} % 5\` 是 ${r5}，三個條件都不成立，走到 \`else\`，放入 \`"${i}"\`。`;
  }
}

/** Mimics how Bun's console.log prints an array of strings. */
function printed(answer: readonly string[]): string[] {
  const items = answer.map((word) => `"${word}"`).join(", ");
  return answer.length <= 10 ? [`[ ${items} ]`] : ["[", `  ${items}`, "]"];
}

function buildSteps(n: number): Step[] {
  const answer: string[] = [];
  const nSlot: Slot = { name: "n", value: String(n), type: "number" };
  const answerSlot = (mark?: "new"): Slot => ({
    name: "answer",
    value: `[${answer.map((word) => `"${word}"`).join(", ")}]`,
    ...(mark ? { mark } : {}),
  });
  const loopSlots = (i: number, withRemainders: boolean): Slot[] => {
    const slots: Slot[] = [{ name: "i", value: String(i) }];
    if (withRemainders) {
      for (const divisor of [3, 5]) {
        const remainder = i % divisor;
        slots.push({
          name: `i % ${divisor}`,
          value: String(remainder),
          ...(remainder === 0 ? { mark: "done" as const } : {}),
        });
      }
    }
    return slots;
  };
  const askAt = n >= 15 ? 15 : n >= 3 ? 3 : 0;

  const steps: Step[] = [
    {
      line: CODE_LINES.call,
      note: `呼叫 \`fizzBuzz(${n})\`：從 1 數到 ${n}，把每個數字換成一個字串。`,
      vars: [nSlot],
    },
    {
      line: CODE_LINES.answer,
      note: "`answer` 是空陣列，用來收集結果。",
      vars: [nSlot, answerSlot("new")],
    },
    {
      line: CODE_LINES.loop,
      note: `迴圈第 1 圈：\`i\` 從 1 開始，\`1 <= ${n}\` 成立，進入迴圈。`,
      vars: [nSlot, ...loopSlots(1, false), answerSlot()],
      question: {
        prompt: "`i % 3` 是「`i` 除以 3 的餘數」。`1 % 3` 是多少？",
        choices: ["1", "0", "3"],
        answer: 0,
        explain:
          "1 除以 3 商 0、餘 1，所以 `1 % 3` 是 1。只有 3 的倍數除以 3 才會餘 0。",
      },
    },
  ];

  for (let i = 1; i <= n; i++) {
    const kind = classify(i);
    if (i === askAt) {
      steps.push({
        line: CODE_LINES.both,
        note: `迴圈第 ${i} 圈：\`i = ${i}\`，先算出兩個餘數，再從第一個條件開始檢查。`,
        vars: [nSlot, ...loopSlots(i, true), answerSlot()],
        question:
          kind === "both"
            ? {
                prompt: `\`${i} % 3\` 和 \`${i} % 5\` 都是 0。這一圈會放入什麼？`,
                choices: ['`"FizzBuzz"`', '`"Fizz"`', `\`"${i}"\``],
                answer: 0,
                explain:
                  '第一個條件 `&&` 的兩邊都成立，放入 `"FizzBuzz"`。整組 `if` 只執行這一段，後面的 `else if` 不會再檢查。',
              }
            : {
                prompt: `\`${i} % 3\` 是 0，\`${i} % 5\` 是 ${i % 5}。這一圈會放入什麼？`,
                choices: ['`"Fizz"`', '`"FizzBuzz"`', `\`"${i}"\``],
                answer: 0,
                explain: `\`${i} % 5\` 不是 0，第一個條件不成立；第二個條件 \`${i} % 3 === 0\` 成立，所以放入 \`"Fizz"\`。`,
              },
      });
    }
    answer.push(word(i, kind));
    steps.push({
      line: PATHS[kind],
      note: note(i, kind),
      vars: [nSlot, ...loopSlots(i, true), answerSlot("new")],
    });
  }

  steps.push({
    line: CODE_LINES.done,
    note: `\`i\` 變成 ${n + 1}，\`${n + 1} <= ${n}\` 不成立，迴圈結束。回傳 \`answer\`，裡面正好有 ${n} 個字串。`,
    vars: [nSlot, answerSlot()],
  });
  steps.push({
    line: CODE_LINES.call,
    note: "印出回傳的陣列。注意每一個元素都是字串，連數字也加上了引號。",
    print: printed(answer),
  });
  return steps;
}

const scene: Scene = {
  id: "leetcode-0412-fizz-buzz",
  title: "Fizz Buzz：條件的順序決定結果",
  summary:
    "從 1 數到 n，看每個數字的餘數，以及它走進哪一個分支。改改看 n，觀察 15 的倍數怎麼被第一個條件攔下來。",
  inputs: [
    {
      name: "n",
      label: "n",
      value: "15",
      hint: `1 到 ${MAX_N} 的整數`,
    },
  ],
  code: (input) => code(parseN(input)),
  steps: (input) => buildSteps(parseN(input)),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { n: "1" },
  { n: "2" },
  { n: "5" },
  { n: "11" },
];
