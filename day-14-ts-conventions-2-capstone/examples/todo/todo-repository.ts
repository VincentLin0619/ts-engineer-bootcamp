import type { Priority, Todo } from "./todo.ts";

export type NewTodo = { title: string; priority: Priority };

// Day 14: the storage contract no longer mentions Todo. It has two blanks
// (type parameters) that are filled in by whoever uses it:
//   TEntity: what is stored
//   TNew:    what is needed to create one
export interface Repository<TEntity, TNew> {
  // C: stores a new entity and gives it the next id.
  create(input: TNew): Promise<TEntity>;
  // R: every entity, ordered by id.
  findAll(): Promise<TEntity[]>;
  // R: one entity, or undefined when the id does not exist.
  findById(id: number): Promise<TEntity | undefined>;
  // U: writes the current state of an existing entity back to storage.
  // Does nothing when the id does not exist.
  save(entity: TEntity): Promise<void>;
  // D: resolves to true when something was really deleted.
  delete(id: number): Promise<boolean>;
}

// The Todo version of the contract: both blanks filled in. The name and
// the methods are the same as on Day 13, so no other file has to change.
export type TodoRepository = Repository<Todo, NewTodo>;
