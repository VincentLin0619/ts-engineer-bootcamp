import { parseText } from "../inputs.ts";
import {
  type ArrayPanel,
  type InputValues,
  type MapPanel,
  type Mark,
  type Question,
  type Scene,
  SceneInputError,
  type Slot,
  type Step,
} from "../types.ts";

const LINE = {
  stack: 9,
  read: [10, 11],
  push: [12, 13],
  pop: [15, 16],
  fail: 17,
  end: 21,
  call: 24,
} as const;

const PAIRS: Array<[closing: string, opening: string]> = [
  [")", "("],
  ["]", "["],
  ["}", "{"],
];
const OPENING_OF = new Map<string, string>(PAIRS);
const BRACKETS = "()[]{}";

function code(s: string): string {
  return `// closing bracket -> its opening bracket
const OPENING_OF = new Map<string, string>([
  [")", "("],
  ["]", "["],
  ["}", "{"],
]);

function isValid(s: string): boolean {
  const stack: string[] = [];
  for (const ch of s) {
    const opening = OPENING_OF.get(ch);
    if (opening === undefined) {
      stack.push(ch); // an opening bracket: wait for its partner
    } else {
      const top = stack.pop();
      if (top !== opening) {
        return false; // wrong partner, or nothing left to close
      }
    }
  }
  return stack.length === 0; // every opening bracket was closed
}

console.log(isValid("${s}"));`;
}

function quoted(ch: string): string {
  return `"${ch}"`;
}

/** The map panel, optionally highlighting the closing bracket looked up. */
function mapPanel(focus?: string): MapPanel {
  const panel: MapPanel = {
    name: "OPENING_OF",
    entries: PAIRS.map(([closing, opening]) => [
      quoted(closing),
      quoted(opening),
    ]),
  };
  if (focus !== undefined) {
    panel.focus = quoted(focus);
    panel.focusMark = "compare";
  }
  return panel;
}

/** Question asked just before the first `pop`. */
function popQuestion(stack: readonly string[], ch: string): Question | null {
  const top = stack.at(-1);
  if (top === undefined) return null;
  const bottom = stack[0];
  const choices = [`\`${top}\``, `\`${ch}\``];
  if (bottom !== undefined && bottom !== top) {
    choices.unshift(`\`${bottom}\``);
  } else {
    choices.push("`undefined`");
  }
  return {
    prompt: `stack 現在是 [ ${stack.map(quoted).join(", ")} ]，等一下 \`stack.pop()\` 會拿出哪一個？`,
    choices,
    answer: choices.indexOf(`\`${top}\``),
    explain: `堆疊是後進先出：\`pop\` 拿出的是最後 \`push\` 進去的 ${quoted(top)}。`,
  };
}

function buildSteps(s: string): Step[] {
  const chars = s.split("");
  // Positions in `s` of the opening brackets that are still open.
  const stack: number[] = [];
  const settled: Record<number, Mark> = {};
  const arrays = (
    current: number | null,
    extra: Record<number, Mark> = {},
    stackMark?: Mark,
  ): ArrayPanel[] => {
    const top = stack.length - 1;
    return [
      {
        name: "s",
        items: chars,
        marks: { ...settled, ...extra },
        pointers: current === null ? {} : { ch: current },
      },
      {
        name: "stack",
        items: stack.map((position) => chars[position] ?? ""),
        marks: stackMark !== undefined && top >= 0 ? { [top]: stackMark } : {},
      },
    ];
  };
  const slots = (values: Array<[name: string, value: string]>): Slot[] =>
    values.map(([name, value]) => ({ name, value }));

  const steps: Step[] = [
    {
      line: LINE.call,
      note: `檢查 ${quoted(s)} 的括號是不是都正確配對。\`OPENING_OF\` 記著每種右括號要配的左括號。`,
      arrays: [{ name: "s", items: chars }],
      map: mapPanel(),
      vars: [],
    },
    {
      line: LINE.stack,
      note: "建立空的 `stack`，用來放還沒關上的左括號。陣列的最右邊當作堆疊的最上面。",
      arrays: arrays(null),
    },
  ];

  let asked = false;
  for (const [k, ch] of chars.entries()) {
    const opening = OPENING_OF.get(ch);
    if (opening === undefined) {
      steps.push({
        line: [...LINE.read],
        note: `讀到 ${quoted(ch)}。\`OPENING_OF.get(${quoted(ch)})\` 是 \`undefined\`，表示它不是右括號，而是左括號。`,
        arrays: arrays(k, { [k]: "active" }),
        map: mapPanel(),
        vars: slots([
          ["ch", quoted(ch)],
          ["opening", "undefined"],
        ]),
      });
      stack.push(k);
      steps.push({
        line: [...LINE.push],
        note: `把 ${quoted(ch)} \`push\` 進 stack，等之後的右括號來配對。`,
        arrays: arrays(k, { [k]: "active" }, "new"),
      });
      continue;
    }

    const read: Step = {
      line: [...LINE.read],
      note: `讀到 ${quoted(ch)}，是右括號。\`OPENING_OF\` 查到它要配的左括號是 ${quoted(opening)}。`,
      arrays: arrays(k, { [k]: "active" }),
      map: mapPanel(ch),
      vars: slots([
        ["ch", quoted(ch)],
        ["opening", quoted(opening)],
      ]),
    };
    if (!asked) {
      const question = popQuestion(
        stack.map((position) => chars[position] ?? ""),
        ch,
      );
      if (question) {
        asked = true;
        read.question = question;
      }
    }
    steps.push(read);

    const position = stack.pop();
    const top = position === undefined ? undefined : chars[position];
    const vars = slots([
      ["ch", quoted(ch)],
      ["opening", quoted(opening)],
      ["top", top === undefined ? "undefined" : quoted(top)],
    ]);
    if (position !== undefined && top === opening) {
      settled[position] = "done";
      settled[k] = "done";
      steps.push({
        line: [...LINE.pop],
        note: `\`pop\` 拿出最上面的 ${quoted(top)}，和需要的 ${quoted(opening)} 一樣，配對成功。`,
        arrays: arrays(k),
        map: mapPanel(),
        vars,
      });
      continue;
    }

    steps.push({
      line: [...LINE.pop],
      note:
        position === undefined
          ? `stack 是空的，\`pop\` 得到 \`undefined\`：${quoted(ch)} 前面沒有可以配對的左括號。`
          : `\`pop\` 拿出最上面的 ${quoted(top ?? "")}，但需要的是 ${quoted(opening)}，種類不對。`,
      arrays: arrays(
        k,
        position === undefined
          ? { [k]: "error" }
          : { [k]: "error", [position]: "error" },
      ),
      map: mapPanel(),
      vars,
    });
    steps.push({
      line: LINE.fail,
      note: "`top !== opening` 成立，回傳 `false`。後面的字元都不用再看了。",
    });
    steps.push({ line: LINE.call, note: "印出 `false`。", print: "false" });
    return steps;
  }

  const leftover = stack.length;
  const marks: Record<number, Mark> = {};
  for (const position of stack) marks[position] = "error";
  steps.push({
    line: LINE.end,
    note:
      leftover === 0
        ? "字串讀完了，stack 是空的：每個左括號都配對成功，回傳 `true`。"
        : `字串讀完了，stack 還剩 ${leftover} 個左括號沒有關上，回傳 \`false\`。`,
    arrays: arrays(null, marks, leftover === 0 ? undefined : "error"),
    vars: [],
  });
  steps.push({
    line: LINE.call,
    note: leftover === 0 ? "印出 `true`。" : "印出 `false`。",
    print: leftover === 0 ? "true" : "false",
  });
  return steps;
}

function parseInput(input: InputValues): string {
  const s = parseText((input.s ?? "").trim(), { max: 12, label: "字串" });
  for (const ch of s) {
    if (!BRACKETS.includes(ch)) {
      throw new SceneInputError(
        "字串只能包含 ( ) [ ] { } 這六種括號，不能有空白，例如 {[]()}。",
      );
    }
  }
  return s;
}

const scene: Scene = {
  id: "leetcode-0020-valid-parentheses",
  title: "Valid Parentheses：用堆疊配對括號",
  summary:
    "左括號 `push` 進堆疊，右括號 `pop` 出最上面的那個來配對。改改看輸入，觀察配錯、多出右括號、少了右括號時各在哪裡停下來。",
  inputs: [
    {
      name: "s",
      label: "s",
      value: "{[]()}",
      hint: "1 到 12 個括號：( ) [ ] { }",
    },
  ],
  code: (input) => code(parseInput(input)),
  steps: (input) => buildSteps(parseInput(input)),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { s: "[(])" },
  { s: "((" },
  { s: "}{" },
  { s: "[]" },
];
