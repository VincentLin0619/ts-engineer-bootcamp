// Run from the project root:
//   bun run day-08-oop-classes/examples/05-todo-class.ts
//
// A tour of today's Todo mainline: examples/todo/todo.ts

import type { Priority, TodoData } from "./todo/todo.ts";
import { Todo } from "./todo/todo.ts";

// Same one-line format as week 1: "[x] #2 寫作業（優先度：中）".
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

function describe(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${priorityLabel(todo.priority)}）`;
}

// 1. Create: priority defaults to "medium", done defaults to false.
const milk = new Todo(1, "  買牛奶  ");
const report = new Todo(2, "寫報告", "high");
console.log(describe(milk));
console.log(describe(report));

// 2. Change state through methods only.
milk.rename("買低脂牛奶");
milk.changePriority("low");
milk.complete();
console.log(describe(milk));

milk.reopen();
console.log(describe(milk));

// 3. The class protects its own rule: constructor and rename() both check.
try {
  new Todo(3, "   ");
} catch (error) {
  if (error instanceof Error) {
    console.log(`建立失敗：${error.message}`);
  }
}

try {
  report.rename("   ");
} catch (error) {
  if (error instanceof Error) {
    console.log(`改名失敗：${error.message}`);
  }
}
console.log(describe(report)); // unchanged: a failed rename leaves no trace

// 4. toData(): instance -> plain data.
const data: TodoData = report.toData();
console.log(data);

// 5. Todo.fromData(): plain data -> instance. It goes through the
//    constructor, so data with a bad title is rejected here as well.
const restored = Todo.fromData(data);
console.log(describe(restored));
console.log(restored === report); // false: a separate instance

try {
  Todo.fromData({ id: 9, title: "", done: false, priority: "low" });
} catch (error) {
  if (error instanceof Error) {
    console.log(`還原失敗：${error.message}`);
  }
}
