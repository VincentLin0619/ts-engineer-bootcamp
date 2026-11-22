// Todo mainline, Day 10: the service layer.
//
// This file only defines things, so running it prints nothing.
// Run the CLI that uses it instead:
//   bun run day-10-oop-composition-layers/examples/todo/cli.ts

import { TodoNotFoundError, ValidationError } from "./errors.ts";
import type { Priority, Todo } from "./todo.ts";
import type { TodoRepository } from "./todo-repository.ts";

export type TodoFilter = "all" | "open" | "done";

// The service owns the rules that involve MORE than one todo, and the
// steps of every use case. It knows nothing about where todos are stored:
// it only talks to the TodoRepository interface.
export class TodoService {
  // Composition: the service HAS a repository. It is not a repository.
  readonly #repository: TodoRepository;

  // Constructor injection: whoever creates the service decides which
  // repository it works with.
  constructor(repository: TodoRepository) {
    this.#repository = repository;
  }

  add(title: string, priority: Priority = "medium"): Todo {
    this.#assertNoOpenDuplicate(title);
    // The Todo class checks the title itself (empty, too long).
    return this.#repository.create({ title, priority });
  }

  list(filter: TodoFilter = "all"): Todo[] {
    const todos = this.#repository.findAll();
    if (filter === "open") {
      return todos.filter((todo) => !todo.done);
    }
    if (filter === "done") {
      return todos.filter((todo) => todo.done);
    }
    return todos;
  }

  // Every change follows the same three steps: find, change, save.
  complete(id: number): Todo {
    const todo = this.#findOrThrow(id);
    todo.complete();
    this.#repository.save(todo);
    return todo;
  }

  rename(id: number, title: string): Todo {
    const todo = this.#findOrThrow(id);
    // A done todo may share its title with an open one, so only check
    // when the todo being renamed is still open.
    if (!todo.done) {
      this.#assertNoOpenDuplicate(title, id);
    }
    todo.rename(title);
    this.#repository.save(todo);
    return todo;
  }

  remove(id: number): void {
    const deleted = this.#repository.delete(id);
    if (!deleted) {
      throw new TodoNotFoundError(id);
    }
  }

  // Private helper: turns "undefined" from the repository into an error,
  // so the methods above can go on with a real Todo.
  #findOrThrow(id: number): Todo {
    const todo = this.#repository.findById(id);
    if (todo === undefined) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }

  // Private helper for the rule "no two open todos with the same title".
  // One Todo cannot check this alone: it takes a look at all of them.
  // `ignoredId` is the todo being renamed: it must not clash with itself.
  #assertNoOpenDuplicate(title: string, ignoredId?: number): void {
    const wantedTitle = title.trim();
    const duplicate = this.#repository
      .findAll()
      .some(
        (todo) =>
          !todo.done && todo.title === wantedTitle && todo.id !== ignoredId,
      );
    if (duplicate) {
      throw new ValidationError(`已經有一筆未完成的「${wantedTitle}」`);
    }
  }
}
