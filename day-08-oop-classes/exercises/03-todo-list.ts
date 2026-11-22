// Exercise 03 (optional): a TodoList class that owns a group of Todo
// instances. It uses today's Todo class from examples/todo/todo.ts.
//
// Replace every `throw new Error(...)` line, then run: bun test day-08
//
//   const list = new TodoList();
//   const milk = list.add("買牛奶");          // id 1, priority "medium"
//   const report = list.add("寫報告", "high"); // id 2
//   list.size             -> 2
//   list.openCount        -> 2
//   milk.complete();
//   list.openCount        -> 1
//   list.findById(2)      -> the same instance as `report`
//   list.findById(99)     -> undefined
//   list.completeAll()    -> 1   (only `report` was still open)
//   list.toData()         -> [{ id: 1, title: "買牛奶", done: true, ... }, ...]
//
//   const restored = TodoList.fromData(list.toData());
//   restored.add("倒垃圾").id -> 3   (continues after the largest id)

import type { Priority, TodoData } from "../examples/todo/todo.ts";
import { Todo } from "../examples/todo/todo.ts";

export class TodoList {
  // TODO: declare two private fields:
  //   #todos   the Todo instances in this list (type: Todo[])
  //   #nextId  the id that the next new todo will get (type: number)

  // Starts empty by default. When todos are passed in, keep a copy of the
  // array, and let the next id continue after the largest id among them.
  // With no todos, the next id is 1.
  constructor(todos: readonly Todo[] = []) {
    // TODO: fill in both private fields
    throw new Error("TODO：尚未完成 TodoList 的建構子");
  }

  // How many todos are in the list.
  get size(): number {
    // TODO
    throw new Error("TODO：尚未完成 size");
  }

  // How many todos are not done yet.
  get openCount(): number {
    // TODO
    throw new Error("TODO：尚未完成 openCount");
  }

  // Create a Todo with the next id, keep it in the list, and return it.
  // An invalid title makes `new Todo(...)` throw: let that error pass
  // through, and make sure the list did not grow.
  add(title: string, priority: Priority = "medium"): Todo {
    // TODO
    throw new Error("TODO：尚未完成 add");
  }

  // The todo with this id, or undefined.
  findById(id: number): Todo | undefined {
    // TODO
    throw new Error("TODO：尚未完成 findById");
  }

  // Complete every todo that is still open.
  // Return how many todos were changed by this call.
  completeAll(): number {
    // TODO
    throw new Error("TODO：尚未完成 completeAll");
  }

  // Plain data for every todo, in the same order.
  toData(): TodoData[] {
    // TODO: reuse todo.toData()
    throw new Error("TODO：尚未完成 toData");
  }

  // Build a TodoList from plain data. This one is already written for you:
  // it turns every item into a Todo, then hands them to the constructor.
  // It starts working as soon as your constructor does.
  static fromData(data: readonly TodoData[]): TodoList {
    return new TodoList(data.map((item) => Todo.fromData(item)));
  }
}
