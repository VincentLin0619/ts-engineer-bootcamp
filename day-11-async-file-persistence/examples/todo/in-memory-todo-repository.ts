// Todo mainline: a TodoRepository that keeps everything in memory.
// Changed on Day 11: every method is `async`, to match the new contract.
//
// This file only defines things, so running it prints nothing.
// Run cli.ts in this folder to see it at work.

import type { TodoData } from "./todo.ts";
import { Todo } from "./todo.ts";
import type { NewTodo, TodoRepository } from "./todo-repository.ts";

// `implements TodoRepository`: TypeScript checks that this class provides
// every method of the contract, with matching parameter and return types.
//
// Nothing in here is slow. The methods are `async` only because the
// contract says "return a Promise": an async function wraps whatever it
// returns in a Promise.
export class InMemoryTodoRepository implements TodoRepository {
  // The storage: an array of plain data. It is private, so the five
  // methods below are the only way in and out.
  #rows: TodoData[] = [];
  // Ids start at 1 and only go up. A deleted id is never handed out again.
  #nextId = 1;

  // C
  async create(input: NewTodo): Promise<Todo> {
    // An invalid title makes `new Todo(...)` throw, so nothing is stored
    // and the id is not used up.
    const todo = new Todo(this.#nextId, input.title, input.priority);
    this.#nextId = this.#nextId + 1;
    this.#rows.push(todo.toData());
    return todo;
  }

  // R: every call builds fresh Todo instances from the stored data.
  async findAll(): Promise<Todo[]> {
    return this.#rows.map((row) => Todo.fromData(row));
  }

  // R
  async findById(id: number): Promise<Todo | undefined> {
    const row = this.#rows.find((item) => item.id === id);
    if (row === undefined) {
      return undefined;
    }
    return Todo.fromData(row);
  }

  // U: replace the stored row that has the same id (the Day 04 pattern).
  // A todo with an unknown id changes nothing.
  async save(todo: Todo): Promise<void> {
    const data = todo.toData();
    this.#rows = this.#rows.map((row) => (row.id === data.id ? data : row));
  }

  // D
  async delete(id: number): Promise<boolean> {
    const countBefore = this.#rows.length;
    this.#rows = this.#rows.filter((row) => row.id !== id);
    return this.#rows.length < countBefore;
  }
}
