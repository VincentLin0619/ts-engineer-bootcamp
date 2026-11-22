// Reference solution for exercise 01.
import type { TodoData } from "../examples/todo/todo.ts";

export function lastItem<TItem>(items: readonly TItem[]): TItem | undefined {
  // With noUncheckedIndexedAccess an index read is already TItem | undefined.
  return items[items.length - 1];
}

export function findById<TEntity extends { id: number }>(
  entities: readonly TEntity[],
  id: number,
): TEntity | undefined {
  return entities.find((entity) => entity.id === id);
}

export function replaceById<TEntity extends { id: number }>(
  entities: readonly TEntity[],
  replacement: TEntity,
): TEntity[] {
  // map always builds a new array, so the original stays untouched.
  return entities.map((entity) =>
    entity.id === replacement.id ? replacement : entity,
  );
}

// "The id and the title of TodoData". Rename a field in TodoData and this
// type follows, or bun check points at every place that has to change.
export type TodoSummary = Pick<TodoData, "id" | "title">;

// "Any part of TodoData except the id, all optional".
export type TodoPatch = Partial<Omit<TodoData, "id">>;

export function toSummary(todo: Readonly<TodoData>): TodoSummary {
  return { id: todo.id, title: todo.title };
}

export function applyPatch(
  todo: Readonly<TodoData>,
  patch: TodoPatch,
): TodoData {
  return { ...todo, ...patch };
}
