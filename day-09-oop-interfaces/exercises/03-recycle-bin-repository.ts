// Exercise 03 (optional): a second implementation of the TodoRepository
// contract, plus a function written against the contract.
//
// Replace every `throw new Error(...)` line, then run: bun test day-09
//
// RecycleBinTodoRepository keeps the same contract as
// InMemoryTodoRepository, with one difference in HOW it works: delete()
// does not destroy a todo, it moves it to a recycle bin. Two extra methods
// look into the bin and take todos back out.
//
//   const repository = new RecycleBinTodoRepository();
//   repository.create({ title: "買牛奶", priority: "medium" }); // id 1
//   repository.create({ title: "寫報告", priority: "high" });   // id 2
//   repository.delete(1)       -> true
//   repository.findAll()       -> [#2]
//   repository.findById(1)     -> undefined
//   repository.findDeleted()   -> [#1]
//   repository.restore(1)      -> true
//   repository.findAll()       -> [#2, #1]   (a restored todo goes last)
//   repository.restore(1)      -> false      (it is not in the bin any more)

import type { TodoData } from "../examples/todo/todo.ts";
import { Todo } from "../examples/todo/todo.ts";
import type {
  NewTodo,
  TodoRepository,
} from "../examples/todo/todo-repository.ts";

export class RecycleBinTodoRepository implements TodoRepository {
  // The todos that are still in the list, as plain data.
  #rows: TodoData[] = [];
  // TODO: declare two more private fields:
  //   - the todos in the recycle bin, as plain data (type: TodoData[])
  //   - the id that the next new todo will get (starts at 1)

  // C: same behaviour as InMemoryTodoRepository. Ids start at 1 and are
  // never reused, not even for todos in the recycle bin.
  create(input: NewTodo): Todo {
    // TODO
    throw new Error("TODO：尚未完成 create");
  }

  // R: already written for you, as a model for the other methods.
  // It returns only the todos that are still in the list.
  findAll(): Todo[] {
    return this.#rows.map((row) => Todo.fromData(row));
  }

  // R: a todo that is still in the list, or undefined.
  // A todo in the recycle bin counts as not found.
  findById(id: number): Todo | undefined {
    // TODO
    throw new Error("TODO：尚未完成 findById");
  }

  // U: replace the stored row that has the same id.
  // Unknown ids and todos in the recycle bin are left alone.
  save(todo: Todo): void {
    // TODO
    throw new Error("TODO：尚未完成 save");
  }

  // D: move the row from the list to the recycle bin.
  // Returns true when a row was moved, false when the id is not in the list.
  delete(id: number): boolean {
    // TODO
    throw new Error("TODO：尚未完成 delete");
  }

  // Not part of the contract: the todos in the recycle bin.
  findDeleted(): Todo[] {
    // TODO
    throw new Error("TODO：尚未完成 findDeleted");
  }

  // Not part of the contract: move a row from the recycle bin back to the
  // END of the list. Returns true when a row was moved, false when the id
  // is not in the recycle bin.
  restore(id: number): boolean {
    // TODO
    throw new Error("TODO：尚未完成 restore");
  }
}

// Complete every open todo in a repository and store the change.
// Returns how many todos were changed by this call.
//
// It is written against the TodoRepository interface, so it has to work
// with InMemoryTodoRepository, with RecycleBinTodoRepository, and with
// every repository written in the coming days.
// Remember: a repository hands out copies, so every change needs save().
export function completeAll(repository: TodoRepository): number {
  // TODO: use only the five methods of the contract
  throw new Error("TODO：尚未完成 completeAll");
}
