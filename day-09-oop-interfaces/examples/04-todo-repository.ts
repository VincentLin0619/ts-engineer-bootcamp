// Run from the project root:
//   bun run day-09-oop-interfaces/examples/04-todo-repository.ts
//
// A tour of today's Todo mainline: the TodoRepository contract and its
// in-memory implementation.

import { InMemoryTodoRepository } from "./todo/in-memory-todo-repository.ts";
import type { Priority } from "./todo/todo.ts";
import type { TodoRepository } from "./todo/todo-repository.ts";

function priorityLabel(priority: Priority): string {
  switch (priority) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
  }
}

// Written against the interface: this function works with ANY repository,
// including the ones that do not exist yet (JSON file on Day 11, SQLite on
// Day 12).
function printAll(repository: TodoRepository): void {
  for (const todo of repository.findAll()) {
    const mark = todo.done ? "x" : " ";
    console.log(
      `  [${mark}] #${todo.id} ${todo.title}（優先度：${priorityLabel(todo.priority)}）`,
    );
  }
}

// The variable has the interface type. `new InMemoryTodoRepository()` is
// the only place in this file that names the implementation.
const repository: TodoRepository = new InMemoryTodoRepository();

// C: the repository hands out the ids.
const milk = repository.create({ title: "買牛奶", priority: "medium" });
const report = repository.create({ title: "寫報告", priority: "high" });
console.log(`新增：#${milk.id}、#${report.id}`);
printAll(repository);

// R: one todo by id, or undefined.
const found = repository.findById(2);
if (found !== undefined) {
  console.log(`找到 #2：${found.title}`);
}
console.log(`找 #99：${repository.findById(99)}`);

// U, part 1: the repository hands out copies. Changing a copy does not
// change what is stored.
milk.complete();
console.log("呼叫 milk.complete() 之後，還沒 save：");
printAll(repository);

// U, part 2: save() stores the new state.
repository.save(milk);
console.log("save(milk) 之後：");
printAll(repository);

// D: the boolean tells whether something was really deleted.
console.log(`刪除 #2：${repository.delete(2)}`);
console.log(`再刪一次 #2：${repository.delete(2)}`);
printAll(repository);

// Ids are never reused, even after a delete.
const trash = repository.create({ title: "倒垃圾", priority: "low" });
console.log(`新增：#${trash.id}`);

// The Todo class still guards its own rule inside the repository.
try {
  repository.create({ title: "   ", priority: "low" });
} catch (error) {
  if (error instanceof Error) {
    console.log(`新增失敗：${error.message}`);
  }
}
printAll(repository);
