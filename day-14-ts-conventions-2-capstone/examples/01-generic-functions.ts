// Run from the project root:
//   bun run day-14-ts-conventions-2-capstone/examples/01-generic-functions.ts
import type { TodoData } from "./todo/todo.ts";

// --- The problem: the same function, written once per type ---
function firstNumber(items: readonly number[]): number | undefined {
  return items[0];
}

function firstText(items: readonly string[]): string | undefined {
  return items[0];
}

console.log(firstNumber([10, 20, 30]), firstText(["買牛奶", "寫作業"]));

// --- A tempting shortcut: unknown. One function, but the type is lost. ---
function firstLoose(items: readonly unknown[]): unknown {
  return items[0];
}

const loose = firstLoose(["買牛奶", "寫作業"]);

// Try it: delete the `@ts-expect-error` line below, then run
//   bun check day-14-ts-conventions-2-capstone/examples/01-generic-functions.ts
// to read the real error message. Put the line back when you are done.

// @ts-expect-error -- TS18046: 'loose' is of type 'unknown'.
console.log(loose.length);

// --- The fix: a type parameter ---
// <TItem> is a blank. Every call fills it in with a real type.
function firstItem<TItem>(items: readonly TItem[]): TItem | undefined {
  return items[0];
}

// TypeScript fills in the blank from the argument (type inference).
const firstScore = firstItem([10, 20, 30]); // TItem = number
const firstTitle = firstItem(["買牛奶", "寫作業"]); // TItem = string
if (firstScore !== undefined && firstTitle !== undefined) {
  // The result keeps its type: number arithmetic and string properties work.
  console.log(firstScore + 1, firstTitle.length);
}

// The blank can also be filled in by hand. Useful when there is no value
// to infer from, such as an empty array.
const noTodo = firstItem<TodoData>([]);
console.log(noTodo);

// --- Two type parameters ---
function pairOf<TFirst, TSecond>(
  first: TFirst,
  second: TSecond,
): { first: TFirst; second: TSecond } {
  return { first, second };
}

const pair = pairOf("買牛奶", 3); // { first: string; second: number }
console.log(pair.first.length, pair.second + 1);

// --- A constraint: "any type, as long as it has a numeric id" ---
function findById<TEntity extends { id: number }>(
  entities: readonly TEntity[],
  id: number,
): TEntity | undefined {
  // entity.id is allowed because the constraint promises it exists.
  return entities.find((entity) => entity.id === id);
}

const todos: TodoData[] = [
  { id: 1, title: "買牛奶", done: false, priority: "medium" },
  { id: 2, title: "寫作業", done: true, priority: "high" },
];
const members = [
  { id: 1, name: "小明" },
  { id: 2, name: "小華" },
];

const todo = findById(todos, 2); // TodoData | undefined
const member = findById(members, 1); // { id: number; name: string } | undefined
if (todo !== undefined && member !== undefined) {
  console.log(todo.title, member.name);
}

// Text has no id, so the constraint rejects it.
// @ts-expect-error -- TS2322: Type 'string' is not assignable to type '{ id: number; }'.
console.log(findById(["買牛奶", "寫作業"], 1));

// --- You have been using generic types since Day 02 ---
const scores: Array<number> = [10, 20, 30]; // the long way to write number[]
const later: Promise<string> = Promise.resolve("完成");
console.log(scores.length, await later);
