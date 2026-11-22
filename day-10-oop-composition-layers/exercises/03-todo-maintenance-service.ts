// Exercise 03 (optional): a second service on top of today's Todo mainline.
//
// Replace every `throw new Error(...)` line, then run: bun test day-10
//
// TodoMaintenanceService is composed with a TodoRepository, exactly like
// TodoService. Both services can share one repository:
//
//   const repository = new InMemoryTodoRepository();
//   const todoService = new TodoService(repository);
//   const maintenance = new TodoMaintenanceService(repository);
//
//   todoService.add("買牛奶");   // #1
//   todoService.add("寫報告");   // #2
//   todoService.complete(1);
//   maintenance.summary()        -> { total: 2, open: 1, done: 1 }
//   maintenance.reopen(1).done   -> false
//   todoService.complete(2);
//   maintenance.clearDone()      -> 1   (#2 is deleted)
//   maintenance.summary()        -> { total: 1, open: 1, done: 0 }

import { TodoNotFoundError, ValidationError } from "../examples/todo/errors.ts";
import type { Todo } from "../examples/todo/todo.ts";
import type { TodoRepository } from "../examples/todo/todo-repository.ts";

export type TodoSummary = { total: number; open: number; done: number };

export class TodoMaintenanceService {
  // TODO: declare a private field that holds the repository

  // Constructor injection: depend on the TodoRepository interface only.
  constructor(repository: TodoRepository) {
    // TODO: keep the repository in the private field
    throw new Error("TODO：尚未完成 TodoMaintenanceService 的建構子");
  }

  // Count all todos, the open ones and the done ones.
  summary(): TodoSummary {
    // TODO
    throw new Error("TODO：尚未完成 summary");
  }

  // Reopen a todo and return it. Follow the three steps: find, change, save.
  // - No todo has this id: throw new TodoNotFoundError(id)
  // - The todo is already open: return it unchanged.
  // - ANOTHER open todo has the same title: reopening would break the rule
  //   "no two open todos with the same title", so
  //     throw new ValidationError(`已經有一筆未完成的「${todo.title}」`)
  //   and save nothing.
  reopen(id: number): Todo {
    // TODO
    throw new Error("TODO：尚未完成 reopen");
  }

  // Delete every done todo. Return how many were deleted.
  clearDone(): number {
    // TODO: use only methods of the TodoRepository interface
    throw new Error("TODO：尚未完成 clearDone");
  }
}
