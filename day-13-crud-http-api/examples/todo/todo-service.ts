import { TodoNotFoundError, ValidationError } from "./errors.ts";
import type { Priority, Todo } from "./todo.ts";
import { validateTitle } from "./todo.ts";
import type { TodoRepository } from "./todo-repository.ts";

export type TodoFilter = "all" | "open" | "done";

// Business rules of the Todo app. It only knows the TodoRepository
// interface, never which implementation it was given.
export class TodoService {
  readonly #repository: TodoRepository;

  constructor(repository: TodoRepository) {
    this.#repository = repository;
  }

  async add(title: string, priority: Priority = "medium"): Promise<Todo> {
    const cleanTitle = validateTitle(title);
    await this.#ensureNoOpenDuplicate(cleanTitle);
    return this.#repository.create({ title: cleanTitle, priority });
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

  // Day 13: GET /todos/:id reads exactly one todo.
  async get(id: number): Promise<Todo> {
    return this.#findOrThrow(id);
  }

  async complete(id: number): Promise<Todo> {
    const todo = await this.#findOrThrow(id);
    todo.complete();
    await this.#repository.save(todo);
    return todo;
  }

  // Day 13: PATCH /todos/:id with { "done": false } is the reverse of
  // complete(). An open todo cannot share its title with another one.
  async reopen(id: number): Promise<Todo> {
    const todo = await this.#findOrThrow(id);
    todo.reopen();
    await this.#ensureNoOpenDuplicate(todo.title, todo.id);
    await this.#repository.save(todo);
    return todo;
  }

  async rename(id: number, title: string): Promise<Todo> {
    const todo = await this.#findOrThrow(id);
    todo.rename(title);
    if (!todo.done) {
      await this.#ensureNoOpenDuplicate(todo.title, todo.id);
    }
    await this.#repository.save(todo);
    return todo;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.#repository.delete(id);
    if (!deleted) {
      throw new TodoNotFoundError(id);
    }
  }

  async #findOrThrow(id: number): Promise<Todo> {
    const todo = await this.#repository.findById(id);
    if (todo === undefined) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }

  // Rule across many todos: two open todos cannot share a title.
  // `ignoredId` lets a todo keep its own title when it is renamed.
  async #ensureNoOpenDuplicate(
    title: string,
    ignoredId?: number,
  ): Promise<void> {
    const todos = await this.#repository.findAll();
    const duplicate = todos.some(
      (todo) => !todo.done && todo.title === title && todo.id !== ignoredId,
    );
    if (duplicate) {
      throw new ValidationError(`已經有一筆未完成的「${title}」`);
    }
  }
}
