// Todo mainline: the service layer.
// Changed on Day 11: every method is `async` and awaits the repository.
// The rules themselves are the same as on Day 10.
//
// This file only defines things, so running it prints nothing.
// Run cli.ts in this folder to see it at work.

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

  async add(title: string, priority: Priority = "medium"): Promise<Todo> {
    await this.#assertNoOpenDuplicate(title);
    // The Todo class checks the title itself (empty, too long).
    return await this.#repository.create({ title, priority });
  }

  async list(filter: TodoFilter = "all"): Promise<Todo[]> {
    const todos = await this.#repository.findAll();
    if (filter === "open") {
      return todos.filter((todo) => !todo.done);
    }
    if (filter === "done") {
      return todos.filter((todo) => todo.done);
    }
    return todos;
  }

  // Every change follows the same three steps: find, change, save.
  async complete(id: number): Promise<Todo> {
    const todo = await this.#findOrThrow(id);
    todo.complete();
    await this.#repository.save(todo);
    return todo;
  }

  async rename(id: number, title: string): Promise<Todo> {
    const todo = await this.#findOrThrow(id);
    // A done todo may share its title with an open one, so only check
    // when the todo being renamed is still open.
    if (!todo.done) {
      await this.#assertNoOpenDuplicate(title, id);
    }
    todo.rename(title);
    await this.#repository.save(todo);
    return todo;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.#repository.delete(id);
    if (!deleted) {
      throw new TodoNotFoundError(id);
    }
  }

  // Private helper: turns "undefined" from the repository into an error,
  // so the methods above can go on with a real Todo.
  async #findOrThrow(id: number): Promise<Todo> {
    const todo = await this.#repository.findById(id);
    if (todo === undefined) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }

  // Private helper for the rule "no two open todos with the same title".
  // One Todo cannot check this alone: it takes a look at all of them.
  // `ignoredId` is the todo being renamed: it must not clash with itself.
  async #assertNoOpenDuplicate(
    title: string,
    ignoredId?: number,
  ): Promise<void> {
    const wantedTitle = title.trim();
    const todos = await this.#repository.findAll();
    const duplicate = todos.some(
      (todo) =>
        !todo.done && todo.title === wantedTitle && todo.id !== ignoredId,
    );
    if (duplicate) {
      throw new ValidationError(`已經有一筆未完成的「${wantedTitle}」`);
    }
  }
}
