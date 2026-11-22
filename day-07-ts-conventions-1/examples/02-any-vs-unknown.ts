// Run from the project root:
//   bun run day-07-ts-conventions-1/examples/02-any-vs-unknown.ts

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

const todo: Todo = { id: 1, title: "買牛奶", done: false };

// --- any: checking is switched off ----------------------------------------------

// Try it: delete the `biome-ignore` line below, then run
//   bunx biome check day-07-ts-conventions-1/examples/02-any-vs-unknown.ts
// to read the lint diagnostic. Put the line back when you are done.

// biome-ignore lint/suspicious/noExplicitAny: kept on purpose to show what `any` hides
function titleLengthLoose(value: any): number {
  // A typo: `titel`. TypeScript says nothing, because `any` allows everything.
  return value.titel.length;
}

try {
  console.log(titleLengthLoose(todo));
} catch (error) {
  if (error instanceof Error) {
    console.log(`any 的後果，執行時才出錯：${error.message}`);
  }
}

// --- A precise type: the typo cannot survive --------------------------------------

function titleLength(value: Todo): number {
  // Writing `value.titel` here is error TS2551, found before the program runs.
  return value.title.length;
}

console.log(titleLength(todo)); // 3

// --- unknown: "I do not know what this is, so I must check first" ------------------

function describeValue(value: unknown): string {
  if (typeof value === "string") {
    // Inside this branch `value` is a string.
    return `文字，長度 ${value.length}`;
  }
  if (typeof value === "number") {
    // Inside this branch `value` is a number.
    return `數字，兩倍是 ${value * 2}`;
  }
  if (value instanceof Error) {
    return `錯誤物件，訊息是「${value.message}」`;
  }
  return "不認識的值";
}

console.log(describeValue("買牛奶"));
console.log(describeValue(21));
console.log(describeValue(new Error("壞掉了")));
console.log(describeValue(true));

// `unknown` accepts every value, exactly like `any`...
const fromOutside: unknown = "100";

// ...but unlike `any`, it cannot be used before it is checked.
// @ts-expect-error -- TS18046: 'fromOutside' is of type 'unknown'.
console.log(fromOutside.length);

if (typeof fromOutside === "string") {
  console.log(fromOutside.length); // 3
}
