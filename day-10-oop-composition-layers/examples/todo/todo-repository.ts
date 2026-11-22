// Todo mainline: the contract for storing todos. Unchanged since Day 09.
//
// This file contains types only, so running it prints nothing.
// Run the CLI that uses it instead:
//   bun run day-10-oop-composition-layers/examples/todo/cli.ts

import type { Priority, Todo } from "./todo.ts";

// What the caller provides to create a todo. There is no id on purpose:
// the repository hands out ids.
export type NewTodo = { title: string; priority: Priority };

// The contract. It says WHAT a todo storage can do, and nothing about HOW
// or WHERE the todos are kept.
export interface TodoRepository {
  // C: store a new todo and return it with its new id.
  create(input: NewTodo): Todo;
  // R: every stored todo.
  findAll(): Todo[];
  // R: one todo, or undefined when no todo has this id.
  findById(id: number): Todo | undefined;
  // U: store the current state of a todo that came out of this repository.
  save(todo: Todo): void;
  // D: remove a todo. Returns whether something was really removed.
  delete(id: number): boolean;
}
