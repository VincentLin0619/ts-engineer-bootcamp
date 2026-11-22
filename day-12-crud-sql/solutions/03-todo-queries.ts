// Reference solution for exercise 03.

import type { Database } from "bun:sqlite";
import type { Priority } from "../examples/todo/todo.ts";
import { isPriority, Todo } from "../examples/todo/todo.ts";

type TodoRow = { id: number; title: string; done: number; priority: string };
type CountRow = { total: number };

function rowToTodo(row: TodoRow): Todo {
  if (!isPriority(row.priority)) {
    throw new Error(`資料庫裡有不認識的優先度：${row.priority}`);
  }
  return new Todo(row.id, row.title, row.priority, row.done === 1);
}

export function findTodosByPriority(db: Database, priority: Priority): Todo[] {
  // The database filters with WHERE; only matching rows reach the program.
  const rows = db
    .query<TodoRow, [string]>(
      "SELECT id, title, done, priority FROM todos WHERE priority = ? ORDER BY id",
    )
    .all(priority);
  return rows.map((row) => rowToTodo(row));
}

export function countOpenTodos(db: Database): number {
  const row = db
    .query<CountRow, [number]>(
      "SELECT COUNT(*) AS total FROM todos WHERE done = ?",
    )
    .get(0);
  // COUNT(*) always returns one row, but get() is typed as "row or null".
  return row === null ? 0 : row.total;
}

export function clearDoneTodos(db: Database): number {
  const result = db.query("DELETE FROM todos WHERE done = ?").run(1);
  return result.changes;
}
