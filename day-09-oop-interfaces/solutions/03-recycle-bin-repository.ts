// Reference solution for exercise 03.

import type { TodoData } from "../examples/todo/todo.ts";
import { Todo } from "../examples/todo/todo.ts";
import type {
  NewTodo,
  TodoRepository,
} from "../examples/todo/todo-repository.ts";

export class RecycleBinTodoRepository implements TodoRepository {
  #rows: TodoData[] = [];
  #deletedRows: TodoData[] = [];
  #nextId = 1;

  create(input: NewTodo): Todo {
    const todo = new Todo(this.#nextId, input.title, input.priority);
    this.#nextId = this.#nextId + 1;
    this.#rows.push(todo.toData());
    return todo;
  }

  findAll(): Todo[] {
    return this.#rows.map((row) => Todo.fromData(row));
  }

  findById(id: number): Todo | undefined {
    const row = this.#rows.find((item) => item.id === id);
    if (row === undefined) {
      return undefined;
    }
    return Todo.fromData(row);
  }

  save(todo: Todo): void {
    const data = todo.toData();
    this.#rows = this.#rows.map((row) => (row.id === data.id ? data : row));
  }

  delete(id: number): boolean {
    const row = this.#rows.find((item) => item.id === id);
    if (row === undefined) {
      return false;
    }
    this.#rows = this.#rows.filter((item) => item.id !== id);
    this.#deletedRows.push(row);
    return true;
  }

  findDeleted(): Todo[] {
    return this.#deletedRows.map((row) => Todo.fromData(row));
  }

  restore(id: number): boolean {
    const row = this.#deletedRows.find((item) => item.id === id);
    if (row === undefined) {
      return false;
    }
    this.#deletedRows = this.#deletedRows.filter((item) => item.id !== id);
    this.#rows.push(row);
    return true;
  }
}

export function completeAll(repository: TodoRepository): number {
  const openTodos = repository.findAll().filter((todo) => !todo.done);
  for (const todo of openTodos) {
    todo.complete();
    // Without save() only the copy in this function would change.
    repository.save(todo);
  }
  return openTodos.length;
}
