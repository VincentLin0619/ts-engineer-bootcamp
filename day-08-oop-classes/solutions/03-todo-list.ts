// Reference solution for exercise 03.

import type { Priority, TodoData } from "../examples/todo/todo.ts";
import { Todo } from "../examples/todo/todo.ts";

export class TodoList {
  #todos: Todo[];
  #nextId: number;

  constructor(todos: readonly Todo[] = []) {
    // Copy the array, so changes to the caller's array do not leak in here.
    this.#todos = [...todos];

    let largestId = 0;
    for (const todo of todos) {
      if (todo.id > largestId) {
        largestId = todo.id;
      }
    }
    this.#nextId = largestId + 1;
  }

  get size(): number {
    return this.#todos.length;
  }

  get openCount(): number {
    return this.#todos.filter((todo) => !todo.done).length;
  }

  add(title: string, priority: Priority = "medium"): Todo {
    // When the title is invalid this line throws, and nothing below runs:
    // the list does not grow and the id is not used up.
    const todo = new Todo(this.#nextId, title, priority);
    this.#nextId = this.#nextId + 1;
    this.#todos.push(todo);
    return todo;
  }

  findById(id: number): Todo | undefined {
    return this.#todos.find((todo) => todo.id === id);
  }

  completeAll(): number {
    const openTodos = this.#todos.filter((todo) => !todo.done);
    for (const todo of openTodos) {
      todo.complete();
    }
    return openTodos.length;
  }

  toData(): TodoData[] {
    return this.#todos.map((todo) => todo.toData());
  }

  static fromData(data: readonly TodoData[]): TodoList {
    return new TodoList(data.map((item) => Todo.fromData(item)));
  }
}
