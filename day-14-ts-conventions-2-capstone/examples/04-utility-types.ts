// Run from the project root:
//   bun run day-14-ts-conventions-2-capstone/examples/04-utility-types.ts
//
// Utility types build a new type out of an existing one, so the new type
// follows along when the original changes.
import type { TodoData } from "./todo/todo.ts";

const original: TodoData = {
  id: 1,
  title: "買牛奶",
  done: false,
  priority: "medium",
};

// --- Partial<T>: every property becomes optional ---
// Same as { id?: number; title?: string; done?: boolean; priority?: Priority }
type TodoChanges = Partial<TodoData>;

const onlyDone: TodoChanges = { done: true };
const nothing: TodoChanges = {};
console.log("Partial：", onlyDone, nothing);

// --- Pick<T, Keys>: keep only the named properties ---
// Same as { id: number; title: string }
type TodoSummary = Pick<TodoData, "id" | "title">;

const summary: TodoSummary = { id: original.id, title: original.title };
console.log("Pick：", summary);

// --- Omit<T, Keys>: keep everything except the named properties ---
// Same as { title: string; done: boolean; priority: Priority }
type TodoWithoutId = Omit<TodoData, "id">;

const draft: TodoWithoutId = { title: "寫作業", done: false, priority: "high" };
console.log("Omit：", draft);

// --- Readonly<T>: no property can be reassigned ---
type FrozenTodo = Readonly<TodoData>;

const frozen: FrozenTodo = original;
// Try it: delete the `@ts-expect-error` line, then run bun check on this file.
// @ts-expect-error -- TS2540: Cannot assign to 'title' because it is a read-only property.
frozen.title = "買豆漿";
// Readonly is only a compile-time promise: the line above still ran.
console.log("Readonly：", frozen.title);

// --- Combining them ---
// "Any part of a todo may change, except the id."
// This is the TodoChanges type that Day 05 wrote out by hand.
type EditableFields = Partial<Omit<TodoData, "id">>;

function applyChanges(
  todo: Readonly<TodoData>,
  changes: EditableFields,
): TodoData {
  // Immutable update (Day 04): a new object, the parameter is not modified.
  return { ...todo, ...changes };
}

const fresh: TodoData = {
  id: 2,
  title: "寫作業",
  done: false,
  priority: "medium",
};
const updated = applyChanges(fresh, { done: true, priority: "low" });
console.log("合併使用：", updated);
console.log("原本的沒有被改：", fresh.done);
