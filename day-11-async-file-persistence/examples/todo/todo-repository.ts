// Todo mainline: the contract for storing todos.
// Changed on Day 11: every method returns a Promise, because real storage
// (a file, a database) takes time to answer.
//
// This file contains types only, so running it prints nothing.
// Run cli.ts in this folder to see it at work.

import type { Priority, Todo } from "./todo.ts";

// What the caller provides to create a todo. There is no id on purpose:
// the repository hands out ids.
export type NewTodo = { title: string; priority: Priority };

// The contract. It says WHAT a todo storage can do, and nothing about HOW
// or WHERE the todos are kept.
export interface TodoRepository {
  // C: store a new todo and return it with its new id.
  create(input: NewTodo): Promise<Todo>;
  // R: every stored todo, ordered by id.
  findAll(): Promise<Todo[]>;
  // R: one todo, or undefined when no todo has this id.
  findById(id: number): Promise<Todo | undefined>;
  // U: store the current state of a todo that came out of this repository.
  save(todo: Todo): Promise<void>;
  // D: remove a todo. Tells whether something was really removed.
  delete(id: number): Promise<boolean>;
}
