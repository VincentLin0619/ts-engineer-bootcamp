// Run from the project root:
//   bun run day-07-ts-conventions-1/examples/01-strict-options.ts
//
// Each section shows one mistake that a strict option in tsconfig.json
// catches. Every mistake sits behind a `// @ts-expect-error` comment, so the
// whole project still passes `bun check`.
//
// Try it: delete ONE `@ts-expect-error` line, then run
//   bun check day-07-ts-conventions-1/examples/01-strict-options.ts
// Read the error, then put the line back before trying the next one.

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "low" },
];

// --- 1. noImplicitAny (part of `strict`) --------------------------------------
// A parameter without a type would silently become `any`: no checking at all.

// @ts-expect-error -- TS7006: Parameter 'title' implicitly has an 'any' type.
function titleLength(title) {
  return title.length;
}

console.log(titleLength("買牛奶")); // 3
// Nothing stops a wrong argument. A number has no `length`:
console.log(titleLength(42)); // undefined

// --- 2. strictNullChecks (part of `strict`) -----------------------------------
// `undefined` and `null` are not allowed to pass as some other type.

const found = todos.find((todo) => todo.id === 1);
// @ts-expect-error -- TS18048: 'found' is possibly 'undefined'.
console.log(found.title); // works only because id 1 happens to exist

// The accepted version: check first.
if (found !== undefined) {
  console.log(found.title);
}

// --- 3. noUncheckedIndexedAccess -----------------------------------------------
// Reading an array by index gives `Todo | undefined`: the index may not exist.

// @ts-expect-error -- TS2532: Object is possibly 'undefined'.
console.log(todos[0].title); // works only because the array is not empty

const tenth = todos[9];
console.log(tenth); // undefined: this is what the option protects you from

// --- 4. noImplicitReturns ------------------------------------------------------
// Every path through a function must return a value.

// @ts-expect-error -- TS7030: Not all code paths return a value.
function priorityLabel(priority: Priority) {
  if (priority === "high") {
    return "高";
  }
  if (priority === "medium") {
    return "中";
  }
  // "low" was forgotten: the function reaches the end and returns undefined.
}

console.log(priorityLabel("high")); // 高
console.log(priorityLabel("low")); // undefined

// --- 5. useUnknownInCatchVariables (part of `strict`) ---------------------------
// The value in `catch` is `unknown`, as you saw on Day 06.

try {
  throw new Error("示範用的錯誤");
} catch (error) {
  // @ts-expect-error -- TS18046: 'error' is of type 'unknown'.
  console.log(error.message);

  // The accepted version: check first.
  if (error instanceof Error) {
    console.log(error.message);
  }
}
