// Run from the project root:
//   bun run day-07-ts-conventions-1/examples/03-readonly-as-const.ts

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// --- readonly on an array parameter (Day 04) ----------------------------------------

// `readonly Todo[]` is a promise to the caller: this function will not
// add, remove or replace anything in your array.
function countOpen(todos: readonly Todo[]): number {
  return todos.filter((todo) => !todo.done).length;
}

// --- as const on an object: a lookup table that cannot change ------------------------

// Without `as const` the type would be { low: string; medium: string; high: string }
// and anyone could assign a new label. With it, every property is readonly
// and keeps its exact value as its type.
const PRIORITY_LABELS = { low: "低", medium: "中", high: "高" } as const;

function priorityLabel(priority: Priority): string {
  // object[key] reads the property whose name is stored in `key`.
  return PRIORITY_LABELS[priority];
}

console.log(priorityLabel("high")); // 高

// A second table, only to show what happens when someone tries to change it.
const LIMITS = { maxTitleLength: 100 } as const;

// @ts-expect-error -- TS2540: Cannot assign to 'maxTitleLength' because it is a read-only property.
LIMITS.maxTitleLength = 5;
// The line above still ran: `readonly` is enforced by `bun check`, not by
// `bun run`. This is why the checks must pass before the program is run.
console.log(LIMITS.maxTitleLength); // 5

// --- as const on an array: literal types are kept ------------------------------------

const PRIORITIES = ["low", "medium", "high"] as const;

for (const priority of PRIORITIES) {
  // `priority` is "low" | "medium" | "high", so it is accepted as a Priority.
  console.log(`${priority} -> ${priorityLabel(priority)}`);
}

// Without `as const` the same array is just string[].
const loosePriorities = ["low", "medium", "high"];

for (const priority of loosePriorities) {
  // @ts-expect-error -- TS2345: Argument of type 'string' is not assignable to parameter of type 'Priority'.
  console.log(priorityLabel(priority));
}

// --- Instead of `as`: check the value ---------------------------------------------------

// `text as Priority` would accept "urgent" without looking at it.
// A real check either proves the value is a Priority, or refuses it.
function parsePriority(text: string): Priority {
  if (text === "low" || text === "medium" || text === "high") {
    // After the comparison, TypeScript knows `text` is a Priority.
    return text;
  }
  throw new Error(`不認識的優先度：${text}`);
}

console.log(parsePriority("medium")); // medium

try {
  parsePriority("urgent");
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}

// --- Instead of `!`: handle undefined ----------------------------------------------------

// `todos[0]!.title` would crash on an empty array.
function firstTitle(todos: readonly Todo[]): string {
  const first = todos[0];
  if (first === undefined) {
    return "（沒有待辦事項）";
  }
  return first.title;
}

const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "low" },
];

console.log(countOpen(todos)); // 1
console.log(firstTitle(todos)); // 買牛奶
console.log(firstTitle([])); // （沒有待辦事項）
