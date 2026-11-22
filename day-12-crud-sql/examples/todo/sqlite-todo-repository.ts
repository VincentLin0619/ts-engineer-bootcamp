// Todo mainline: a TodoRepository that keeps the todos in a SQLite table.
// New on Day 12.
//
// This file only defines things, so running it prints nothing.
// Run cli.ts in this folder to see it at work.

import type { Database } from "bun:sqlite";
import { isPriority, Todo } from "./todo.ts";
import type { NewTodo, TodoRepository } from "./todo-repository.ts";

// One row of the `todos` table, exactly as SQLite hands it back.
// SQLite has no boolean type, so `done` is the number 0 or 1.
// `priority` is any text: the database does not know our three words.
type TodoRow = {
  id: number;
  title: string;
  done: number;
  priority: string;
};

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL
  )
`;

// Row -> Todo: the place where database values become program values.
function rowToTodo(row: TodoRow): Todo {
  // The type guard turns `string` into `Priority`, or we stop right here.
  if (!isPriority(row.priority)) {
    throw new Error(`資料庫裡有不認識的優先度：${row.priority}`);
  }
  // 1 -> true, 0 -> false
  return new Todo(row.id, row.title, row.priority, row.done === 1);
}

// Stores the todos in a SQLite table. The caller opens the Database and
// passes it in, so the same class works with a file or with ":memory:".
//
// bun:sqlite answers right away (its API is synchronous), but the contract
// says "return a Promise", so every method is `async`.
export class SqliteTodoRepository implements TodoRepository {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
    this.#db.run(CREATE_TABLE_SQL);
  }

  // C -> INSERT
  async create(input: NewTodo): Promise<Todo> {
    // Build a Todo before touching the database: an invalid title throws
    // right here, so it never becomes a row. The database has not picked
    // the id yet, so 0 stands in for it.
    const draft = new Todo(0, input.title, input.priority);
    const result = this.#db
      .query("INSERT INTO todos (title, done, priority) VALUES (?, ?, ?)")
      .run(draft.title, 0, draft.priority);
    // lastInsertRowid is the id the database gave to the new row.
    const id = Number(result.lastInsertRowid);
    return new Todo(id, draft.title, draft.priority);
  }

  // R -> SELECT (every row)
  async findAll(): Promise<Todo[]> {
    const rows = this.#db
      .query<TodoRow, []>(
        "SELECT id, title, done, priority FROM todos ORDER BY id",
      )
      .all();
    return rows.map((row) => rowToTodo(row));
  }

  // R -> SELECT ... WHERE (one row)
  async findById(id: number): Promise<Todo | undefined> {
    const row = this.#db
      .query<TodoRow, [number]>(
        "SELECT id, title, done, priority FROM todos WHERE id = ?",
      )
      .get(id);
    // get() gives null when no row matches; the contract says undefined.
    if (row === null) {
      return undefined;
    }
    return rowToTodo(row);
  }

  // U -> UPDATE ... WHERE. A todo with an unknown id changes nothing:
  // no row matches, and that is not an error in SQL.
  async save(todo: Todo): Promise<void> {
    this.#db
      .query("UPDATE todos SET title = ?, done = ?, priority = ? WHERE id = ?")
      .run(todo.title, todo.done ? 1 : 0, todo.priority, todo.id);
  }

  // D -> DELETE ... WHERE
  async delete(id: number): Promise<boolean> {
    const result = this.#db.query("DELETE FROM todos WHERE id = ?").run(id);
    // changes is the number of rows the statement touched.
    return result.changes > 0;
  }
}
