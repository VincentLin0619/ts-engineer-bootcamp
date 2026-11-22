import type { TodoData } from "./todo.ts";
import { Todo } from "./todo.ts";
import type { NewTodo, TodoRepository } from "./todo-repository.ts";

// Keeps the data in an array. Everything is lost when the program ends.
//
// Nothing here is slow, but the contract says "return a Promise", so every
// method is `async`: an async function wraps its return value in a Promise.
export class InMemoryTodoRepository implements TodoRepository {
  #items: TodoData[] = [];
  #nextId = 1;

  async create(input: NewTodo): Promise<Todo> {
    const todo = new Todo(this.#nextId, input.title, input.priority);
    this.#nextId += 1;
    this.#items.push(todo.toData());
    return todo;
  }

  async findAll(): Promise<Todo[]> {
    // Hand out fresh Todo objects, the same way a file or a database would.
    return this.#items.map((item) => Todo.fromData(item));
  }

  async findById(id: number): Promise<Todo | undefined> {
    const found = this.#items.find((item) => item.id === id);
    return found === undefined ? undefined : Todo.fromData(found);
  }

  async save(todo: Todo): Promise<void> {
    this.#items = this.#items.map((item) =>
      item.id === todo.id ? todo.toData() : item,
    );
  }

  async delete(id: number): Promise<boolean> {
    const remaining = this.#items.filter((item) => item.id !== id);
    const deleted = remaining.length < this.#items.length;
    this.#items = remaining;
    return deleted;
  }
}
