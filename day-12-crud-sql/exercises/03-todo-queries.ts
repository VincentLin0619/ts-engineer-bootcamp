// Exercise 03 (optional): extra queries for the Todo app.
//
// These functions work on the `todos` table that SqliteTodoRepository
// creates (see examples/todo/sqlite-todo-repository.ts):
//
//   id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
//   done INTEGER NOT NULL DEFAULT 0, priority TEXT NOT NULL
//
// The repository reads every row and lets the program filter them. Here the
// database does the filtering with WHERE, so only the rows you need are read.

import type { Database } from "bun:sqlite";
import type { Priority } from "../examples/todo/todo.ts";
import { isPriority, Todo } from "../examples/todo/todo.ts";

// One row of the todos table, as SQLite returns it.
type TodoRow = { id: number; title: string; done: number; priority: string };

// Already written for you: the same conversion the repository uses.
function rowToTodo(row: TodoRow): Todo {
  if (!isPriority(row.priority)) {
    throw new Error(`資料庫裡有不認識的優先度：${row.priority}`);
  }
  return new Todo(row.id, row.title, row.priority, row.done === 1);
}

// R: every todo with the given priority, ordered by id, as Todo objects.
// With "買牛奶" (high, done), "寫作業" (low) and "倒垃圾" (high):
// findTodosByPriority(db, "high")   -> the Todos "買牛奶" and "倒垃圾"
// findTodosByPriority(db, "medium") -> []
export function findTodosByPriority(db: Database, priority: Priority): Todo[] {
  // TODO: SELECT id, title, done, priority FROM todos
  //       WHERE priority = ? ORDER BY id
  //       then convert every row with rowToTodo
  throw new Error("TODO：尚未完成 findTodosByPriority");
}

// R: how many todos are not done yet.
// New SQL: COUNT(*) counts the matching rows, and AS gives the result a
// column name. This statement returns exactly one row: { total: number }
//   SELECT COUNT(*) AS total FROM todos WHERE done = ?
// With the three todos above -> 2
export function countOpenTodos(db: Database): number {
  // TODO: run the statement above with get(), binding 0 for "not done"
  throw new Error("TODO：尚未完成 countOpenTodos");
}

// D: delete every todo that is done. Return how many rows were deleted.
// With the three todos above -> 1, and only "寫作業" and "倒垃圾" remain.
// Calling it again -> 0
export function clearDoneTodos(db: Database): number {
  // TODO: DELETE FROM todos WHERE done = ?, then return result.changes
  throw new Error("TODO：尚未完成 clearDoneTodos");
}
