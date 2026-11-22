// Todo mainline, Day 09: a TodoRepository that keeps everything in memory.
//
// This file only defines things, so running it prints nothing.
// Run the demo that uses it instead:
//   bun run day-09-oop-interfaces/examples/04-todo-repository.ts

import type { TodoData } from "./todo.ts";
import { Todo } from "./todo.ts";
import type { NewTodo, TodoRepository } from "./todo-repository.ts";

// `implements TodoRepository`: TypeScript checks that this class provides
// every method of the contract, with matching parameter and return types.
export class InMemoryTodoRepository implements TodoRepository {
  // The storage: an array of plain data. It is private, so the five
  // methods below are the only way in and out.
  #rows: TodoData[] = [];
  // Ids start at 1 and only go up. A deleted id is never handed out again.
  #nextId = 1;

  // C
  create(input: NewTodo): Todo {
    // An invalid title makes `new Todo(...)` throw, so nothing is stored
    // and the id is not used up.
    const todo = new Todo(this.#nextId, input.title, input.priority);
    this.#nextId = this.#nextId + 1;
    this.#rows.push(todo.toData());
    return todo;
  }

  // R: every call builds fresh Todo instances from the stored data.
  findAll(): Todo[] {
    return this.#rows.map((row) => Todo.fromData(row));
  }

  // R
  findById(id: number): Todo | undefined {
    const row = this.#rows.find((item) => item.id === id);
    if (row === undefined) {
      return undefined;
    }
    return Todo.fromData(row);
  }

  // U: replace the stored row that has the same id (the Day 04 pattern).
  // A todo with an unknown id changes nothing.
  save(todo: Todo): void {
    const data = todo.toData();
    this.#rows = this.#rows.map((row) => (row.id === data.id ? data : row));
  }

  // D
  delete(id: number): boolean {
    const countBefore = this.#rows.length;
    this.#rows = this.#rows.filter((row) => row.id !== id);
    return this.#rows.length < countBefore;
  }
}
