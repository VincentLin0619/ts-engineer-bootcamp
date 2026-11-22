import { parseIntegerList } from "../inputs.ts";
import {
  type ArrayPanel,
  type InputValues,
  type Mark,
  type Question,
  type Scene,
  SceneInputError,
  type Slot,
  type Step,
} from "../types.ts";

const MAX_CUSTOMERS = 4;
const MAX_BANKS = 4;

const CODE_LINES = {
  call: 12,
  richest: 2,
  loop: 3,
  reduce: 4,
  compare: 5,
  update: 6,
  done: 9,
} as const;

function show(list: readonly number[]): string {
  return `[${list.join(", ")}]`;
}

function code(accounts: number[][]): string {
  return `function maximumWealth(accounts: number[][]): number {
  let richest = 0;
  for (const customer of accounts) {
    const wealth = customer.reduce((total, money) => total + money, 0);
    if (wealth > richest) {
      richest = wealth;
    }
  }
  return richest;
}

console.log(maximumWealth([${accounts.map(show).join(", ")}]));`;
}

function parseAccounts(input: InputValues): number[][] {
  const groups = (input.accounts ?? "")
    .split(/[;；]/)
    .map((group) => group.trim())
    .filter((group) => group !== "");
  if (groups.length < 1 || groups.length > MAX_CUSTOMERS) {
    throw new SceneInputError(
      `要有 1 到 ${MAX_CUSTOMERS} 位客戶，客戶之間用分號 ; 分開，例如 3, 8, 1; 5, 5, 5。`,
    );
  }
  return groups.map((group, index) => {
    const label = `第 ${index + 1} 位客戶`;
    const money = parseIntegerList(group, { min: 1, max: MAX_BANKS, label });
    if (money.some((amount) => amount < 1)) {
      throw new SceneInputError(`${label}的存款要是正整數。`);
    }
    return money;
  });
}

const reduceQuestion = (first: number): Question => ({
  prompt:
    "`customer.reduce((total, money) => total + money, 0)` 的第一圈，`total` 是多少？",
  choices: [
    "0，也就是 `reduce` 的第二個參數",
    `${first}，也就是 customer 的第一個數字`,
    "`undefined`，因為還沒有加任何東西",
  ],
  answer: 0,
  explain:
    "`reduce` 的第二個參數是累計值的起點，所以第一圈的 `total` 是 0，`money` 才是第一個數字。",
});

function keepQuestion(wealth: number, richest: number): Question {
  if (wealth === richest) {
    return {
      prompt: `\`wealth\` 和 \`richest\` 都是 ${wealth}。\`if (wealth > richest)\` 成立嗎？`,
      choices: ["不成立：一樣多不算「大於」", "成立：所以 richest 要更新"],
      answer: 0,
      explain: `\`${wealth} > ${richest}\` 是 false，所以不會更新。一樣多時不換也沒關係，答案相同。`,
    };
  }
  return {
    prompt: `\`wealth\` 是 ${wealth}，\`richest\` 是 ${richest}。這一圈結束後，\`richest\` 是多少？`,
    choices: [String(richest), String(wealth), String(richest + wealth)],
    answer: 0,
    explain: `\`${wealth} > ${richest}\` 不成立，\`if\` 裡的指派不會執行，richest 維持 ${richest}。`,
  };
}

function buildSteps(accounts: number[][]): Step[] {
  let richest = 0;
  let richestRow = -1;
  const finished = new Set<number>();

  /** Marks every cell of one row the same way. */
  const fill = (row: readonly number[], mark: Mark): Record<number, Mark> => {
    const marks: Record<number, Mark> = {};
    for (const [k] of row.entries()) marks[k] = mark;
    return marks;
  };
  /** All rows: the richest so far found, other finished rows dim. */
  const panels = (
    current?: number,
    currentMarks?: Record<number, Mark>,
    pointer?: number,
  ): ArrayPanel[] =>
    accounts.map((row, index) => {
      const panel: ArrayPanel = {
        name: `accounts[${index}]`,
        items: row.map(String),
      };
      if (index === current) {
        if (currentMarks) panel.marks = currentMarks;
        if (pointer !== undefined) panel.pointers = { money: pointer };
      } else if (index === richestRow) {
        panel.marks = fill(row, "found");
      } else if (finished.has(index)) {
        panel.marks = fill(row, "dim");
      }
      return panel;
    });
  const richestSlot = (mark?: Mark): Slot => ({
    name: "richest",
    value: String(richest),
    type: "number",
    ...(mark ? { mark } : {}),
  });

  const steps: Step[] = [
    {
      line: CODE_LINES.call,
      note: `呼叫 \`maximumWealth\`：共有 ${accounts.length} 位客戶，每一列是一位客戶在各家銀行的存款。`,
      arrays: panels(),
      vars: [],
    },
    {
      line: CODE_LINES.richest,
      note: "`richest` 記住「到目前為止最多的資產」，從 0 開始。存款都是正整數，第一位客戶一定會超過它。",
      vars: [richestSlot("new")],
    },
  ];

  let askedKeep = false;
  for (const [index, customer] of accounts.entries()) {
    const customerSlot: Slot = { name: "customer", value: show(customer) };
    const loopStep: Step = {
      line: CODE_LINES.loop,
      note: `第 ${index + 1} 圈：\`customer\` 是 \`accounts[${index}]\`，也就是 ${show(customer)}。`,
      arrays: panels(index, fill(customer, "active")),
      vars: [richestSlot(), customerSlot],
    };
    const first = customer[0];
    if (index === 0 && first !== undefined) {
      loopStep.question = reduceQuestion(first);
    }
    steps.push(loopStep);

    // Run the reduce one callback at a time.
    let total = 0;
    for (const [k, money] of customer.entries()) {
      const next = total + money;
      const isLast = k === customer.length - 1;
      const marks: Record<number, Mark> = {};
      for (let done = 0; done < k; done++) marks[done] = "done";
      marks[k] = "active";
      const vars: Slot[] = [
        richestSlot(),
        customerSlot,
        { name: "total", value: String(total) },
        { name: "money", value: String(money) },
      ];
      let note = `\`reduce\` 第 ${k + 1} 圈：\`total\` 是 ${total}、\`money\` 是 ${money}，回傳 ${total} + ${money} = ${next}。`;
      if (isLast) {
        note += `走完了，最後的累計值 ${next} 存進 \`wealth\`。`;
        vars.push({ name: "wealth", value: String(next), mark: "new" });
      }
      const step: Step = {
        line: CODE_LINES.reduce,
        note,
        arrays: panels(index, marks, k),
        vars,
      };
      if (isLast && index > 0 && next <= richest && !askedKeep) {
        step.question = keepQuestion(next, richest);
        askedKeep = true;
      }
      steps.push(step);
      total = next;
    }

    const wealth = total;
    const wealthSlot: Slot = { name: "wealth", value: String(wealth) };
    finished.add(index);
    if (wealth > richest) {
      const before = richest;
      richest = wealth;
      richestRow = index;
      steps.push({
        line: [CODE_LINES.compare, CODE_LINES.update],
        note: `\`${wealth} > ${before}\` 成立，這位客戶是目前最富有的，\`richest\` 換成 ${wealth}。`,
        arrays: panels(),
        vars: [richestSlot("new"), customerSlot, wealthSlot],
      });
    } else {
      const reason = wealth === richest ? "一樣多不算「大於」" : "沒有比較多";
      steps.push({
        line: CODE_LINES.compare,
        note: `\`${wealth} > ${richest}\` 不成立（${reason}），\`richest\` 維持 ${richest}。`,
        arrays: panels(),
        vars: [richestSlot(), customerSlot, wealthSlot],
      });
    }
  }

  steps.push({
    line: CODE_LINES.done,
    note: `每位客戶都看完了，回傳 \`richest\`，也就是 ${richest}。`,
    arrays: panels(),
    vars: [richestSlot()],
  });
  steps.push({
    line: CODE_LINES.call,
    note: "印出最富有客戶的資產。每一筆存款都只加了一次。",
    print: String(richest),
  });
  return steps;
}

const scene: Scene = {
  id: "leetcode-1672-richest-customer-wealth",
  title: "Richest Customer Wealth：reduce 加總，再記住最大的",
  summary:
    "外層迴圈一次看一位客戶，reduce 把他的存款加起來，再和 richest 比較。改改看輸入，觀察 richest 什麼時候被換掉。",
  inputs: [
    {
      name: "accounts",
      label: "accounts",
      value: "3, 8, 1; 5, 5, 5; 2, 9, 1",
      hint: `1 到 ${MAX_CUSTOMERS} 位客戶，客戶之間用分號 ; 分開；每位 1 到 ${MAX_BANKS} 筆正整數存款，用逗號分開`,
    },
  ],
  code: (input) => code(parseAccounts(input)),
  steps: (input) => buildSteps(parseAccounts(input)),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { accounts: "7" },
  { accounts: "6, 1, 2; 2, 4, 3" },
  { accounts: "4; 10; 7" },
  { accounts: "1, 1, 1, 1; 2, 2, 2, 2; 9, 9, 9, 9; 4, 4, 4, 4" },
];
