// Reference solution for exercise 03.

import { TodoNotFoundError, ValidationError } from "../examples/todo/errors.ts";
import type { Todo } from "../examples/todo/todo.ts";
import type { TodoRepository } from "../examples/todo/todo-repository.ts";

export type TodoSummary = { total: number; open: number; done: number };

export class TodoMaintenanceService {
  readonly #repository: TodoRepository;

  constructor(repository: TodoRepository) {
    this.#repository = repository;
  }

  summary(): TodoSummary {
    const todos = this.#repository.findAll();
    const done = todos.filter((todo) => todo.done).length;
    return { total: todos.length, open: todos.length - done, done };
  }

  reopen(id: number): Todo {
    const todo = this.#repository.findById(id);
    if (todo === undefined) {
      throw new TodoNotFoundError(id);
    }
    if (!todo.done) {
      return todo;
    }

    // A rule across several todos: it belongs in a service, because one
    // Todo cannot see the others.
    const duplicate = this.#repository
      .findAll()
      .some(
        (other) =>
          !other.done && other.title === todo.title && other.id !== todo.id,
      );
    if (duplicate) {
      throw new ValidationError(`已經有一筆未完成的「${todo.title}」`);
    }

    todo.reopen();
    this.#repository.save(todo);
    return todo;
  }

  clearDone(): number {
    const doneTodos = this.#repository.findAll().filter((todo) => todo.done);
    for (const todo of doneTodos) {
      this.#repository.delete(todo.id);
    }
    return doneTodos.length;
  }
}
