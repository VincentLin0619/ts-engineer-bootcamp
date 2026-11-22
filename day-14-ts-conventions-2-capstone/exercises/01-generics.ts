// Exercise 01: generic functions and utility types.
//
// Replace each `throw new Error("TODO...")` line, then run: bun test day-14
import type { Priority, TodoData } from "../examples/todo/todo.ts";

// Return the last item of the array, or undefined when the array is empty.
// The return type follows the item type: TItem is filled in at each call.
// lastItem([10, 20, 30])       -> 30
// lastItem(["買牛奶", "寫作業"]) -> "寫作業"
// lastItem([])                 -> undefined
export function lastItem<TItem>(items: readonly TItem[]): TItem | undefined {
  // TODO: return the last item
  throw new Error("TODO：尚未完成 lastItem");
}

// Find the entity with the given id, or undefined when there is none.
// The constraint `extends { id: number }` lets you read `.id`.
// findById([{ id: 1, name: "小明" }, { id: 2, name: "小華" }], 2) -> { id: 2, name: "小華" }
// findById([{ id: 1, name: "小明" }], 9)                         -> undefined
export function findById<TEntity extends { id: number }>(
  entities: readonly TEntity[],
  id: number,
): TEntity | undefined {
  // TODO: return the entity whose id matches
  throw new Error("TODO：尚未完成 findById");
}

// Return a NEW array in which the entity that has the same id as
// `replacement` is swapped for `replacement`. The order stays the same and
// the original array is not modified. When no id matches, the new array has
// the same content as the original.
// replaceById([{ id: 1, name: "小明" }, { id: 2, name: "小華" }], { id: 2, name: "阿華" })
//   -> [{ id: 1, name: "小明" }, { id: 2, name: "阿華" }]
export function replaceById<TEntity extends { id: number }>(
  entities: readonly TEntity[],
  replacement: TEntity,
): TEntity[] {
  // TODO: return the new array
  throw new Error("TODO：尚未完成 replaceById");
}

// The two types below are written out by hand. They repeat what TodoData
// already says, so they would go stale when TodoData changes.
//
// TODO: rewrite TodoSummary with Pick, so it reads "the id and the title of
// TodoData".
// TODO: rewrite TodoPatch with Partial and Omit, so it reads "any part of
// TodoData except the id, all optional".
//
// The tests cannot see types. Run `bun check` to make sure your versions
// still fit the two functions below, then compare with the solution.
export type TodoSummary = { id: number; title: string };

export type TodoPatch = {
  title?: string;
  done?: boolean;
  priority?: Priority;
};

// Return only the id and the title of a todo.
// toSummary({ id: 1, title: "買牛奶", done: false, priority: "low" }) -> { id: 1, title: "買牛奶" }
export function toSummary(todo: Readonly<TodoData>): TodoSummary {
  // TODO: return the summary
  throw new Error("TODO：尚未完成 toSummary");
}

// Return a NEW todo with the fields of `patch` applied on top of `todo`.
// The parameter is Readonly: do not modify it.
// applyPatch({ id: 1, title: "買牛奶", done: false, priority: "low" }, { done: true })
//   -> { id: 1, title: "買牛奶", done: true, priority: "low" }
export function applyPatch(
  todo: Readonly<TodoData>,
  patch: TodoPatch,
): TodoData {
  // TODO: return the new todo
  throw new Error("TODO：尚未完成 applyPatch");
}
