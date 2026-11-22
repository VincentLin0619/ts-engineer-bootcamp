// Todo mainline: a TodoRepository that keeps the todos in a JSON file.
// New on Day 11.
//
// This file only defines things, so running it prints nothing.
// Run cli.ts in this folder to see it at work.

import type { TodoData } from "./todo.ts";
import { isTodoData, Todo } from "./todo.ts";
import type { NewTodo, TodoRepository } from "./todo-repository.ts";

// Checks data that came from JSON. The input is `unknown` on purpose:
// a file can contain anything, so nothing is trusted before it is checked.
function parseTodoDataList(value: unknown): TodoData[] {
  if (!Array.isArray(value)) {
    throw new Error("JSON 檔案的內容必須是陣列");
  }
  const items: unknown[] = value;
  const result: TodoData[] = [];
  for (const item of items) {
    if (!isTodoData(item)) {
      throw new Error("JSON 檔案裡有一筆資料不是待辦事項");
    }
    result.push(item);
  }
  return result;
}

// The next id is one more than the biggest id in use, starting from 1.
function nextId(items: readonly TodoData[]): number {
  let maxId = 0;
  for (const item of items) {
    if (item.id > maxId) {
      maxId = item.id;
    }
  }
  return maxId + 1;
}

// Stores the todos in one JSON file whose content is a TodoData[] array.
// The data survives after the program ends.
//
// Every method follows the same pattern: read the whole file, work on the
// array (the Day 04 patterns), write the whole file back.
export class JsonFileTodoRepository implements TodoRepository {
  readonly #filePath: string;

  constructor(filePath: string) {
    this.#filePath = filePath;
  }

  // C
  async create(input: NewTodo): Promise<Todo> {
    const items = await this.#readAll();
    // An invalid title makes `new Todo(...)` throw, so nothing is written.
    const todo = new Todo(nextId(items), input.title, input.priority);
    await this.#writeAll([...items, todo.toData()]);
    return todo;
  }

  // R
  async findAll(): Promise<Todo[]> {
    const items = await this.#readAll();
    return items.map((item) => Todo.fromData(item));
  }

  // R
  async findById(id: number): Promise<Todo | undefined> {
    const items = await this.#readAll();
    const found = items.find((item) => item.id === id);
    if (found === undefined) {
      return undefined;
    }
    return Todo.fromData(found);
  }

  // U: a todo with an unknown id changes nothing.
  async save(todo: Todo): Promise<void> {
    const items = await this.#readAll();
    const data = todo.toData();
    const updated = items.map((item) => (item.id === data.id ? data : item));
    await this.#writeAll(updated);
  }

  // D
  async delete(id: number): Promise<boolean> {
    const items = await this.#readAll();
    const remaining = items.filter((item) => item.id !== id);
    if (remaining.length === items.length) {
      return false;
    }
    await this.#writeAll(remaining);
    return true;
  }

  // Private helper: file -> TodoData[]. A missing file means "no todos yet".
  async #readAll(): Promise<TodoData[]> {
    const file = Bun.file(this.#filePath);
    if (!(await file.exists())) {
      return [];
    }
    const parsed: unknown = await file.json();
    return parseTodoDataList(parsed);
  }

  // Private helper: TodoData[] -> file. Bun.write creates the folder if needed.
  async #writeAll(items: readonly TodoData[]): Promise<void> {
    await Bun.write(this.#filePath, JSON.stringify(items, null, 2));
  }
}
