import type { Priority, Todo } from "./todo.ts";

export type NewTodo = { title: string; priority: Priority };

// The contract every storage implementation follows.
// Day 11: storage can be slow (files, databases), so every method now
// returns a Promise.
export interface TodoRepository {
  // C: stores a new todo and gives it the next id.
  create(input: NewTodo): Promise<Todo>;
  // R: every todo, ordered by id.
  findAll(): Promise<Todo[]>;
  // R: one todo, or undefined when the id does not exist.
  findById(id: number): Promise<Todo | undefined>;
  // U: writes the current state of an existing todo back to storage.
  // Does nothing when the id does not exist.
  save(todo: Todo): Promise<void>;
  // D: resolves to true when something was really deleted.
  delete(id: number): Promise<boolean>;
}
